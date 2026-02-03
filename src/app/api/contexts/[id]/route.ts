import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/contexts/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const context = await prisma.reviewContext.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!context) {
        return NextResponse.json({ error: "Context not found" }, { status: 404 });
    }

    return NextResponse.json(context);
}

/**
 * PUT /api/contexts/:id - Update context
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.reviewContext.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Context not found" }, { status: 404 });
        }

        const body = await request.json();
        const { type, title, content, tone, category, tags, isActive } = body;

        const context = await prisma.reviewContext.update({
            where: { id },
            data: {
                ...(type !== undefined && { type: type.toLowerCase() }),
                ...(title !== undefined && { title: title.trim() }),
                ...(content !== undefined && { content: content.trim() }),
                ...(tone !== undefined && { tone }),
                ...(category !== undefined && { category }),
                ...(tags !== undefined && { tags }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(context);
    } catch (error) {
        console.error("Update context error:", error);
        return NextResponse.json({ error: "Failed to update context" }, { status: 500 });
    }
}

/**
 * DELETE /api/contexts/:id
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.reviewContext.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Context not found" }, { status: 404 });
        }

        await prisma.reviewContext.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete context error:", error);
        return NextResponse.json({ error: "Failed to delete context" }, { status: 500 });
    }
}
