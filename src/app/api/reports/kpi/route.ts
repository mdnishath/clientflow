/**
 * KPI Data API
 * GET /api/reports/kpi
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const scope = await getClientScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const startDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 30);
    const endDate = to ? endOfDay(new Date(to)) : new Date();

    // Get all reviews in date range
    const allReviews = await prisma.review.findMany({
      where: {
        ...(scope.isAdmin
          ? { userId: scope.userId }
          : { profile: { clientId: scope.clientId! } }),
        isArchived: false,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Calculate metrics
    const totalReviews = allReviews.length;
    const statusCounts: Record<string, number> = {};
    allReviews.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const liveReviews = statusCounts["LIVE"] || 0;
    const doneReviews = statusCounts["DONE"] || 0;
    const pendingReviews = statusCounts["PENDING"] || 0;
    const missingReviews = statusCounts["MISSING"] || 0;
    const errorReviews = statusCounts["GOOGLE_ISSUE"] || 0;
    const issueReviews = missingReviews + errorReviews;
    const successRate = totalReviews > 0 ? Math.round(((liveReviews + doneReviews) / totalReviews) * 100) : 0;

    // Calculate average completion time
    const completedReviews = allReviews.filter((r) => r.completedAt);
    let avgCompletionDays = 0;
    if (completedReviews.length > 0) {
      const totalDays = completedReviews.reduce((sum, r) => {
        const days = Math.floor(
          (new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return sum + days;
      }, 0);
      avgCompletionDays = Math.round(totalDays / completedReviews.length);
    }

    // Last 30 days count
    const last30Days = await prisma.review.count({
      where: {
        ...(scope.isAdmin
          ? { userId: scope.userId }
          : { profile: { clientId: scope.clientId! } }),
        isArchived: false,
        createdAt: { gte: subDays(new Date(), 30) },
      },
    });

    // Last 7 days count
    const last7Days = await prisma.review.count({
      where: {
        ...(scope.isAdmin
          ? { userId: scope.userId }
          : { profile: { clientId: scope.clientId! } }),
        isArchived: false,
        createdAt: { gte: subDays(new Date(), 7) },
      },
    });

    return NextResponse.json({
      totalReviews,
      liveReviews,
      doneReviews,
      pendingReviews,
      issueReviews,
      successRate,
      last30Days,
      last7Days,
      avgCompletionDays,
    });
  } catch (error) {
    console.error("KPI fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPI data" },
      { status: 500 }
    );
  }
}
