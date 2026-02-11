/**
 * Overview Report Export API
 * GET /api/reports/overview/export
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest) {
  try {
    const scope = await getClientScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "excel"; // excel or pdf

    // Get date ranges
    const now = new Date();
    const last30Days = subDays(now, 30);
    const last7Days = subDays(now, 7);

    // Fetch all reviews
    const [allReviews, last30Reviews, last7Reviews] = await Promise.all([
      prisma.review.findMany({
        where: {
          ...(scope.isAdmin
            ? { userId: scope.userId }
            : { profile: { clientId: scope.clientId! } }),
          isArchived: false,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
        },
      }),
      prisma.review.count({
        where: {
          ...(scope.isAdmin
            ? { userId: scope.userId }
            : { profile: { clientId: scope.clientId! } }),
          isArchived: false,
          createdAt: { gte: last30Days },
        },
      }),
      prisma.review.count({
        where: {
          ...(scope.isAdmin
            ? { userId: scope.userId }
            : { profile: { clientId: scope.clientId! } }),
          isArchived: false,
          createdAt: { gte: last7Days },
        },
      }),
    ]);

    // Calculate metrics
    const totalReviews = allReviews.length;
    const statusCounts: Record<string, number> = {};
    allReviews.forEach((r) => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });

    const liveReviews = (statusCounts["LIVE"] || 0) + (statusCounts["DONE"] || 0);
    const pendingReviews = statusCounts["PENDING"] || 0;
    const inProgressReviews = statusCounts["IN_PROGRESS"] || 0;
    const missingReviews = statusCounts["MISSING"] || 0;
    const errorReviews = statusCounts["GOOGLE_ISSUE"] || 0;
    const issueReviews = missingReviews + errorReviews;
    const successRate = totalReviews > 0 ? Math.round((liveReviews / totalReviews) * 100) : 0;

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

    // Prepare Excel data
    const overviewData = [
      { Metric: "Total Reviews", Value: totalReviews, Change: `+${last30Reviews} (Last 30 days)` },
      { Metric: "Live Reviews", Value: liveReviews, Change: `${successRate}% Success Rate` },
      { Metric: "Pending", Value: pendingReviews, Change: `${inProgressReviews} In Progress` },
      { Metric: "Issues", Value: issueReviews, Change: `${missingReviews} Missing, ${errorReviews} Errors` },
      { Metric: "Avg Completion Time", Value: `${avgCompletionDays} days`, Change: "Time to go live" },
      { Metric: "Last 7 Days", Value: last7Reviews, Change: "New reviews this week" },
    ];

    const statusBreakdown = [
      { Status: "PENDING", Count: statusCounts["PENDING"] || 0 },
      { Status: "IN_PROGRESS", Count: statusCounts["IN_PROGRESS"] || 0 },
      { Status: "APPLIED", Count: statusCounts["APPLIED"] || 0 },
      { Status: "MISSING", Count: statusCounts["MISSING"] || 0 },
      { Status: "GOOGLE_ISSUE", Count: statusCounts["GOOGLE_ISSUE"] || 0 },
      { Status: "LIVE", Count: statusCounts["LIVE"] || 0 },
      { Status: "DONE", Count: statusCounts["DONE"] || 0 },
    ];

    if (format === "pdf") {
      // Generate PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text("Overview Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

      // KPI Metrics Table
      doc.setFontSize(14);
      doc.text("Key Performance Indicators", 14, 40);

      autoTable(doc, {
        startY: 45,
        head: [["Metric", "Value", "Details"]],
        body: overviewData.map((row) => [row.Metric, row.Value.toString(), row.Change]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }, // Indigo
        styles: { fontSize: 10 },
      });

      // Status Breakdown Table
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      doc.setFontSize(14);
      doc.text("Status Breakdown", 14, finalY + 15);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Status", "Count"]],
        body: statusBreakdown.map((row) => [row.Status, row.Count.toString()]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10 },
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      const filename = `Overview_Report_${new Date().toISOString().split("T")[0]}.pdf`;

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Generate Excel
      const workbook = XLSX.utils.book_new();

      // Overview sheet
      const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
      overviewSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, overviewSheet, "Overview");

      // Status breakdown sheet
      const statusSheet = XLSX.utils.json_to_sheet(statusBreakdown);
      statusSheet["!cols"] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, statusSheet, "Status Breakdown");

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      const filename = `Overview_Report_${new Date().toISOString().split("T")[0]}.xlsx`;

      return new NextResponse(buffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export overview report" },
      { status: 500 }
    );
  }
}
