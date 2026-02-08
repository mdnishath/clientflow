import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "pdf";

    try {
        // Build where clause based on role
        const profileWhere = (scope.isAdmin || scope.isWorker)
            ? { isArchived: false, client: { userId: scope.userId } }
            : scope.clientId
                ? { clientId: scope.clientId, isArchived: false }
                : { id: "__no_data__" };

        // Fetch all profiles with reviewOrdered > 0
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                ...profileWhere,
                reviewOrdered: { gt: 0 },
            },
            select: {
                id: true,
                businessName: true,
                category: true,
                reviewOrdered: true,
                reviewLimit: true,
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
            orderBy: { businessName: "asc" },
        });

        // Calculate stats for each profile
        const profileData = profiles.map(p => {
            const liveCount = p._count.reviews;
            const ordered = p.reviewOrdered || 0;
            const remaining = Math.max(0, ordered - liveCount);
            const completionRate = ordered > 0 ? Math.round((liveCount / ordered) * 100) : 0;

            return {
                businessName: p.businessName,
                category: p.category || "N/A",
                clientName: p.client.name,
                reviewOrdered: ordered,
                reviewLimit: p.reviewLimit || 0,
                liveCount,
                remaining,
                completionRate,
            };
        });

        // Calculate summary
        const totalProfiles = profileData.length;
        const totalOrdered = profileData.reduce((sum, p) => sum + p.reviewOrdered, 0);
        const totalLive = profileData.reduce((sum, p) => sum + p.liveCount, 0);
        const totalRemaining = profileData.reduce((sum, p) => sum + p.remaining, 0);
        const avgCompletionRate = totalOrdered > 0
            ? Math.round((totalLive / totalOrdered) * 100)
            : 0;

        if (format === "pdf") {
            return generatePDF(profileData, {
                totalProfiles,
                totalOrdered,
                totalLive,
                totalRemaining,
                avgCompletionRate,
            });
        } else if (format === "excel") {
            return generateExcel(profileData, {
                totalProfiles,
                totalOrdered,
                totalLive,
                totalRemaining,
                avgCompletionRate,
            });
        }

        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    } catch (error) {
        console.error("Error generating export:", error);
        return NextResponse.json(
            { error: "Failed to generate export" },
            { status: 500 }
        );
    }
}

function generatePDF(
    profiles: any[],
    summary: {
        totalProfiles: number;
        totalOrdered: number;
        totalLive: number;
        totalRemaining: number;
        avgCompletionRate: number;
    }
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Profile Progress Report", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    // Summary Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 40);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryY = 46;
    doc.text(`Total Profiles: ${summary.totalProfiles}`, 14, summaryY);
    doc.text(`Total Ordered: ${summary.totalOrdered}`, 70, summaryY);
    doc.text(`Live: ${summary.totalLive}`, 126, summaryY);
    doc.text(`Remaining: ${summary.totalRemaining}`, 14, summaryY + 6);
    doc.text(`Avg Completion: ${summary.avgCompletionRate}%`, 70, summaryY + 6);

    // Table
    const tableData = profiles.map(p => [
        p.businessName,
        p.category,
        p.clientName,
        p.reviewOrdered.toString(),
        p.reviewLimit.toString(),
        p.liveCount.toString(),
        p.remaining.toString(),
        `${p.completionRate}%`,
    ]);

    autoTable(doc, {
        startY: 58,
        head: [["Business", "Category", "Client", "Ordered", "Limit", "Live", "Remaining", "Progress"]],
        body: tableData,
        theme: "grid",
        headStyles: {
            fillColor: [51, 65, 85], // slate-700
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [30, 41, 59],
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // slate-50
        },
    });

    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="profile-progress-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
    });
}

function generateExcel(
    profiles: any[],
    summary: {
        totalProfiles: number;
        totalOrdered: number;
        totalLive: number;
        totalRemaining: number;
        avgCompletionRate: number;
    }
) {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ["Profile Progress Report"],
        [`Generated: ${new Date().toLocaleDateString()}`],
        [],
        ["Summary"],
        ["Total Profiles", summary.totalProfiles],
        ["Total Ordered", summary.totalOrdered],
        ["Total Live", summary.totalLive],
        ["Total Remaining", summary.totalRemaining],
        ["Average Completion Rate", `${summary.avgCompletionRate}%`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // Profile Data Sheet
    const profileDataRows = profiles.map(p => ({
        "Business Name": p.businessName,
        "Category": p.category,
        "Client": p.clientName,
        "Ordered": p.reviewOrdered,
        "Daily Limit": p.reviewLimit,
        "Live": p.liveCount,
        "Remaining": p.remaining,
        "Progress": `${p.completionRate}%`,
    }));

    const dataSheet = XLSX.utils.json_to_sheet(profileDataRows);
    XLSX.utils.book_append_sheet(wb, dataSheet, "Profile Data");

    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(excelBuffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="profile-progress-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
    });
}
