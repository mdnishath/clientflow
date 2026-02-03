import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

// POST /api/profiles/bulk - Bulk archive profiles
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { ids, action } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "Profile IDs are required" },
                { status: 400 }
            );
        }

        // Verify ownership of all profiles
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                id: { in: ids },
                client: { userId: session.user.id },
            },
        });

        if (profiles.length !== ids.length) {
            return NextResponse.json(
                { error: "Some profiles not found or unauthorized" },
                { status: 403 }
            );
        }

        if (action === "restore") {
            // Bulk restore
            await prisma.gmbProfile.updateMany({
                where: { id: { in: ids } },
                data: { isArchived: false },
            });

            await createNotification({
                userId: session.user.id,
                title: "Profiles Restored",
                message: `${ids.length} profiles have been restored`,
                type: "success",
                link: "/admin/profiles",
            });

            return NextResponse.json({ success: true, restored: ids.length });
        }

        // Default: Bulk archive
        await prisma.gmbProfile.updateMany({
            where: { id: { in: ids } },
            data: { isArchived: true },
        });

        await createNotification({
            userId: session.user.id,
            title: "Profiles Archived",
            message: `${ids.length} profiles have been archived`,
            type: "warning",
            link: "/admin/profiles",
        });

        return NextResponse.json({ success: true, archived: ids.length });
    } catch (error) {
        console.error("Bulk profile operation failed:", error);
        return NextResponse.json(
            { error: "Failed to process bulk operation" },
            { status: 500 }
        );
    }
}

// DELETE /api/profiles/bulk - Bulk delete profiles
export async function DELETE(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: "Profile IDs are required" },
                { status: 400 }
            );
        }

        // Verify ownership of all profiles
        const profiles = await prisma.gmbProfile.findMany({
            where: {
                id: { in: ids },
                client: { userId: session.user.id },
            },
        });

        if (profiles.length !== ids.length) {
            return NextResponse.json(
                { error: "Some profiles not found or unauthorized" },
                { status: 403 }
            );
        }

        // Permanent delete
        await prisma.gmbProfile.deleteMany({
            where: { id: { in: ids } },
        });

        await createNotification({
            userId: session.user.id,
            title: "Profiles Deleted",
            message: `${ids.length} profiles have been permanently deleted`,
            type: "error",
        });

        return NextResponse.json({ success: true, deleted: ids.length });
    } catch (error) {
        console.error("Bulk profile delete failed:", error);
        return NextResponse.json(
            { error: "Failed to delete profiles" },
            { status: 500 }
        );
    }
}
