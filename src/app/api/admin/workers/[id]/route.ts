import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// PATCH /api/admin/workers/[id] - Update worker permissions
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const error = await requireAdmin();
    if (error) return error;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify worker belongs to this admin
    const worker = await prisma.user.findFirst({
        where: {
            id,
            role: "WORKER",
            parentAdminId: session.user.id,
        },
    });

    if (!worker) {
        return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    try {
        const body = await request.json();
        const { name, canCreateReviews, canEditReviews, canDeleteReviews, canManageProfiles } = body;

        const updatedWorker = await prisma.user.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(canCreateReviews !== undefined && { canCreateReviews }),
                ...(canEditReviews !== undefined && { canEditReviews }),
                ...(canDeleteReviews !== undefined && { canDeleteReviews }),
                ...(canManageProfiles !== undefined && { canManageProfiles }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                canCreateReviews: true,
                canEditReviews: true,
                canDeleteReviews: true,
                canManageProfiles: true,
            },
        });

        return NextResponse.json({ worker: updatedWorker });
    } catch (error) {
        console.error("Error updating worker:", error);
        return NextResponse.json({ error: "Failed to update worker" }, { status: 500 });
    }
}

// DELETE /api/admin/workers/[id] - Delete/revoke worker access
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const error = await requireAdmin();
    if (error) return error;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify worker belongs to this admin
    const worker = await prisma.user.findFirst({
        where: {
            id,
            role: "WORKER",
            parentAdminId: session.user.id,
        },
    });

    if (!worker) {
        return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    try {
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting worker:", error);
        return NextResponse.json({ error: "Failed to delete worker" }, { status: 500 });
    }
}
