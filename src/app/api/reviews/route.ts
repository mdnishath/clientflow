import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getClientScope, requireAdmin } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

// GET /api/reviews - List reviews (scoped by role)
// ADMIN: sees all reviews
// CLIENT: sees only reviews for their linked client
export async function GET(request: NextRequest) {
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get("profileId");
    const clientId = searchParams.get("clientId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const checkStatus = searchParams.get("checkStatus");
    const showArchived = searchParams.get("archived") === "true";
    const search = searchParams.get("search");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause using AND array for strict condition merging
    const andConditions: any[] = [];

    // 1. Base Scoping (RBAC)
    if (scope.isAdmin) {
        // Admin: Must belong to one of their clients
        andConditions.push({ profile: { client: { userId: scope.userId } } });

        // Admin: Optional Client Filter
        if (clientId) {
            andConditions.push({ profile: { clientId: clientId } });
        }
    } else if (scope.clientId) {
        // Client: Must belong to their specific clientId
        andConditions.push({ profile: { clientId: scope.clientId } });
    }

    // 2. Archive Status
    andConditions.push({ isArchived: showArchived });

    // 3. Category Filter
    if (category) {
        andConditions.push({ profile: { category: category } });
    }

    // 4. Profile Filter (Direct ID)
    if (profileId) {
        andConditions.push({ profileId: profileId });
    }

    // 5. Status Filter
    if (status) {
        if (status.startsWith("not-")) {
            const excludeStatus = status.substring(4);
            andConditions.push({ status: { not: excludeStatus } });
        } else {
            andConditions.push({ status: status });
        }
    }

    // 6. Check Status (Badge)
    if (checkStatus && checkStatus !== "all") {
        andConditions.push({ checkStatus: checkStatus });
    }

    // 7. Search (OR condition inside AND)
    if (search) {
        andConditions.push({
            OR: [
                { reviewText: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                { profile: { businessName: { contains: search, mode: "insensitive" } } },
            ]
        });
    }

    const where: any = { AND: andConditions };

    const [total, reviews] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.findMany({
            where,
            include: {
                profile: {
                    select: {
                        id: true,
                        businessName: true,
                        gmbLink: true,
                        category: true,
                        clientId: true,
                        client: { select: { name: true } },
                        // Include scheduling fields
                        reviewLimit: true,
                        reviewsStartDate: true,
                    },
                },
            },
            // Order by profile first to group for calculation, then by date
            orderBy: [
                { profileId: "asc" },
                { completedAt: "asc" }, // Ascending to count limits correctly
            ],
            // Note: Pagination messes up limit calc if we don't load all for that profile
            // For now, we apply logic only on visible page or if filtered by profile
            skip,
            take: limit,
        }),
    ]);

    // Apply Scheduling Logic Globally
    // We calculate the queue position (index) for EACH review dynamically.
    // This allows the logic to work on the main feed (multi-profile) and single-profile views alike.

    // Check strict filtering preference
    const showScheduled = searchParams.get("showScheduled") === "true";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processedReviewsWithSchedule = await Promise.all(reviews.map(async (review) => {
        const { reviewLimit, reviewsStartDate } = review.profile;

        let isScheduled = false;
        let scheduledFor = null;

        if (reviewLimit && reviewsStartDate) {
            // Count how many valid reviews exist BEFORE this one for this profile
            // This determines its "Index" in the virtual queue
            const queueIndex = await prisma.review.count({
                where: {
                    profileId: review.profileId,
                    isArchived: false,
                    OR: [
                        { createdAt: { lt: review.createdAt } },
                        { createdAt: review.createdAt, id: { lt: review.id } } // Tie-breaker
                    ]
                }
            });

            // Calculate Date
            const dayOffset = Math.floor(queueIndex / reviewLimit);

            const startDate = new Date(reviewsStartDate);
            startDate.setHours(0, 0, 0, 0);

            const scheduledDate = new Date(startDate);
            scheduledDate.setDate(startDate.getDate() + dayOffset);

            // Set fields if future
            if (scheduledDate > today) {
                isScheduled = true;
                scheduledFor = scheduledDate.toISOString();
            } else {
                // It is "Active" (today or past), but we can still show the date it was scheduled for if useful
                scheduledFor = scheduledDate.toISOString();
            }
        }

        return {
            ...review,
            isScheduled,
            scheduledFor
        };
    }));

    let processedReviews = processedReviewsWithSchedule;

    // Filter out scheduled reviews unless explicitly requested
    if (!showScheduled) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        processedReviews = processedReviews.filter((r: any) => !r.isScheduled);
    }

    // RE-SORT by original desc order for display
    const sortedReviews = processedReviews.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
        data: sortedReviews,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}

// POST /api/reviews - Create a new review (ADMIN only)
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { profileId, reviewText, reviewLiveLink, emailUsed, status, dueDate, notes } = body;

        if (!profileId) {
            return NextResponse.json(
                { error: "GMB Profile is required" },
                { status: 400 }
            );
        }

        // Verify profile exists
        const profile = await prisma.gmbProfile.findFirst({
            where: { id: profileId },
        });

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 }
            );
        }

        const review = await prisma.review.create({
            data: {
                userId: scope.userId,
                profileId,
                reviewText: reviewText?.trim() || null,
                reviewLiveLink: reviewLiveLink?.trim() || null,
                emailUsed: emailUsed?.trim() || null,
                status: status || "PENDING",
                dueDate: dueDate ? new Date(dueDate) : null,
                notes: notes?.trim() || null,
            },
            include: {
                profile: {
                    select: { id: true, businessName: true, category: true },
                },
            },
        });

        // Create notification
        await createNotification({
            userId: scope.userId,
            title: "Review Saved",
            message: `Review for "${profile.businessName}" has been saved`,
            type: "success",
            link: `/reviews`,
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
}
