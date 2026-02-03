import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/templates - List all templates for current user
 */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.reviewTemplate.findMany({
        where: { userId: session.user.id },
        orderBy: [{ isActive: "desc" }, { usageCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(templates);
}

/**
 * POST /api/templates - Create new template
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, lines, promptInstruction, exampleOutput, namePosition, category, tags } = body;

        if (!name || !promptInstruction) {
            return NextResponse.json(
                { error: "Name and prompt instruction required" },
                { status: 400 }
            );
        }

        const template = await prisma.reviewTemplate.create({
            data: {
                userId: session.user.id,
                name: name.trim(),
                lines: lines || 2,
                promptInstruction: promptInstruction.trim(),
                exampleOutput: exampleOutput?.trim() || null,
                namePosition: namePosition || "none",
                category: category || null,
                tags: tags || [],
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Create template error:", error);
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
}
