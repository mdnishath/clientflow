import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/contexts - List all contexts (personas + scenarios)
 */
export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "persona" | "scenario" | null (all)

    const contexts = await prisma.reviewContext.findMany({
        where: {
            userId: session.user.id,
            ...(type && { type }),
        },
        orderBy: [{ isActive: "desc" }, { usageCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(contexts);
}

/**
 * POST /api/contexts - Create new context
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, title, content, tone, category, tags } = body;

        if (!type || !title || !content) {
            return NextResponse.json(
                { error: "Type, title, and content required" },
                { status: 400 }
            );
        }

        const context = await prisma.reviewContext.create({
            data: {
                userId: session.user.id,
                type: type.toLowerCase(),
                title: title.trim(),
                content: content.trim(),
                tone: tone || null,
                category: category || null,
                tags: tags || [],
            },
        });

        return NextResponse.json(context, { status: 201 });
    } catch (error) {
        console.error("Create context error:", error);
        return NextResponse.json({ error: "Failed to create context" }, { status: 500 });
    }
}
