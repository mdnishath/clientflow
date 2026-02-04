import { prisma } from "@/lib/prisma";
import { requireAdmin, getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/profiles/import - Bulk import profiles from XLS data
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
        };

        for (const profileData of profiles) {
            const { businessName, gmbLink, category, clientName, clientId, action } = profileData;

            try {
                // Skip if action is 'skip'
                if (action === "skip") {
                    results.skipped++;
                    continue;
                }

                let targetClientId = clientId;

                // If no clientId provided, try to find or create client
                if (!targetClientId) {
                    if (!clientName) {
                        results.errors.push(`No client specified for profile: ${businessName}`);
                        continue;
                    }

                    // Find existing client by name (under this admin)
                    let client = await prisma.client.findFirst({
                        where: {
                            userId: scope.userId,
                            name: clientName,
                        },
                    });

                    // Create new client if not found
                    if (!client) {
                        client = await prisma.client.create({
                            data: {
                                userId: scope.userId,
                                name: clientName,
                            },
                        });
                    }

                    targetClientId = client.id;
                }

                // Verify client belongs to this admin
                const client = await prisma.client.findFirst({
                    where: {
                        id: targetClientId,
                        userId: scope.userId, // RBAC check
                    },
                });

                if (!client) {
                    results.errors.push(`Unauthorized access to client for profile: ${businessName}`);
                    continue;
                }

                // Check for duplicate
                const existing = await prisma.gmbProfile.findFirst({
                    where: {
                        businessName,
                        clientId: targetClientId,
                    },
                });

                if (existing) {
                    if (action === "override") {
                        // Update existing profile
                        await prisma.gmbProfile.update({
                            where: { id: existing.id },
                            data: {
                                gmbLink: gmbLink || existing.gmbLink,
                                category: category || existing.category,
                            },
                        });
                        results.updated++;
                    } else {
                        results.skipped++;
                    }
                } else {
                    // Create new profile
                    await prisma.gmbProfile.create({
                        data: {
                            clientId: targetClientId,
                            businessName,
                            gmbLink: gmbLink || null,
                            category: category || null,
                        },
                    });
                    results.created++;
                }
            } catch (error: any) {
                console.error("Error processing profile:", error);
                results.errors.push(`Error with ${businessName}: ${error.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            results,
        });
    } catch (error) {
        console.error("Error importing profiles:", error);
        return NextResponse.json(
            { error: "Failed to import profiles" },
            { status: 500 }
        );
    }
}
