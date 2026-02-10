/**
 * Advanced Backup with Data Mapping
 * Allows admin to selectively backup data by choosing what to include
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            includeUsers = false,
            includeClients = true,
            includeProfiles = true,
            includeReviews = true,
            includeCategories = true,
            includeTemplates = true,
            clientIds = [], // Specific clients to backup
            dateFrom = null, // Date range filter
            dateTo = null,
        } = body;

        const backup: any = {
            metadata: {
                exportedAt: new Date().toISOString(),
                exportedBy: session.user.email,
                version: "2.0",
                mapping: {
                    includeUsers,
                    includeClients,
                    includeProfiles,
                    includeReviews,
                    includeCategories,
                    includeTemplates,
                    clientIds,
                    dateRange: dateFrom && dateTo ? { from: dateFrom, to: dateTo } : null,
                },
            },
        };

        // Build date filter if provided
        const dateFilter = dateFrom && dateTo
            ? {
                  createdAt: {
                      gte: new Date(dateFrom),
                      lte: new Date(dateTo),
                  },
              }
            : {};

        // Build client filter
        const clientFilter = clientIds.length > 0
            ? { id: { in: clientIds } }
            : {};

        // Users (optional)
        if (includeUsers) {
            backup.users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    clientId: true,
                    parentAdminId: true,
                    createdAt: true,
                    // Exclude password
                },
            });
        }

        // Clients
        if (includeClients) {
            backup.clients = await prisma.client.findMany({
                where: {
                    ...clientFilter,
                    ...dateFilter,
                },
                include: {
                    adminUser: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
            });
        }

        // Profiles
        if (includeProfiles) {
            const profileFilter = clientIds.length > 0
                ? { clientId: { in: clientIds } }
                : {};

            backup.profiles = await prisma.gmbProfile.findMany({
                where: {
                    ...profileFilter,
                    ...dateFilter,
                },
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }

        // Reviews
        if (includeReviews) {
            const reviewFilter = clientIds.length > 0
                ? {
                      profile: {
                          clientId: { in: clientIds },
                      },
                  }
                : {};

            backup.reviews = await prisma.review.findMany({
                where: {
                    ...reviewFilter,
                    ...dateFilter,
                },
                include: {
                    profile: {
                        select: {
                            id: true,
                            businessName: true,
                        },
                    },
                },
            });
        }

        // Categories
        if (includeCategories) {
            backup.categories = await prisma.category.findMany({
                where: dateFilter,
            });
        }

        // Templates (skip - no template model in schema)
        backup.templates = [];

        // Add statistics
        backup.statistics = {
            totalUsers: backup.users?.length || 0,
            totalClients: backup.clients?.length || 0,
            totalProfiles: backup.profiles?.length || 0,
            totalReviews: backup.reviews?.length || 0,
            totalCategories: backup.categories?.length || 0,
            totalTemplates: backup.templates?.length || 0,
        };

        // Return as JSON
        return NextResponse.json(backup, {
            headers: {
                "Content-Disposition": `attachment; filename="backup-${Date.now()}.json"`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Advanced backup error:", error);
        return NextResponse.json(
            { error: "Failed to create backup" },
            { status: 500 }
        );
    }
}
