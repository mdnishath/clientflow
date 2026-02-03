import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PUT /api/notifications/[id] - Mark single notification as read
 */
export async function PUT(request: NextRequest, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.notification.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });

    return NextResponse.json(updated);
}

/**
 * DELETE /api/notifications/[id] - Delete single notification
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existing = await prisma.notification.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
