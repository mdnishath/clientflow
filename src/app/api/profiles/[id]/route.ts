import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/profiles/:id - Get profile with reviews
export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Scope-based verification
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = scope.isAdmin
        ? { id, client: { userId: scope.userId } } // Admin: owns the client
        : { id, clientId: scope.clientId! }; // Client: belongs to linked client

    const profile = await prisma.gmbProfile.findFirst({
        where: whereClause,
        include: {
            client: true,
            _count: {
                select: { reviews: { where: { isArchived: false } } },
            },
        },
    });

    if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
}

// DELETE /api/profiles/:id - Archive or permanently delete profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const permanent = searchParams.get("permanent") === "true";

    // Scope-based verification
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check delete permission for clients
    if (!scope.isAdmin && !scope.canDelete) {
        return NextResponse.json({ error: "Forbidden - No delete permission" }, { status: 403 });
    }

    const whereClause = scope.isAdmin
        ? { id, client: { userId: scope.userId } }
        : { id, clientId: scope.clientId! };

    try {
        const existing = await prisma.gmbProfile.findFirst({
            where: whereClause,
        });

        if (!existing) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        if (permanent) {
            // Permanent delete
            await prisma.gmbProfile.delete({ where: { id } });

            await createNotification({
                userId: session.user.id,
                title: "Profile Deleted",
                message: `Profile "${existing.businessName}" has been permanently deleted`,
                type: "error",
            });
        } else {
            // Soft delete (archive)
            await prisma.gmbProfile.update({
                where: { id },
                data: { isArchived: true },
            });

            await createNotification({
                userId: session.user.id,
                title: "Profile Archived",
                message: `Profile "${existing.businessName}" has been archived`,
                type: "warning",
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting profile:", error);
        return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
    }
}

// PATCH /api/profiles/:id - Update profile
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Scope-based verification
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause = scope.isAdmin
        ? { id, client: { userId: scope.userId } }
        : { id, clientId: scope.clientId! };

    try {
        const body = await request.json();
        const { businessName, gmbLink, category, isArchived } = body;

        const existing = await prisma.gmbProfile.findFirst({
            where: whereClause,
        });

        if (!existing) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const profile = await prisma.gmbProfile.update({
            where: { id },
            data: {
                ...(businessName !== undefined && { businessName: businessName.trim() }),
                ...(gmbLink !== undefined && { gmbLink: gmbLink?.trim() || null }),
                ...(category !== undefined && { category: category?.trim() || null }),
                ...(isArchived !== undefined && { isArchived }),
            },
        });

        // Notification based on action
        if (isArchived === true) {
            await createNotification({
                userId: session.user.id,
                title: "Profile Archived",
                message: `Profile "${existing.businessName}" has been archived`,
                type: "warning",
            });
        } else if (isArchived === false) {
            await createNotification({
                userId: session.user.id,
                title: "Profile Restored",
                message: `Profile "${existing.businessName}" has been restored`,
                type: "success",
            });
        } else if (businessName || gmbLink || category) {
            await createNotification({
                userId: session.user.id,
                title: "Profile Updated",
                message: `Profile "${profile.businessName}" has been updated`,
                type: "info",
                link: `/profiles/${profile.id}`,
            });
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
