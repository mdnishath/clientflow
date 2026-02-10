import { prisma } from "@/lib/prisma";
import { requireAdmin, getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

interface ImportProfile {
    businessName?: string;
    gmbLink?: string;
    category?: string;
    clientName?: string;
    clientEmail?: string;
    reviewText?: string;
    reviewStatus?: string;
    liveLink?: string;
    email?: string;
    ordered?: string;
    liveDaily?: string;
    startDate?: string;
    dueDate?: string;
    _rowNumber?: number;
}

// Helper to parse date from various formats
function parseDate(value: string | undefined): Date | null {
    if (!value) return null;

    try {
        // Try parsing as ISO date first
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }

        // Try DD/MM/YYYY format
        const parts = value.split(/[\/\-]/);
        if (parts.length === 3) {
            const [day, month, year] = parts.map(p => parseInt(p, 10));
            if (day && month && year) {
                return new Date(year, month - 1, day);
            }
        }
    } catch (error) {
        console.error("Error parsing date:", value, error);
    }

    return null;
}

// POST /api/admin/migration/import - Import with dynamic column mapping
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { profiles } = body;

        if (!Array.isArray(profiles) || profiles.length === 0) {
            return NextResponse.json(
                { error: "Invalid profiles data" },
                { status: 400 }
            );
        }

        const results = {
            created: 0,
            updated: 0,
            skipped: 0,
            errors: [] as string[],
            clientsCreated: new Set<string>(),
            profilesCreated: new Set<string>(),
        };

        // Valid review statuses
        const validStatuses = ["PENDING", "IN_PROGRESS", "MISSING", "APPLIED", "GOOGLE_ISSUE", "LIVE", "DONE"];

        // Group profiles by client to ensure proper segregation
        const clientGroups = new Map<string, ImportProfile[]>();

        for (const profile of profiles) {
            const clientName = profile.clientName?.trim();
            if (!clientName) {
                results.errors.push(`Row ${profile._rowNumber || "?"}: Missing client name`);
                continue;
            }

            if (!clientGroups.has(clientName)) {
                clientGroups.set(clientName, []);
            }
            clientGroups.get(clientName)!.push(profile);
        }

        console.log(`Processing ${clientGroups.size} clients with ${profiles.length} total profiles`);

        // Process each client group separately
        for (const [clientName, clientProfiles] of clientGroups) {
            try {
                // Find or create client for this admin
                let client = await prisma.client.findFirst({
                    where: {
                        userId: scope.userId,
                        name: clientName,
                    },
                });

                if (!client) {
                    // Get client email from first profile that has it
                    const clientEmail = clientProfiles.find(p => p.clientEmail)?.clientEmail;

                    client = await prisma.client.create({
                        data: {
                            userId: scope.userId,
                            name: clientName,
                            email: clientEmail || null,
                        },
                    });
                    results.clientsCreated.add(clientName);
                    console.log(`Created new client: ${clientName} (ID: ${client.id})`);
                }

                // Process profiles for this client
                for (const profileData of clientProfiles) {
                    try {
                        const businessName = profileData.businessName?.trim();
                        if (!businessName) {
                            results.errors.push(
                                `Row ${profileData._rowNumber || "?"}: Missing business name`
                            );
                            results.skipped++;
                            continue;
                        }

                        // Check if profile exists under THIS client
                        let profile = await prisma.gmbProfile.findFirst({
                            where: {
                                clientId: client.id,
                                businessName: businessName,
                            },
                        });

                        const ordered = profileData.ordered ? parseInt(profileData.ordered) : 0;
                        const liveDaily = profileData.liveDaily ? parseInt(profileData.liveDaily) : null;
                        const startDate = parseDate(profileData.startDate || undefined);

                        if (profile) {
                            // Update existing profile
                            await prisma.gmbProfile.update({
                                where: { id: profile.id },
                                data: {
                                    gmbLink: profileData.gmbLink || profile.gmbLink,
                                    category: profileData.category || profile.category,
                                    reviewLimit: liveDaily !== null ? liveDaily : profile.reviewLimit,
                                    reviewOrdered: ordered > 0 ? ordered : profile.reviewOrdered,
                                    reviewsStartDate: startDate || profile.reviewsStartDate,
                                },
                            });
                            results.updated++;
                            console.log(`Updated profile: ${businessName} for client ${clientName}`);
                        } else {
                            // Create new profile
                            profile = await prisma.gmbProfile.create({
                                data: {
                                    clientId: client.id,
                                    businessName: businessName,
                                    gmbLink: profileData.gmbLink || null,
                                    category: profileData.category || null,
                                    reviewLimit: liveDaily,
                                    reviewOrdered: ordered,
                                    reviewsStartDate: startDate,
                                    createdById: scope.actualUserId,
                                },
                            });
                            results.created++;
                            results.profilesCreated.add(`${clientName}:${businessName}`);
                            console.log(`Created profile: ${businessName} for client ${clientName}`);
                        }

                        // Create review if review data is provided
                        if (profileData.reviewText || profileData.reviewStatus || profileData.liveLink) {
                            const reviewStatus = profileData.reviewStatus &&
                                validStatuses.includes(profileData.reviewStatus.toUpperCase())
                                ? profileData.reviewStatus.toUpperCase()
                                : "PENDING";

                            const dueDate = parseDate(profileData.dueDate || undefined);

                            await prisma.review.create({
                                data: {
                                    userId: scope.userId,
                                    profileId: profile.id,
                                    reviewText: profileData.reviewText || null,
                                    reviewLiveLink: profileData.liveLink || null,
                                    emailUsed: profileData.email || null,
                                    status: reviewStatus as any,
                                    dueDate: dueDate,
                                    createdById: scope.actualUserId,
                                    updatedById: scope.actualUserId,
                                },
                            });
                            console.log(`Created review for profile: ${businessName}`);
                        }
                    } catch (error: any) {
                        console.error("Error processing profile:", error);
                        results.errors.push(
                            `Row ${profileData._rowNumber || "?"}: ${error.message}`
                        );
                    }
                }
            } catch (error: any) {
                console.error(`Error processing client ${clientName}:`, error);
                results.errors.push(`Client ${clientName}: ${error.message}`);
            }
        }

        console.log("Import completed:", {
            clients: clientGroups.size,
            created: results.created,
            updated: results.updated,
            skipped: results.skipped,
            errors: results.errors.length,
        });

        return NextResponse.json({
            success: true,
            results: {
                created: results.created,
                updated: results.updated,
                skipped: results.skipped,
                errors: results.errors,
            },
            summary: {
                clientsProcessed: clientGroups.size,
                clientsCreated: results.clientsCreated.size,
                profilesCreated: results.profilesCreated.size,
            },
        });
    } catch (error) {
        console.error("Error importing profiles:", error);
        return NextResponse.json(
            { error: "Failed to import profiles" },
            { status: 500 }
        );
    }
}

// Route segment config for App Router
export const maxDuration = 60; // 60 seconds
export const runtime = "nodejs";
