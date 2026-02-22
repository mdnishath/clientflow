/**
 * GET /api/admin/leaderboard
 * Worker performance leaderboard with gamification
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // week | month | all

    const now = new Date();
    let fromDate: Date | undefined;

    if (period === "week") {
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
        fromDate = new Date(now);
        fromDate.setDate(now.getDate() - 30);
    }

    try {
        const workers = await prisma.user.findMany({
            where: {
                parentAdminId: session.user.id,
                role: "WORKER",
            },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        const leaderboard = await Promise.all(workers.map(async (worker) => {
            const dateFilter = fromDate ? { gte: fromDate } : undefined;

            const [liveCount, doneCount, totalUpdated, streakData] = await Promise.all([
                // Live reviews this period
                prisma.review.count({
                    where: {
                        liveById: worker.id,
                        ...(dateFilter ? { liveAt: dateFilter } : {}),
                    },
                }),
                // Done reviews this period
                prisma.review.count({
                    where: {
                        updatedById: worker.id,
                        status: { in: ["DONE", "LIVE"] },
                        ...(dateFilter ? { completedAt: dateFilter } : {}),
                    },
                }),
                // Total updates this period
                prisma.review.count({
                    where: {
                        updatedById: worker.id,
                        ...(dateFilter ? { updatedAt: dateFilter } : {}),
                    },
                }),
                // Daily activity for streak calculation
                prisma.review.groupBy({
                    by: ["updatedAt"],
                    where: {
                        updatedById: worker.id,
                        updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    },
                    _count: { id: true },
                    orderBy: { updatedAt: "desc" },
                }),
            ]);

            // Calculate streak (consecutive days with activity)
            let streak = 0;
            const activityDays = new Set(
                streakData.map(d => new Date(d.updatedAt).toDateString())
            );
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                if (activityDays.has(d.toDateString())) {
                    streak++;
                } else if (i > 0) break;
            }

            // Calculate score (weighted)
            const score = (liveCount * 10) + (doneCount * 5) + (totalUpdated * 1) + (streak * 3);

            // Determine badges
            const badges: string[] = [];
            if (liveCount >= 50) badges.push("🔥 Fire Worker");
            else if (liveCount >= 20) badges.push("⚡ Power User");
            else if (liveCount >= 10) badges.push("🌟 Active");
            if (streak >= 7) badges.push("💎 7-Day Streak");
            else if (streak >= 3) badges.push("🎯 3-Day Streak");
            if (totalUpdated >= 100) badges.push("🚀 Century");

            return {
                worker: {
                    id: worker.id,
                    name: worker.name || "Unknown",
                    email: worker.email,
                    initial: (worker.name || "?")[0].toUpperCase(),
                },
                stats: {
                    liveCount,
                    doneCount,
                    totalUpdated,
                    streak,
                    score,
                },
                badges,
            };
        }));

        // Sort by score descending
        leaderboard.sort((a, b) => b.stats.score - a.stats.score);

        // Add rank and medal
        const ranked = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null,
        }));

        return NextResponse.json({
            leaderboard: ranked,
            period,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Leaderboard error:", error);
        return NextResponse.json({ error: "Failed to generate leaderboard" }, { status: 500 });
    }
}
