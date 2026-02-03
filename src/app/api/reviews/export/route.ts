/**
 * Reviews Export API
 *
 * GET /api/reviews/export?filter=all|live|missing|error
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get filter from query params
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";
    const statusFilter = searchParams.get("status") || "all";

    // Build where clause
    const where: any = {
      userId: session.user.id,
      isArchived: false,
    };

    // Apply check status filter
    if (filter !== "all") {
      const filterMap: Record<string, string> = {
        live: "LIVE",
        missing: "MISSING",
        error: "ERROR",
      };
      where.checkStatus = filterMap[filter];
    }

    // Apply review status filter
    if (statusFilter !== "all") {
      where.status = statusFilter;
    }

    // Fetch reviews
    const reviews = await prisma.review.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            businessName: true,
            gmbLink: true,
            category: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Debug: Log first review to check category data
    if (reviews.length > 0) {
      console.log("📊 Export sample data:", {
        businessName: reviews[0].profile.businessName,
        category: reviews[0].profile.category,
        hasCategory: !!reviews[0].profile.category,
      });
    }

    // Transform data for Excel
    const excelData = reviews.map((review) => {
      console.log(`Export row - Business: ${review.profile.businessName}, Category: ${review.profile.category || 'EMPTY'}`);
      return {
        "Business Name": review.profile.businessName,
        "Client": review.profile.client.name,
        "Category": review.profile.category?.trim() || "-",
        "Review Text": review.reviewText || "N/A",
        "Email Used": review.emailUsed || "N/A",
        "Status": review.status,
        "Check Status": review.checkStatus || "Not Checked",
        "Last Checked": review.lastCheckedAt
          ? new Date(review.lastCheckedAt).toLocaleString()
          : "Never",
        "Review Link": review.reviewLiveLink || "N/A",
        "GMB Link": review.profile.gmbLink || "N/A",
        "Due Date": review.dueDate
          ? new Date(review.dueDate).toLocaleDateString()
          : "N/A",
        "Created At": new Date(review.createdAt).toLocaleString(),
        "Notes": review.notes || "",
      };
    });

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 30 }, // Business Name
      { wch: 20 }, // Client
      { wch: 15 }, // Category
      { wch: 50 }, // Review Text
      { wch: 25 }, // Email Used
      { wch: 15 }, // Status
      { wch: 15 }, // Check Status
      { wch: 20 }, // Last Checked
      { wch: 40 }, // Review Link
      { wch: 40 }, // GMB Link
      { wch: 15 }, // Due Date
      { wch: 20 }, // Created At
      { wch: 30 }, // Notes
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Determine filename based on filter
    const filterName = filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1);
    const filename = `Reviews_${filterName}_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Return file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export reviews" },
      { status: 500 }
    );
  }
}
