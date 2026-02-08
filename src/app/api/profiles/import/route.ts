import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getClientScope } from "@/lib/rbac";
import { createNotification } from "@/lib/notifications";
import { read, utils } from "xlsx";

interface ImportRow {
    date?: string;
    businessName: string;
    gmbLink?: string;
    liveLink?: string;
    reviewText?: string;
    status?: string;
    email?: string;
    ordered?: number;
    liveDaily?: number;
    startDate?: string;
    clientName?: string;
    clientEmail?: string;
}

// Helper to parse date from Excel
function parseExcelDate(value: any): Date | null {
    if (!value) return null;

    let date: Date | null = null;

    // If it's already a date
    if (value instanceof Date) {
        date = value;
    }
    // If it's an Excel serial number (number of days since 1900-01-01)
    else if (typeof value === "number") {
        // Only process if it's a reasonable Excel date (between 1900 and 2100)
        // Excel epoch is 1900-01-01, serial 1 = 1900-01-01
        // Year 2100 would be around serial 73050
        if (value >= 1 && value <= 73050) {
            date = new Date((value - 25569) * 86400 * 1000);
        } else {
            return null; // Invalid Excel date serial
        }
    }
    // Try to parse as string
    else if (typeof value === "string") {
        const trimmed = value.trim();

        // Check if it's DD/MM/YYYY or D/M/YYYY format
        const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = trimmed.match(ddmmyyyyPattern);

        if (match) {
            // DD/MM/YYYY format
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
            const year = parseInt(match[3], 10);
            date = new Date(year, month, day);
        } else {
            // Try standard JS Date parsing (handles YYYY-MM-DD, MM/DD/YYYY, etc.)
            try {
                const parsed = new Date(trimmed);
                if (!isNaN(parsed.getTime())) {
                    date = parsed;
                }
            } catch {
                return null;
            }
        }
    }

    // Validate the resulting date is reasonable (between 1990 and 2100)
    if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        if (year >= 1990 && year <= 2100) {
            return date;
        }
    }

    return null;
}

// Helper to schedule reviews based on ordered count and daily limit
function generateReviewSchedule(
    startDate: Date,
    orderedCount: number,
    dailyLimit: number
): Date[] {
    const schedule: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < orderedCount; i++) {
        const dayOffset = Math.floor(i / dailyLimit);
        const dueDate = new Date(currentDate);
        dueDate.setDate(dueDate.getDate() + dayOffset);
        schedule.push(dueDate);
    }

    return schedule;
}

