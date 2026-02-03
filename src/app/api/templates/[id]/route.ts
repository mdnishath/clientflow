import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/templates/:id - Get single template
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.reviewTemplate.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
}

/**
 * PUT /api/templates/:id - Update template
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.reviewTemplate.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const body = await request.json();
        const { name, lines, promptInstruction, exampleOutput, namePosition, category, tags, isActive } = body;

        const template = await prisma.reviewTemplate.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(lines !== undefined && { lines }),
                ...(promptInstruction !== undefined && { promptInstruction: promptInstruction.trim() }),
                ...(exampleOutput !== undefined && { exampleOutput: exampleOutput?.trim() || null }),
                ...(namePosition !== undefined && { namePosition }),
                ...(category !== undefined && { category }),
                ...(tags !== undefined && { tags }),
                ...(isActive !== undefined && { isActive }),
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Update template error:", error);
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
    }
}

/**
 * DELETE /api/templates/:id - Delete template
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const existing = await prisma.reviewTemplate.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        await prisma.reviewTemplate.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete template error:", error);
        return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }
}
