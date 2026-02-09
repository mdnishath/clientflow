import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getClientScope } from "@/lib/rbac";
import { automationEvents } from "@/lib/automation/events";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/reviews/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const whereClause = scope.isAdmin
        ? { id, userId: scope.userId } // Admin owns review directly via userId (or sees all if logic implies)
        : { id, profile: { clientId: scope.clientId! } }; // Client owns profile

    const review = await prisma.review.findFirst({
        where: whereClause,
        include: {
            profile: {
                select: {
                    id: true,
                    businessName: true,
                    category: true,
                    clientId: true
                },
            },
        },
    });

    if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
}

// PATCH /api/reviews/:id
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!scope.isAdmin && !scope.canEditReviews) {
        return NextResponse.json({ error: "Forbidden - No edit permission" }, { status: 403 });
    }

    const { id } = await params;

    const whereClause = scope.isAdmin
        ? { id, userId: scope.userId }
        : { id, profile: { clientId: scope.clientId! } };

    try {
        // Verify ownership
        const existing = await prisma.review.findFirst({
            where: whereClause,
            include: { profile: { select: { businessName: true } } },
            // We need liveById for First LIVE Attribution logic
        });

        if (!existing) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        // liveById is already included in the default select (column exists in Review model)

        const body = await request.json();
        const { reviewText, reviewLiveLink, emailUsed, status, dueDate, notes, isArchived } = body;

        // Track completion
        let completedAt = existing.completedAt;
        if (status === "DONE" || status === "LIVE") {
            completedAt = completedAt || new Date();
        }

        // First LIVE Attribution: Only set liveById if not already set
        let liveByData: { liveById?: string; liveAt?: Date } = {};
        if (status === "LIVE" && !existing.liveById) {
            liveByData = {
                liveById: scope.actualUserId,
                liveAt: new Date(),
            };
        }

        const review = await prisma.review.update({
            where: { id },
            data: {
                ...(reviewText !== undefined && { reviewText: reviewText?.trim() || null }),
                ...(reviewLiveLink !== undefined && { reviewLiveLink: reviewLiveLink?.trim() || null }),
                ...(emailUsed !== undefined && { emailUsed: emailUsed?.trim() || null }),
                ...(status !== undefined && { status }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
                ...(notes !== undefined && { notes: notes?.trim() || null }),
                ...(isArchived !== undefined && { isArchived }),
                completedAt,
                updatedById: scope.actualUserId, // Track who updated this review
                ...liveByData, // First LIVE Attribution
            },
            include: {
                profile: {
                    select: { id: true, businessName: true, category: true },
                },
            },
        });

        const businessName = existing.profile?.businessName || "Unknown";

        // Notification based on action
        if (isArchived === true) {
            await createNotification({
                userId: scope.userId,
                title: "Review Archived",
                message: `Review for "${businessName}" has been archived`,
                type: "warning",
            });
        } else if (isArchived === false) {
            await createNotification({
                userId: scope.userId,
                title: "Review Restored",
                message: `Review for "${businessName}" has been restored`,
                type: "success",
            });
        } else if (status && status !== existing.status) {
            await createNotification({
                userId: scope.userId,
                title: "Review Status Changed",
                message: `Review for "${businessName}" is now ${status}`,
                type: status === "LIVE" || status === "DONE" ? "success" : "info",
                link: `/reviews`,
            });

            // Check if order is now filled when status changes to LIVE
            if (status === "LIVE") {
                const profile = await prisma.gmbProfile.findUnique({
                    where: { id: review.profile.id },
                    select: { reviewOrdered: true },
                });

                if (profile && profile.reviewOrdered > 0) {
                    const liveCount = await prisma.review.count({
                        where: {
                            profileId: review.profile.id,
                            status: "LIVE",
                            isArchived: false,
                        },
                    });

                    if (liveCount >= profile.reviewOrdered) {
                        await createNotification({
                            userId: scope.userId,
                            title: "Order Filled!",
                            message: `All ${profile.reviewOrdered} reviews for "${businessName}" are now LIVE`,
                            type: "success",
                            link: `/profiles/${review.profile.id}`,
                        });
                    }
                }
            }
        } else if (reviewText || reviewLiveLink || emailUsed || notes) {
            await createNotification({
                userId: scope.userId,
                title: "Review Updated",
                message: `Review for "${businessName}" has been updated`,
                type: "info",
                link: `/reviews`,
            });
        }

        // Broadcast update (real-time)
        automationEvents.emit("review-updated", review);

        return NextResponse.json(review);
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json(
            { error: "Failed to update review" },
            { status: 500 }
        );
    }
}

// DELETE /api/reviews/:id
// Query param: ?permanent=true for hard delete, otherwise soft archive
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isPermanent = searchParams.get("permanent") === "true";

    // Permission check for delete/archive
    if (!scope.isAdmin && !scope.canDeleteReviews) {
        return NextResponse.json(
            { error: "Insufficient permissions to delete/archive reviews" },
            { status: 403 }
        );
    }

    const whereClause = scope.isAdmin
        ? { id, userId: scope.userId }
        : { id, profile: { clientId: scope.clientId! } };

    try {
        const existing = await prisma.review.findFirst({
            where: whereClause,
            include: { profile: { select: { businessName: true } } },
        });

        if (!existing) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const businessName = existing.profile?.businessName || "Unknown";

        if (isPermanent) {
            // Permanent delete
            await prisma.review.delete({ where: { id } });

            await createNotification({
                userId: scope.userId,
                title: "Review Deleted",
                message: `Review for "${businessName}" has been permanently deleted`,
                type: "error",
            });

            return NextResponse.json({ success: true, action: "deleted" });
        } else {
            // Soft archive
            await prisma.review.update({
                where: { id },
                data: { isArchived: true },
            });

            await createNotification({
                userId: scope.userId,
                title: "Review Archived",
                message: `Review for "${businessName}" has been archived`,
                type: "warning",
            });

            return NextResponse.json({ success: true, action: "archived" });
        }
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { error: "Failed to delete review" },
            { status: 500 }
        );
    }
}
