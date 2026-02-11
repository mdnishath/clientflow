/**
 * Worker Performance Data API
 * GET /api/reports/workers
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const scope = await getClientScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can view worker performance
    if (!scope.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const last30Days = subDays(new Date(), 30);

    // Get all unique workers who have made reviews live
    const reviewsWithWorkers = await prisma.review.findMany({
      where: {
        userId: scope.userId, // Reviews belong to admin
        liveById: { not: null }, // Has a worker who made it live
      },
      select: {
        liveById: true,
        liveBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      distinct: ["liveById"],
    });

    const workers = reviewsWithWorkers
      .filter((r) => r.liveBy)
      .map((r) => r.liveBy!);

    // Get review stats for each worker
    const workerStats = await Promise.all(
      workers.map(async (worker) => {
        const [totalLive, last30Reviews, completedReviews] = await Promise.all([
          // Reviews where worker made them live
          prisma.review.count({
            where: {
              liveById: worker.id,
              status: { in: ["LIVE", "DONE"] },
            },
          }),
          // Last 30 days
          prisma.review.count({
            where: {
              liveById: worker.id,
              liveAt: { gte: last30Days },
              status: { in: ["LIVE", "DONE"] },
            },
          }),
          // Get reviews with completion time
          prisma.review.findMany({
            where: {
              liveById: worker.id,
              status: { in: ["LIVE", "DONE"] },
              liveAt: { not: null },
            },
            select: {
              createdAt: true,
              liveAt: true,
            },
            take: 100, // Sample for performance
          }),
        ]);

        // Calculate average completion time
        let avgDays = 0;
        if (completedReviews.length > 0) {
          const totalDays = completedReviews.reduce((sum, r) => {
            const days = Math.floor(
              (new Date(r.liveAt!).getTime() - new Date(r.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0);
          avgDays = Math.round(totalDays / completedReviews.length);
        }

        return {
          id: worker.id,
          name: worker.name || "Unknown",
          email: worker.email,
          totalLive,
          last30Days: last30Reviews,
          avgDays,
        };
      })
    );

    // Sort by total live reviews
    workerStats.sort((a, b) => b.totalLive - a.totalLive);

    return NextResponse.json(workerStats);
  } catch (error) {
    console.error("Worker stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch worker performance" },
      { status: 500 }
    );
  }
}
