/**
 * Profiles Export API
 *
 * GET /api/profiles/export
 *
 * Query Parameters:
 * - category: specific category slug
 * - search: search by business name
 * - completed: true|false (completed profiles)
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
    const categoryFilter = searchParams.get("category");
    const searchFilter = searchParams.get("search");
    const completedFilter = searchParams.get("completed");

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    // Apply category filter
    if (categoryFilter && categoryFilter !== "all") {
      where.category = categoryFilter;
    }

    // Apply search filter
    if (searchFilter) {
      where.businessName = {
        contains: searchFilter,
        mode: "insensitive",
      };
    }

    // Fetch profiles with review counts
    const profiles = await prisma.gmbProfile.findMany({
      where,
      include: {
        client: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: {
                status: { in: ["LIVE", "DONE"] },
                isArchived: false,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Apply completion filter (client-side)
    let filteredProfiles = profiles;
    if (completedFilter === "true") {
      filteredProfiles = profiles.filter(
        (p) =>
          p.reviewOrdered &&
          p.reviewOrdered > 0 &&
          p._count.reviews >= p.reviewOrdered
      );
    } else if (completedFilter === "false") {
      filteredProfiles = profiles.filter(
        (p) =>
          !p.reviewOrdered ||
          p.reviewOrdered === 0 ||
          p._count.reviews < p.reviewOrdered
      );
    }

    // Transform data for Excel
    const excelData = filteredProfiles.map((profile) => {
      const liveCount = profile._count.reviews;
      const ordered = profile.reviewOrdered || 0;
      const completionStatus =
        ordered > 0
          ? liveCount >= ordered
            ? "✓ Completed"
            : `${liveCount}/${ordered} (${Math.round((liveCount / ordered) * 100)}%)`
          : "No Order";

      return {
        "Business Name": profile.businessName,
        Client: profile.client.name,
        Category: profile.category || "-",
        "GMB Link": profile.gmbLink || "N/A",
        "Review Limit": profile.reviewLimit || "-",
        "Reviews Ordered": ordered || "-",
        "Live Reviews": liveCount,
        "Completion Status": completionStatus,
        "Start Date": profile.reviewsStartDate
          ? new Date(profile.reviewsStartDate).toLocaleDateString()
          : "N/A",
        Archived: profile.isArchived ? "Yes" : "No",
        "Created At": new Date(profile.createdAt).toLocaleString(),
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
      { wch: 40 }, // GMB Link
      { wch: 12 }, // Review Limit
      { wch: 15 }, // Reviews Ordered
      { wch: 12 }, // Live Reviews
      { wch: 20 }, // Completion Status
      { wch: 15 }, // Start Date
      { wch: 10 }, // Archived
      { wch: 20 }, // Created At
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Profiles");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Determine filename based on filter
    let filterName = "All";
    if (completedFilter === "true") filterName = "Completed";
    else if (completedFilter === "false") filterName = "Incomplete";
    if (categoryFilter && categoryFilter !== "all")
      filterName += `_${categoryFilter}`;

    const filename = `Profiles_${filterName}_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Return file
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
      { error: "Failed to export profiles" },
      { status: 500 }
    );
  }
}
