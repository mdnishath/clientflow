import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/workers/daily-stats - Get daily performance stats for workers
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        const { searchParams } = new URL(request.url);
        const workerId = searchParams.get("workerId");
        const date = searchParams.get("date"); // Format: YYYY-MM-DD
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Workers can only see their own stats, admins can see all
        const isWorker = user?.role === "WORKER";
        const targetWorkerId = isWorker ? session.user.id : (workerId || undefined);

        // Build date filter
        const dateFilter: any = {};
        if (date) {
            const targetDate = new Date(date);
            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);
            dateFilter.gte = targetDate;
            dateFilter.lt = nextDate;
        } else if (startDate && endDate) {
            dateFilter.gte = new Date(startDate);
            dateFilter.lte = new Date(endDate);
        }

        // Get reviews marked as LIVE by this worker
        const liveReviews = await prisma.review.findMany({
            where: {
                liveById: targetWorkerId,
                ...(Object.keys(dateFilter).length > 0 && { liveAt: dateFilter }),
            },
            select: {
                id: true,
                liveAt: true,
                profile: {
                    select: {
                        id: true,
                        businessName: true,
                    },
                },
            },
            orderBy: { liveAt: "desc" },
        });

        // Get reviews with APPLIED status updated by this worker
        const appliedReviews = await prisma.review.findMany({
            where: {
                updatedById: targetWorkerId,
                status: "APPLIED",
                ...(Object.keys(dateFilter).length > 0 && { updatedAt: dateFilter }),
            },
            select: {
                id: true,
                updatedAt: true,
                profile: {
                    select: {
                        id: true,
                        businessName: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        // Get reviews with DONE status completed by this worker
        const doneReviews = await prisma.review.findMany({
            where: {
                status: "DONE",
                OR: [
                    { liveById: targetWorkerId },
                    { updatedById: targetWorkerId }
                ],
                ...(Object.keys(dateFilter).length > 0 && { completedAt: dateFilter }),
            },
            select: {
                id: true,
                completedAt: true,
                profile: {
                    select: {
                        id: true,
                        businessName: true,
                    },
                },
            },
            orderBy: { completedAt: "desc" },
        });

        // Group by date
        const stats: any = {};

        liveReviews.forEach((review) => {
            const date = review.liveAt?.toISOString().split("T")[0];
            if (date) {
                if (!stats[date]) {
                    stats[date] = { date, liveCount: 0, appliedCount: 0, doneCount: 0, totalEarnings: 0, reviews: [] };
                }
                stats[date].liveCount++;
                stats[date].totalEarnings += 20; // 20 BDT per LIVE
                stats[date].reviews.push({
                    id: review.id,
                    type: "LIVE",
                    businessName: review.profile.businessName,
                    timestamp: review.liveAt,
                });
            }
        });

        appliedReviews.forEach((review) => {
            const date = review.updatedAt?.toISOString().split("T")[0];
            if (date) {
                if (!stats[date]) {
                    stats[date] = { date, liveCount: 0, appliedCount: 0, doneCount: 0, totalEarnings: 0, reviews: [] };
                }
                stats[date].appliedCount++;
                stats[date].totalEarnings += 5; // 5 BDT per APPLIED
                stats[date].reviews.push({
                    id: review.id,
                    type: "APPLIED",
                    businessName: review.profile.businessName,
                    timestamp: review.updatedAt,
                });
            }
        });

        doneReviews.forEach((review) => {
            const date = review.completedAt?.toISOString().split("T")[0];
            if (date) {
                if (!stats[date]) {
                    stats[date] = { date, liveCount: 0, appliedCount: 0, doneCount: 0, totalEarnings: 0, reviews: [] };
                }
                stats[date].doneCount++;
                // DONE reviews already counted in LIVE (they were APPLIED+LIVE badge)
                // So no additional earnings here
                stats[date].reviews.push({
                    id: review.id,
                    type: "DONE",
                    businessName: review.profile.businessName,
                    timestamp: review.completedAt,
                });
            }
        });

        // Convert to array and sort by date
        const dailyStats = Object.values(stats).sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate totals
        const totals = dailyStats.reduce((acc: any, day: any) => ({
            liveCount: acc.liveCount + day.liveCount,
            appliedCount: acc.appliedCount + day.appliedCount,
            doneCount: acc.doneCount + day.doneCount,
            totalEarnings: acc.totalEarnings + day.totalEarnings,
        }), { liveCount: 0, appliedCount: 0, doneCount: 0, totalEarnings: 0 });

        return NextResponse.json({
            dailyStats,
            totals,
            workerId: targetWorkerId,
        });
    } catch (error) {
        console.error("Failed to fetch daily stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch daily stats" },
            { status: 500 }
        );
    }
}