// POST /api/profiles/import - Import profiles and reviews from Excel/CSV
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Read file
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json<any>(worksheet, { header: 1 });

        // Skip header row
        const rows = jsonData.slice(1);

        // Parse rows with business name and GMB link propagation (same as client-side)
        let lastBusinessName = "";
        let lastGmbLink = "";

        const parsedRows: ImportRow[] = rows
            .filter((row: any[]) => {
                // Must have at least business name OR some content in other cells
                const hasBusinessName = row[1] && String(row[1]).trim();
                const hasAnyContent = row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim());
                return hasBusinessName || hasAnyContent;
            })
            .map((row: any[]) => {
                // Update last known business name and GMB link if present
                if (row[1] && String(row[1]).trim()) {
                    lastBusinessName = String(row[1]).trim();
                }
                if (row[2] && String(row[2]).trim()) {
                    lastGmbLink = String(row[2]).trim();
                }

                return {
                    date: row[0] ? String(row[0]) : undefined,
                    businessName: lastBusinessName, // Use last known business name
                    gmbLink: lastGmbLink || undefined, // Use last known GMB link
                    liveLink: row[3] ? String(row[3]).trim() : undefined,
                    reviewText: row[4] ? String(row[4]).trim() : undefined,
                    status: row[5] ? String(row[5]).trim().toUpperCase() : undefined,
                    email: row[6] ? String(row[6]).trim() : undefined,
                    ordered: row[7] ? Number(row[7]) : undefined,
                    liveDaily: row[8] ? Number(row[8]) : undefined,
                    startDate: row[9] ? String(row[9]) : undefined,
                    clientName: row[10] ? String(row[10]).trim() : undefined,
                    clientEmail: row[11] ? String(row[11]).trim() : undefined,
                };
            });

        if (parsedRows.length === 0) {
            return NextResponse.json(
                { error: "No valid rows found in sheet" },
                { status: 400 }
            );
        }

        // Auto-detect or use first client for the importing user
        // In a real implementation, you'd want to allow selecting client or creating new one
        let targetClient = await prisma.client.findFirst({
            where: {
                userId: scope.userId,
                isArchived: false,
            },
            orderBy: { createdAt: "desc" },
        });

        // If no client exists, create one from the first row's clientName
        if (!targetClient) {
            const firstClientName = parsedRows[0].clientName || "Imported Client";
            targetClient = await prisma.client.create({
                data: {
                    userId: scope.userId,
                    name: firstClientName,
                },
            });
        }

        const clientId = targetClient.id;

        let createdProfilesCount = 0;
        let createdReviewsCount = 0;
        const validStatuses = ["PENDING", "IN_PROGRESS", "MISSING", "APPLIED", "GOOGLE_ISSUE", "LIVE", "DONE"] as const;
        type ReviewStatus = typeof validStatuses[number];

        // Group rows by business name
        const profileGroups = new Map<string, ImportRow[]>();
        for (const row of parsedRows) {
            const existing = profileGroups.get(row.businessName) || [];
            existing.push(row);
            profileGroups.set(row.businessName, existing);
        }

        // Process each profile group
        for (const [businessName, rows] of profileGroups) {
            // Check if profile already exists
            let profile = await prisma.gmbProfile.findFirst({
                where: {
                    clientId,
                    businessName,
                },
            });

            // Use data from first row for profile metadata
            const firstRow = rows[0];

            console.log("=== START DATE DEBUG ===");
            console.log("firstRow.startDate raw:", firstRow.startDate);
            console.log("Type:", typeof firstRow.startDate);
            const parsedStartDate = firstRow.startDate ? parseExcelDate(firstRow.startDate) : null;
            console.log("Parsed start date:", parsedStartDate);
            console.log("======================");

            if (!profile) {
                // Create new profile
                profile = await prisma.gmbProfile.create({
                    data: {
                        clientId,
                        businessName,
                        gmbLink: firstRow.gmbLink || null,
                        category: null, // Could be added to sheet
                        reviewLimit: firstRow.liveDaily || null,
                        reviewsStartDate: parsedStartDate,
                        reviewOrdered: firstRow.ordered || 0,
                        createdById: scope.actualUserId,
                    },
                });
                createdProfilesCount++;
            }

            // Create reviews from rows that have review data
            for (const row of rows) {
                // Import ANY row that has: date, text, link, email, OR status
                // Empty text with date = 5-star review (PENDING)
                const hasReviewData = row.date || row.reviewText || row.status || row.email || row.liveLink;

                if (hasReviewData) {
                    const status: ReviewStatus = row.status && validStatuses.includes(row.status as ReviewStatus)
                        ? row.status as ReviewStatus
                        : "PENDING"; // Default to PENDING if no status

                    await prisma.review.create({
                        data: {
                            userId: scope.userId,
                            profileId: profile.id,
                            reviewText: row.reviewText || null,
                            reviewLiveLink: row.liveLink || null,
                            emailUsed: row.email || null,
                            status,
                            dueDate: row.date ? parseExcelDate(row.date) : null,
                            createdById: scope.actualUserId,
                            updatedById: scope.actualUserId,
                        },
                    });
                    createdReviewsCount++;
                }
            }

            // Auto-create pending reviews if ordered count specified and has start date
            if (firstRow.ordered && firstRow.ordered > 0 && firstRow.startDate && firstRow.liveDaily) {
                const startDate = parseExcelDate(firstRow.startDate);
                if (startDate) {
                    const schedule = generateReviewSchedule(
                        startDate,
                        firstRow.ordered,
                        firstRow.liveDaily
                    );

                    const reviewsToCreate = schedule.map((dueDate) => ({
                        userId: scope.userId,
                        profileId: profile.id,
                        status: "PENDING" as const,
                        dueDate,
                        createdById: scope.actualUserId,
                        updatedById: scope.actualUserId,
                    }));

                    await prisma.review.createMany({
                        data: reviewsToCreate,
                    });
                    createdReviewsCount += schedule.length;
                }
            }
        }

        // Create notification
        await createNotification({
            userId: scope.userId,
            title: "Import Complete",
            message: `Imported ${createdProfilesCount} profiles and ${createdReviewsCount} reviews`,
            type: "success",
            link: `/clients/${clientId}`,
        });

        return NextResponse.json({
            success: true,
            profilesCreated: createdProfilesCount,
            reviewsCreated: createdReviewsCount,
            clientId,
        });
    } catch (error) {
        console.error("Error importing profiles:", error);
        return NextResponse.json(
            { error: "Failed to import profiles" },
            { status: 500 }
        );
    }
}
