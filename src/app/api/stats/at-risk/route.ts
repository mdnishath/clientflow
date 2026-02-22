/**
 * GET /api/stats/at-risk
 * Smart detection of at-risk reviews
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const role = session.user.role;
    const effectiveAdminId = role === "ADMIN" ? userId : session.user.parentAdminId;

    if (!effectiveAdminId) return NextResponse.json({ alerts: [] });

    const scope = { profile: { client: { userId: effectiveAdminId } }, isArchived: false };
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
        const [longApplied, overdueCount, missingLinks, recentlyMissing] = await Promise.all([
            // Applied > 7 days = at risk of expiring
            prisma.review.count({
                where: {
                    ...scope,
                    status: "APPLIED",
                    updatedAt: { lt: sevenDaysAgo },
                },
            }),
            // Overdue (due date passed, not done)
            prisma.review.count({
                where: {
                    ...scope,
                    dueDate: { lt: now },
                    status: { notIn: ["DONE", "LIVE"] },
                },
            }),
            // Reviews with no live link but status is APPLIED
            prisma.review.count({
                where: {
                    ...scope,
                    status: "APPLIED",
                    reviewLiveLink: null,
                },
            }),
            // Reviews that just went MISSING in last 24h
            prisma.review.count({
                where: {
                    ...scope,
                    checkStatus: "MISSING",
                    updatedAt: { gte: oneDayAgo },
                },
            }),
        ]);

        const alerts: Array<{ type: string; level: "critical" | "warning" | "info"; count: number; message: string; action: string }> = [];

        if (longApplied > 0) {
            alerts.push({
                type: "long_applied",
                level: "critical",
                count: longApplied,
                message: `${longApplied} review${longApplied > 1 ? "s" : ""} applied for 7+ days — may expire`,
                action: "/reviews?status=APPLIED",
            });
        }
        if (overdueCount > 0) {
            alerts.push({
                type: "overdue",
                level: "critical",
                count: overdueCount,
                message: `${overdueCount} overdue review${overdueCount > 1 ? "s" : ""} past deadline`,
                action: "/reviews",
            });
        }
        if (recentlyMissing > 0) {
            alerts.push({
                type: "recently_missing",
                level: "warning",
                count: recentlyMissing,
                message: `${recentlyMissing} review${recentlyMissing > 1 ? "s" : ""} went MISSING in last 24h`,
                action: "/checker",
            });
        }
        if (missingLinks > 0) {
            alerts.push({
                type: "no_link",
                level: "warning",
                count: missingLinks,
                message: `${missingLinks} APPLIED review${missingLinks > 1 ? "s have" : " has"} no live link`,
                action: "/reviews?status=APPLIED",
            });
        }

        return NextResponse.json({ alerts, checkedAt: now.toISOString() });
    } catch (error) {
        return NextResponse.json({ alerts: [] });
    }
}
