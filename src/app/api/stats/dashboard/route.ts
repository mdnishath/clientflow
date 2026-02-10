/**
 * Dashboard Statistics API
 * Returns comprehensive stats for dashboard
 * - Overall counts (live, pending, applied, missing)
 * - Daily breakdown (last 30 days)
 * - Monthly trends
 * - Worker performance
 * - Client progress
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const role = session.user.role;
        const clientId = session.user.clientId;
        const parentAdminId = session.user.parentAdminId;

        // Build where clause based on role
        let whereClause: any = {};

        if (role === "CLIENT") {
            // Client sees only their data
            whereClause = {
                profile: {
                    clientId: clientId,
                },
            };
        } else if (role === "WORKER") {
            // Worker sees data under their parent admin
            const effectiveAdminId = parentAdminId || userId;
            whereClause = {
                profile: {
                    client: {
                        userId: effectiveAdminId,
                    },
                },
            };
        } else if (role === "ADMIN") {
            // ADMIN sees only their own clients' data (ISOLATED)
            whereClause = {
                profile: {
                    client: {
                        userId: userId,
                    },
                },
            };
        }

        // Overall status counts
        const statusCounts = await prisma.review.groupBy({
            by: ["status"],
            where: whereClause,
            _count: {
                status: true,
            },
        });

        const totalReviews = await prisma.review.count({ where: whereClause });

        // Format status counts
        const stats = {
            total: totalReviews,
            live: statusCounts.find((s) => s.status === "LIVE")?._count.status || 0,
            pending: statusCounts.find((s) => s.status === "PENDING")?._count.status || 0,
            applied: statusCounts.find((s) => s.status === "APPLIED")?._count.status || 0,
            missing: statusCounts.find((s) => s.status === "MISSING")?._count.status || 0,
            done: statusCounts.find((s) => s.status === "DONE")?._count.status || 0,
            googleIssue: statusCounts.find((s) => s.status === "GOOGLE_ISSUE")?._count.status || 0,
        };

        // Calculate completion rate
        const completionRate = totalReviews > 0
            ? Math.round(((stats.live + stats.done) / totalReviews) * 100)
            : 0;

        // Daily breakdown (last 30 days) - using Prisma instead of raw SQL
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReviews = await prisma.review.findMany({
            where: {
                ...whereClause,
                createdAt: { gte: thirtyDaysAgo },
            },
            select: {
                createdAt: true,
                status: true,
            },
        });

        // Format daily data for charts
        const dailyData = formatDailyDataFromReviews(recentReviews);

        // Monthly summary - skip for now to simplify
        const monthlyStats: any[] = [];

        // Recent activity (last 10 reviews)
        const recentActivity = await prisma.review.findMany({
            where: whereClause,
            orderBy: { updatedAt: "desc" },
            take: 10,
            select: {
                id: true,
                status: true,
                updatedAt: true,
                profile: {
                    select: {
                        businessName: true,
                    },
                },
                updatedBy: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Top performers (if admin) - simplified and isolated
        let topPerformers: Array<{ userId: string; userName: string; liveCount: number }> = [];
        if (role === "ADMIN") {
            const thirtyDaysAgoPerf = new Date();
            thirtyDaysAgoPerf.setDate(thirtyDaysAgoPerf.getDate() - 30);

            const liveReviews = await prisma.review.findMany({
                where: {
                    ...whereClause, // Add admin isolation
                    status: "LIVE",
                    completedAt: { gte: thirtyDaysAgoPerf },
                    liveById: { not: null },
                },
                select: {
                    liveById: true,
                    liveBy: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            // Count by user
            const perfMap = new Map<string, { userId: string; userName: string; liveCount: number }>();
            liveReviews.forEach((review) => {
                if (review.liveBy) {
                    const existing = perfMap.get(review.liveBy.id);
                    if (existing) {
                        existing.liveCount++;
                    } else {
                        perfMap.set(review.liveBy.id, {
                            userId: review.liveBy.id,
                            userName: review.liveBy.name || "Unknown",
                            liveCount: 1,
                        });
                    }
                }
            });

            topPerformers = Array.from(perfMap.values())
                .sort((a, b) => b.liveCount - a.liveCount)
                .slice(0, 5);
        }

        return NextResponse.json({
            success: true,
            stats,
            completionRate,
            dailyData,
            monthlyStats,
            recentActivity,
            topPerformers,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard stats" },
            { status: 500 }
        );
    }
}

// Helper function to format daily data for charts from reviews
function formatDailyDataFromReviews(reviews: Array<{ createdAt: Date; status: string }>) {
    const dataMap = new Map<string, any>();

    reviews.forEach((review) => {
        const dateStr = new Date(review.createdAt).toISOString().split("T")[0];
        if (!dataMap.has(dateStr)) {
            dataMap.set(dateStr, {
                date: dateStr,
                live: 0,
                pending: 0,
                applied: 0,
                missing: 0,
            });
        }

        const entry = dataMap.get(dateStr);
        const status = review.status.toLowerCase();
        if (entry && ["live", "pending", "applied", "missing"].includes(status)) {
            entry[status]++;
        }
    });

    return Array.from(dataMap.values()).sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}
