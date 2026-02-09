import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function POST() {
    const scope = await getClientScope();

    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can use this endpoint
    if (!scope.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    try {
        // Fetch all profiles with reviewOrdered > 0
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                isArchived: false,
                client: { userId: scope.userId },
                reviewOrdered: { gt: 0 },
            },
            select: {
                id: true,
                businessName: true,
                reviewOrdered: true,
                client: {
                    select: {
                        userId: true,
                    },
                },
            },
        });

        if (profiles.length === 0) {
            return NextResponse.json({
                success: true,
                summary: {
                    profilesProcessed: 0,
                    reviewsCreated: 0,
                    profileDetails: [],
                },
                message: "No profiles found with reviewOrdered > 0",
            });
        }

        // Process each profile and create reviews
        const profileDetails = [];
        let totalReviewsCreated = 0;

        for (const profile of profiles) {
            // Count existing LIVE + DONE reviews
            const liveCount = await prisma.review.count({
                where: {
                    profileId: profile.id,
                    status: { in: ["LIVE", "DONE"] },
                    isArchived: false,
                },
            });

            // Calculate remaining
            const remaining = profile.reviewOrdered - liveCount;

            if (remaining > 0) {
                // Create pending reviews
                const reviews = Array.from({ length: remaining }).map(() => ({
                    profileId: profile.id,
                    status: "PENDING" as const,
                    userId: profile.client.userId,
                    dueDate: new Date(),
                }));

                await prisma.review.createMany({
                    data: reviews,
                });

                profileDetails.push({
                    profileId: profile.id,
                    businessName: profile.businessName,
                    created: remaining,
                });

                totalReviewsCreated += remaining;
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                profilesProcessed: profiles.length,
                reviewsCreated: totalReviewsCreated,
                profilesWithReviews: profileDetails.length,
                profileDetails,
            },
        });
    } catch (error) {
        console.error("Error in bulk auto-generate:", error);
        return NextResponse.json(
            { error: "Failed to generate reviews" },
            { status: 500 }
        );
    }
}
