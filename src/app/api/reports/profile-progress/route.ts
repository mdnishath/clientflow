import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function GET() {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Build where clause based on role
        const profileWhere = (scope.isAdmin || scope.isWorker)
            ? { isArchived: false, client: { userId: scope.userId } }
            : scope.clientId
                ? { clientId: scope.clientId, isArchived: false }
                : { id: "__no_data__" };

        // Fetch all profiles with reviewOrdered > 0
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                ...profileWhere,
                reviewOrdered: { gt: 0 },
            },
            select: {
                id: true,
                businessName: true,
                category: true,
                reviewOrdered: true,
                reviewLimit: true,
                client: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        reviews: {
                            where: {
                                status: { in: ["LIVE", "DONE"] },
                                isArchived: false,
                            },
                        },
                    },
                },
            },
            orderBy: { businessName: "asc" },
        });

        // Calculate stats for each profile
        const profileData = profiles.map(p => {
            const liveCount = p._count.reviews;
            const ordered = p.reviewOrdered || 0;
            const remaining = Math.max(0, ordered - liveCount);
            const completionRate = ordered > 0 ? Math.round((liveCount / ordered) * 100) : 0;

            return {
                businessName: p.businessName,
                category: p.category || "N/A",
                clientName: p.client.name,
                reviewOrdered: ordered,
                reviewLimit: p.reviewLimit || 0,
                liveCount,
                remaining,
                completionRate,
            };
        });

        // Calculate summary
        const totalProfiles = profileData.length;
        const totalOrdered = profileData.reduce((sum, p) => sum + p.reviewOrdered, 0);
        const totalLive = profileData.reduce((sum, p) => sum + p.liveCount, 0);
        const totalRemaining = profileData.reduce((sum, p) => sum + p.remaining, 0);
        const avgCompletionRate = totalOrdered > 0
            ? Math.round((totalLive / totalOrdered) * 100)
            : 0;

        return NextResponse.json({
            profiles: profileData,
            summary: {
                totalProfiles,
                totalOrdered,
                totalLive,
                totalRemaining,
                avgCompletionRate,
            },
        });
    } catch (error) {
        console.error("Error fetching profile progress:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile progress" },
            { status: 500 }
        );
    }
}
