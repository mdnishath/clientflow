/**
 * Worker Performance Export API
 * GET /api/reports/performance/export
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
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
        userId: scope.userId,
        liveById: { not: null },
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
        const [totalReviews, liveReviews, last30Reviews, createdReviews] =
          await Promise.all([
            // Reviews where worker made them live
            prisma.review.count({
              where: {
                liveById: worker.id,
                status: { in: ["LIVE", "DONE"] },
              },
            }),
            // Current live reviews
            prisma.review.count({
              where: {
                liveById: worker.id,
                status: "LIVE",
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
            // Reviews created by worker
            prisma.review.count({
              where: {
                createdById: worker.id,
              },
            }),
          ]);

        // Get average completion time for this worker
        const completedReviews = await prisma.review.findMany({
          where: {
            liveById: worker.id,
            status: { in: ["LIVE", "DONE"] },
            liveAt: { not: null },
          },
          select: {
            createdAt: true,
            liveAt: true,
          },
        });

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
          "Worker Name": worker.name || "Unknown",
          Email: worker.email,
          "Total Live Reviews": totalReviews,
          "Current Live": liveReviews,
          "Last 30 Days": last30Reviews,
          "Reviews Created": createdReviews,
          "Avg Completion (days)": avgDays || "-",
          "Performance Score": totalReviews > 0 ? Math.round((liveReviews / totalReviews) * 100) : 0,
        };
      })
    );

    // Sort by total live reviews
    workerStats.sort((a, b) => b["Total Live Reviews"] - a["Total Live Reviews"]);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(workerStats);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 25 }, // Worker Name
      { wch: 30 }, // Email
      { wch: 18 }, // Total Live Reviews
      { wch: 15 }, // Current Live
      { wch: 15 }, // Last 30 Days
      { wch: 18 }, // Reviews Created
      { wch: 20 }, // Avg Completion
      { wch: 18 }, // Performance Score
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Worker Performance");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `Worker_Performance_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export performance report" },
      { status: 500 }
    );
  }
}
