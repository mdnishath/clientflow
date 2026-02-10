import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET /api/admin/workers/[id]/stats - Get detailed stats for a specific worker (ADMIN only)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const error = await requireRole(["ADMIN"]);
    if (error) return error;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workerId } = await params;
    const adminId = session.user.id;

    try {
        // Verify worker exists AND belongs to this admin (ISOLATION)
        const worker = await prisma.user.findUnique({
            where: { id: workerId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                parentAdminId: true,
            },
        });

        if (!worker || worker.role !== "WORKER" || worker.parentAdminId !== adminId) {
            return NextResponse.json(
                { error: "Worker not found or access denied" },
                { status: 404 }
            );
        }

        // Get reviews created by this worker
        const createdReviews = await prisma.review.count({
            where: { createdById: workerId },
        });

        // Get reviews updated by this worker
        const updatedReviews = await prisma.review.count({
            where: { updatedById: workerId },
        });

        // Get reviews marked as LIVE by this worker
        const liveReviews = await prisma.review.count({
            where: {
                liveById: workerId,
                status: "LIVE",
            },
        });

        // Get status breakdown for reviews worker touched
        const statusBreakdown = await prisma.review.groupBy({
            by: ["status"],
            where: {
                OR: [
                    { createdById: workerId },
                    { updatedById: workerId },
                ],
            },
            _count: {
                status: true,
            },
        });

        // Daily stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReviews = await prisma.review.findMany({
            where: {
                OR: [
                    { createdById: workerId },
                    { updatedById: workerId },
                ],
                updatedAt: { gte: thirtyDaysAgo },
            },
            select: {
                updatedAt: true,
                status: true,
            },
        });

        // This week stats
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeek = await prisma.review.count({
            where: {
                OR: [
                    { createdById: workerId },
                    { updatedById: workerId },
                ],
                updatedAt: {
                    gte: startOfWeek,
                },
            },
        });

        // This month stats
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonth = await prisma.review.count({
            where: {
                OR: [
                    { createdById: workerId },
                    { updatedById: workerId },
                ],
                updatedAt: {
                    gte: startOfMonth,
                },
            },
        });

        // Performance metrics
        const totalTouched = createdReviews + updatedReviews;
        const successRate = totalTouched > 0
            ? Math.round((liveReviews / totalTouched) * 100)
            : 0;

        // Project-wise statistics (by client)
        const projectStats = await prisma.review.groupBy({
            by: ["profileId"],
            where: {
                OR: [
                    { createdById: workerId },
                    { updatedById: workerId },
                ],
            },
            _count: {
                id: true,
            },
        });

        // Get profile details for project stats
        const profileIds = projectStats.map((p) => p.profileId);
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                id: { in: profileIds },
            },
            select: {
                id: true,
                businessName: true,
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Group by client (project)
        const projectMap = new Map<string, { clientId: string; clientName: string; reviewCount: number; profiles: string[] }>();

        projectStats.forEach((stat) => {
            const profile = profiles.find((p) => p.id === stat.profileId);
            if (profile && profile.client) {
                const clientId = profile.client.id;
                const existing = projectMap.get(clientId);

                if (existing) {
                    existing.reviewCount += stat._count.id;
                    if (!existing.profiles.includes(profile.businessName)) {
                        existing.profiles.push(profile.businessName);
                    }
                } else {
                    projectMap.set(clientId, {
                        clientId,
                        clientName: profile.client.name,
                        reviewCount: stat._count.id,
                        profiles: [profile.businessName],
                    });
                }
            }
        });

        const projectWiseStats = Array.from(projectMap.values())
            .map((p) => ({
                clientId: p.clientId,
                clientName: p.clientName,
                reviewCount: p.reviewCount,
                profileCount: p.profiles.length,
                profiles: p.profiles.slice(0, 3), // Top 3 profiles
            }))
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 10); // Top 10 projects

        // Format response
        const stats = {
            created: createdReviews,
            updated: updatedReviews,
            liveCount: liveReviews,
            totalTouched,
            successRate,
            thisWeek,
            thisMonth,
            statusBreakdown: statusBreakdown.map((s) => ({
                status: s.status,
                count: s._count.status,
            })),
            dailyStats: formatDailyStatsFromReviews(recentReviews),
            projectWiseStats,
        };

        return NextResponse.json({
            success: true,
            worker,
            stats,
        });
    } catch (error) {
        console.error("Worker stats error:", error);
        return NextResponse.json(
            { error: "Failed to fetch worker stats" },
            { status: 500 }
        );
    }
}

function formatDailyStatsFromReviews(
    reviews: Array<{ updatedAt: Date; status: string }>
) {
    const dataMap = new Map<string, any>();

    reviews.forEach((review) => {
        const dateStr = new Date(review.updatedAt).toISOString().split("T")[0];
        if (!dataMap.has(dateStr)) {
            dataMap.set(dateStr, {
                date: dateStr,
                total: 0,
            });
        }

        const entry = dataMap.get(dateStr);
        if (entry) {
            entry.total++;
        }
    });

    return Array.from(dataMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days
}
