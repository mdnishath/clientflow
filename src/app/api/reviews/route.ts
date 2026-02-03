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
    const status = searchParams.get("status");
    const showArchived = searchParams.get("archived") === "true";
    const search = searchParams.get("search");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause with scope filtering
    const where = {
        isArchived: showArchived,
        // ADMIN sees all, CLIENT sees only their client's data
        ...(scope.isAdmin
            ? {} // Admin sees all
            : { profile: { clientId: scope.clientId } } // Client sees only their data
        ),
        ...(profileId && { profileId }),
        ...(clientId && scope.isAdmin && { profile: { clientId } }), // Only admin can filter by clientId
        ...(status && { status: status as any }),
        ...(search && {
            OR: [
                { reviewText: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
                { profile: { businessName: { contains: search, mode: "insensitive" } } },
            ],
        }),
    } as any;

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
