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

    // 4. Fetch ALL matching reviews (without pagination args) to process scheduling correctly
    // We strictly limit to 1000 to prevent memory blowup, but this is enough for "Active" views
    // For "Archived" or full dumps, we might need a different strategy, but for the main feed this is best.
    const reviews = await prisma.review.findMany({
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
                    reviewLimit: true,
                    reviewsStartDate: true,
                },
            },
        },
        orderBy: { createdAt: "asc" }, // Ascending needed for correct queue calculation
        take: 2000, // Safety cap
    });

    // 5. In-Memory Processing: Group by Profile -> Calculate Schedule -> Flatten
    // This avoids N+1 DB queries and allows correct filtering
    const reviewsByProfile: Record<string, typeof reviews> = {};

    // Group
    for (const r of reviews) {
        if (!reviewsByProfile[r.profileId]) {
            reviewsByProfile[r.profileId] = [];
        }
        reviewsByProfile[r.profileId].push(r);
    }

    const processedReviews = [];

    const profileIds = Object.keys(reviewsByProfile);

    // 5b. Fetch "Done Today" Counts separately (Fix for the bug where filtering hides Done reviews)
    // We need to know how many reviews were completed TODAY for these profiles, 
    // regardless of whether the current user is filtering by "Pending" or not.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doneCounts = await prisma.review.groupBy({
        by: ["profileId"],
        where: {
            profileId: { in: profileIds },
            status: { in: ["DONE", "LIVE"] },
            completedAt: { gte: today },
            isArchived: false
        },
        _count: { id: true }
    });

    const doneTodayMap: Record<string, number> = {};
    doneCounts.forEach(c => {
        doneTodayMap[c.profileId] = c._count.id;
    });

    const processedReviews = [];

    // Process each profile's queue
    for (const profileId in reviewsByProfile) {
        const profileReviews = reviewsByProfile[profileId];

        // Ensure sorted by creation for queue logic
        profileReviews.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeA === timeB ? (a.id < b.id ? -1 : 1) : timeA - timeB;
        });

        // Calculate schedule for this profile
        const { reviewLimit, reviewsStartDate } = profileReviews[0].profile;

        if (reviewLimit && reviewsStartDate) {
            // 1. Get accurate "Done Today" count from the separate query
            const doneTodayCount = doneTodayMap[profileId] || 0;

            // 2. Determine Remaining Quota
            const limit = reviewLimit;
            const remainingQuota = Math.max(0, limit - doneTodayCount);

            // 3. Mark reviews as Scheduled/Hidden based on quota
            let quotaUsed = 0;

            for (let i = 0; i < profileReviews.length; i++) {
                const review = profileReviews[i];
                let isScheduled = false;
                let scheduledFor = null;

                // Identify if this review counts against the "Pending Quota"
                // It counts if it is NOT Done/Live (e.g. Pending, In_Progress, Missing)
                // AND it is not archived.
                const isPendingType = review.status !== "DONE" && review.status !== "LIVE" && !review.isArchived;

                if (isPendingType) {
                    if (quotaUsed < remainingQuota) {
                        // This review fits in today's quota!
                        quotaUsed++;
                    } else {
                        // Quota full! Schedule for tomorrow (or later)
                        isScheduled = true;

                        // Calculate future date
                        const futureDays = Math.floor((quotaUsed - remainingQuota) / limit) + 1;
                        const futureDate = new Date(today);
                        futureDate.setDate(today.getDate() + futureDays);
                        scheduledFor = futureDate.toISOString();

                        quotaUsed++;
                    }
                }

                processedReviews.push({ ...review, isScheduled, scheduledFor });
            }
        } else {
            // No limit/start date configured -> Show all
            processedReviews.push(...profileReviews.map(r => ({ ...r, isScheduled: false, scheduledFor: null })));
        }
    }

    // 6. Global Filtering & Pagination
    const showScheduled = searchParams.get("showScheduled") === "true";

    let filteredReviews = processedReviews;

    // Filter scheduled if not requested
    if (!showScheduled) {
        filteredReviews = filteredReviews.filter(r => !r.isScheduled);
    }

    // Re-Sort by CreatedAt DESC (Recent first) for the feed
    filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate Total AFTER filtering (This fixes the "Pagination showing even if 2 items" bug)
    const total = filteredReviews.length;
    const totalPages = Math.ceil(total / limit);

    // Apply Pagination Slice
    const paginatedReviews = filteredReviews.slice(skip, skip + limit);

    return NextResponse.json({
        data: paginatedReviews,
        meta: {
            total,
            page,
            limit,
            totalPages,
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
