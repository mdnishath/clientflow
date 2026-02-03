import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getClientScope } from "@/lib/rbac";
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
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        });

        if (!existing) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        const body = await request.json();
        const { reviewText, reviewLiveLink, emailUsed, status, dueDate, notes, isArchived } = body;

        // Track completion
        let completedAt = existing.completedAt;
        if (status === "DONE" || status === "LIVE") {
            completedAt = completedAt || new Date();
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
        } else if (reviewText || reviewLiveLink || emailUsed || notes) {
            await createNotification({
                userId: scope.userId,
                title: "Review Updated",
                message: `Review for "${businessName}" has been updated`,
                type: "info",
                link: `/reviews`,
            });
        }

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

    // Permission check for permanent delete
    if (isPermanent && !scope.isAdmin && !scope.canDelete) {
        return NextResponse.json(
            { error: "Insufficient permissions to delete permanently" },
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
