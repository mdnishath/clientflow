import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";
import { getClientScope } from "@/lib/rbac";

// POST /api/profiles/bulk - Bulk Archive/Restore
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { ids, action } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
        }

        // Validate permissions based on action
        if (action === "archive") {
            if (!scope.isAdmin && !scope.canDeleteProfiles) {
                return NextResponse.json({ error: "Forbidden - No archive permission" }, { status: 403 });
            }

            const result = await prisma.gmbProfile.updateMany({
                where: {
                    id: { in: ids },
                    // Ensure scope (client can only touch their own, admin/worker restricted by scope rules)
                    ...(scope.isAdmin ? {} : { clientId: scope.clientId! })
                },
                data: { isArchived: true },
            });

            await createNotification({
                userId: session.user.id,
                title: "Bulk Archive",
                message: `Archived ${result.count} profiles`,
                type: "warning",
            });

            return NextResponse.json({ success: true, count: result.count, action });

        } else if (action === "restore") {
            // Restore could be considered edit or delete(undo). Let's say Edit or Delete is enough?
            // Usually restore is "undo archive", so same permission as archive is logical, or edit.
            // ProfileCard uses can.deleteProfiles for restore. Let's stick to that.
            if (!scope.isAdmin && !scope.canDeleteProfiles) {
                return NextResponse.json({ error: "Forbidden - No restore permission" }, { status: 403 });
            }

            const result = await prisma.gmbProfile.updateMany({
                where: {
                    id: { in: ids },
                    ...(scope.isAdmin ? {} : { clientId: scope.clientId! })
                },
                data: { isArchived: false },
            });

            await createNotification({
                userId: session.user.id,
                title: "Bulk Restore",
                message: `Restored ${result.count} profiles`,
                type: "success",
            });

            return NextResponse.json({ success: true, count: result.count, action });
        } else {
            return NextResponse.json({ error: "Invalid action for POST. Use DELETE for deletion." }, { status: 400 });
        }

    } catch (error) {
        console.error("Bulk action error:", error);
        return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
    }
}

// DELETE /api/profiles/bulk - Bulk Permanent Delete
export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission Check
    if (!scope.isAdmin && !scope.canDeleteProfiles) {
        return NextResponse.json({ error: "Forbidden - No delete permission" }, { status: 403 });
    }

    // Explicit worker check
    if (scope.isWorker && !scope.canDeleteProfiles) {
        return NextResponse.json({ error: "Forbidden - Worker cannot delete profiles" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
        }

        const result = await prisma.gmbProfile.deleteMany({
            where: {
                id: { in: ids },
                ...(scope.isAdmin ? {} : { clientId: scope.clientId! })
            },
        });

        await createNotification({
            userId: session.user.id,
            title: "Bulk Delete",
            message: `Permanently deleted ${result.count} profiles`,
            type: "error",
        });

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Bulk delete error:", error);
        return NextResponse.json({ error: "Failed to perform bulk delete" }, { status: 500 });
    }
}
