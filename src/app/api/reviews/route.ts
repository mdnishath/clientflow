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
    const showArchived = searchParams.get("archived") === "true";
    const search = searchParams.get("search");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause with scope filtering
    const where: any = {
        isArchived: showArchived,
    };

    // Handle profile-related filters in a combined way
    const profileFilters: any = {};

    // CRITICAL: Admin sees only their own clients' reviews
    if (scope.isAdmin) {
        // Admin must see only reviews from clients they created
        profileFilters.client = { userId: scope.userId };

        // If filtering by specific client, add that filter
        if (clientId) {
            profileFilters.clientId = clientId;
        }
    } else if (scope.clientId) {
        // Client sees only their own data
        profileFilters.clientId = scope.clientId;
    }

    // Add category filter
    if (category) {
        profileFilters.category = category;
    }

    // Apply profile filters if any exist
    if (Object.keys(profileFilters).length > 0) {
        where.profile = profileFilters;
    }

    // Direct review filters
    if (profileId) {
        where.profileId = profileId;
    }

    if (status) {
        // Support excluding status with "not-" prefix
        if (status.startsWith("not-")) {
            const excludeStatus = status.substring(4); // Remove "not-" prefix
            where.status = { not: excludeStatus };
        } else {
            where.status = status as any;
        }
    }

    if (search) {
        where.OR = [
            { reviewText: { contains: search, mode: "insensitive" } },
            { notes: { contains: search, mode: "insensitive" } },
            { profile: { businessName: { contains: search, mode: "insensible" } } },
        ];
    }

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
                    },
                },
            },
            orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
            skip,
            take: limit,
        }),
    ]);

    return NextResponse.json({
        data: reviews,
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
