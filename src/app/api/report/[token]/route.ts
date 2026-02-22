/**
 * GET /api/report/:token
 * Public endpoint — no auth needed — returns client stats for shareable report
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    if (!token || token.length < 10) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
        where: { reportToken: token },
        include: {
            gmbProfiles: {
                where: { isArchived: false },
                include: {
                    reviews: {
                        where: { isArchived: false },
                        select: { status: true, checkStatus: true, createdAt: true, completedAt: true },
                    },
                    _count: { select: { reviews: true } },
                },
                take: 20,
            },
        },
    });

    if (!client) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Aggregate stats
    const allReviews = client.gmbProfiles.flatMap((p: any) => p.reviews);
    const stats = {
        total: allReviews.length,
        live: allReviews.filter((r: any) => r.status === "LIVE").length,
        done: allReviews.filter((r: any) => r.status === "DONE").length,
        applied: allReviews.filter((r: any) => r.status === "APPLIED").length,
        pending: allReviews.filter((r: any) => r.status === "PENDING").length,
        missing: allReviews.filter((r: any) => r.status === "MISSING").length,
    };
    const completionRate = stats.total > 0 ? Math.round(((stats.live + stats.done) / stats.total) * 100) : 0;

    // Profile summaries
    const profiles = client.gmbProfiles.map((p: any) => ({
        businessName: p.businessName,
        category: p.category,
        reviewOrdered: p.reviewOrdered,
        liveCount: p.reviews.filter((r: any) => r.status === "LIVE" || r.status === "DONE").length,
        total: p._count.reviews,
    }));

    return NextResponse.json({
        client: { name: client.name },
        stats,
        completionRate,
        profiles,
        generatedAt: new Date().toISOString(),
    });
}
