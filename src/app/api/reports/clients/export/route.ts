/**
 * Client Rankings Export API
 * GET /api/reports/clients/export
 */

import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { startOfDay, endOfDay, subDays } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(request: NextRequest) {
  try {
    const scope = await getClientScope();
    if (!scope) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "excel";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const startDate = from ? startOfDay(new Date(from)) : subDays(new Date(), 30);
    const endDate = to ? endOfDay(new Date(to)) : new Date();

    // Get all reviews grouped by client
    const reviews = await prisma.review.findMany({
      where: {
        isArchived: false,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        profile: {
          client: scope.isAdmin
            ? { userId: scope.userId }
            : { id: scope.clientId! },
        },
      },
      select: {
        id: true,
        status: true,
        profile: {
          select: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by client and calculate stats
    const clientStats: Record<
      string,
      { id: string; name: string; totalReviews: number; liveReviews: number }
    > = {};

    reviews.forEach((review) => {
      const clientId = review.profile.client.id;
      const clientName = review.profile.client.name;

      if (!clientStats[clientId]) {
        clientStats[clientId] = {
          id: clientId,
          name: clientName,
          totalReviews: 0,
          liveReviews: 0,
        };
      }

      clientStats[clientId].totalReviews++;
      if (review.status === "LIVE" || review.status === "DONE") {
        clientStats[clientId].liveReviews++;
      }
    });

    // Calculate success rate and format
    const clientRankings = Object.values(clientStats)
      .map((client) => ({
        name: client.name,
        totalReviews: client.totalReviews,
        liveReviews: client.liveReviews,
        pendingReviews: client.totalReviews - client.liveReviews,
        successRate:
          client.totalReviews > 0
            ? Math.round((client.liveReviews / client.totalReviews) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalReviews - a.totalReviews); // Sort by total reviews

    if (format === "pdf") {
      // Generate PDF
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text("Client Performance Rankings", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      doc.text(
        `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        14,
        34
      );

      autoTable(doc, {
        startY: 42,
        head: [["Rank", "Client Name", "Total Reviews", "Live Reviews", "Pending", "Success Rate"]],
        body: clientRankings.map((client, idx) => [
          (idx + 1).toString(),
          client.name,
          client.totalReviews.toString(),
          client.liveReviews.toString(),
          client.pendingReviews.toString(),
          client.successRate + "%",
        ]),
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }, // Indigo
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 60 },
          2: { cellWidth: 25, halign: "center" },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 25, halign: "center" },
          5: { cellWidth: 30, halign: "center" },
        },
      });

      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      const filename = `Client_Rankings_${new Date().toISOString().split("T")[0]}.pdf`;

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Generate Excel
      const workbook = XLSX.utils.book_new();

      // Add metadata
      const metadata = [
        ["Client Performance Rankings"],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
        [],
      ];

      // Prepare data with rank
      const excelData = clientRankings.map((client, idx) => ({
        Rank: idx + 1,
        "Client Name": client.name,
        "Total Reviews": client.totalReviews,
        "Live Reviews": client.liveReviews,
        "Pending": client.pendingReviews,
        "Success Rate": `${client.successRate}%`,
      }));

      // Create worksheet from metadata and data
      const worksheet = XLSX.utils.aoa_to_sheet(metadata);
      XLSX.utils.sheet_add_json(worksheet, excelData, {
        origin: "A5",
      });

      // Set column widths
      worksheet["!cols"] = [
        { wch: 8 },  // Rank
        { wch: 30 }, // Client Name
        { wch: 15 }, // Total Reviews
        { wch: 15 }, // Live Reviews
        { wch: 12 }, // Pending
        { wch: 15 }, // Success Rate
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Client Rankings");

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      const filename = `Client_Rankings_${new Date().toISOString().split("T")[0]}.xlsx`;

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
      { error: "Failed to export client rankings" },
      { status: 500 }
    );
  }
}
