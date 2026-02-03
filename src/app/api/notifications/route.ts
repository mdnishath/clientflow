import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications - Get user's notifications
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50, // Max 50 notifications
    });

    return NextResponse.json(notifications);
}

/**
 * POST /api/notifications - Create a notification (internal use)
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, message, type = "info", link } = body;

        if (!title || !message) {
            return NextResponse.json(
                { error: "Title and message required" },
                { status: 400 }
            );
        }

        const notification = await prisma.notification.create({
            data: {
                userId: session.user.id,
                title,
                message,
                type,
                link,
            },
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error("Create notification error:", error);
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}

/**
 * PUT /api/notifications - Mark all as read
 */
export async function PUT() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
    });

    return NextResponse.json({ success: true });
}

/**
 * DELETE /api/notifications - Clear all notifications
 */
export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.deleteMany({
        where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
}
