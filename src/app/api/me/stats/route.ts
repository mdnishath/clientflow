import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

// GET /api/me/stats - Worker's own performance stats
export async function GET() {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get counts by status for reviews created by this user
        const createdStats = await prisma.review.groupBy({
            by: ["status"],
            where: {
                createdById: scope.actualUserId,
            },
            _count: { id: true },
        });

        // Get counts by status for reviews updated by this user
        const updatedStats = await prisma.review.groupBy({
            by: ["status"],
            where: {
                updatedById: scope.actualUserId,
            },
            _count: { id: true },
        });

        // Get today's stats (My Performance)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayUpdated = await prisma.review.count({
            where: {
                updatedById: scope.actualUserId,
                updatedAt: { gte: todayStart },
            },
        });

        const todayLive = await prisma.review.count({
            where: {
                updatedById: scope.actualUserId,
                status: "LIVE",
                updatedAt: { gte: todayStart },
            },
        });

        // ===========================================================================
        // TEAM TODAY STATS - Using Scheduling Logic (NOT dueDate-based)
        // ===========================================================================

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Build base scope (Admin/Worker/Client)
        const baseWhere = (scope.isAdmin || scope.isWorker)
            ? { profile: { client: { userId: scope.userId } }, isArchived: false }
            : scope.clientId
                ? { profile: { clientId: scope.clientId }, isArchived: false }
                : { id: "__no_data__" };

        // 2. Fetch ALL reviews (no dueDate filter) with profile info
        const reviews = await prisma.review.findMany({
            where: baseWhere as any,
            include: {
                profile: {
                    select: {
                        id: true,
                        reviewLimit: true,
                        reviewsStartDate: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // 3. Get "Done Today" counts per profile
        const profileIds = [...new Set(reviews.map(r => r.profileId))];
        const doneCounts = await prisma.review.groupBy({
            by: ["profileId"],
            where: {
                profileId: { in: profileIds },
                status: { in: ["DONE", "LIVE"] },
                completedAt: { gte: today },
                isArchived: false,
            },
            _count: { id: true },
        });

        const doneTodayMap: Record<string, number> = {};
        doneCounts.forEach(c => {
            doneTodayMap[c.profileId] = c._count.id;
        });

        // 4. Apply scheduling logic (same as reviews GET API)
        const reviewsByProfile: Record<string, typeof reviews> = {};
        for (const r of reviews) {
            if (!reviewsByProfile[r.profileId]) {
                reviewsByProfile[r.profileId] = [];
            }
            reviewsByProfile[r.profileId].push(r);
        }

        let teamTotalDueToday = 0;
        let teamLiveToday = 0;
        let teamPendingToday = 0;

        for (const profileId in reviewsByProfile) {
            const profileReviews = reviewsByProfile[profileId];

            // Sort by creation
            profileReviews.sort((a, b) => {
                const timeA = new Date(a.createdAt).getTime();
                const timeB = new Date(b.createdAt).getTime();
                return timeA === timeB ? (a.id < b.id ? -1 : 1) : timeA - timeB;
            });

            const { reviewLimit, reviewsStartDate } = profileReviews[0].profile;

            if (reviewLimit && reviewsStartDate) {
                const doneTodayCount = doneTodayMap[profileId] || 0;
                const remainingQuota = Math.max(0, reviewLimit - doneTodayCount);

                let quotaUsed = 0;

                for (const review of profileReviews) {
                    const isPendingType = review.status !== "DONE" && review.status !== "LIVE" && !review.isArchived;

                    if (isPendingType) {
                        if (quotaUsed < remainingQuota) {
                            // This review is DUE TODAY (within quota)
                            teamTotalDueToday++;
                            if (review.status === "PENDING") {
                                teamPendingToday++;
                            }
                            quotaUsed++;
                        }
                        // else: scheduled for future, don't count
                    } else if (review.status === "LIVE" || review.status === "DONE") {
                        // Count completed reviews (they were part of initial pending + now live)
                        if (review.completedAt && new Date(review.completedAt) >= today) {
                            teamLiveToday++;
                            teamTotalDueToday++;
                        }
                    }
                }
            }
        }

        // Format response
        const created: Record<string, number> = {};
        createdStats.forEach((s) => {
            created[s.status] = s._count.id;
        });

        const updated: Record<string, number> = {};
        updatedStats.forEach((s) => {
            updated[s.status] = s._count.id;
        });

        const totalCreated = Object.values(created).reduce((a, b) => a + b, 0);
        const totalUpdated = Object.values(updated).reduce((a, b) => a + b, 0);

        return NextResponse.json({
            userId: scope.actualUserId,
            created,
            updated,
            totalCreated,
            totalUpdated,
            today: {
                updated: todayUpdated, // My updates
                live: todayLive,       // My live updates
            },
            teamToday: {
                total: teamTotalDueToday,
                live: teamLiveToday,
                pending: teamPendingToday,
            },
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}
