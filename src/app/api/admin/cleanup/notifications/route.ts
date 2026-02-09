import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { NextResponse } from "next/server";

// DELETE /api/admin/cleanup/notifications - Delete all notifications
export async function DELETE() {
    const error = await requireRole(["ADMIN"]);
    if (error) return error;

    try {
        const result = await prisma.notification.deleteMany({});

        return NextResponse.json({
            success: true,
            deleted: result.count,
            message: `${result.count} notifications deleted`,
        });
    } catch (error) {
        console.error("Failed to delete notifications:", error);
        return NextResponse.json(
            { error: "Failed to delete notifications" },
            { status: 500 }
        );
    }
}
