import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";

// GET /api/admin/workers - List all workers under current admin
export async function GET() {
    const error = await requireAdmin();
    if (error) return error;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workers = await prisma.user.findMany({
        where: {
            role: "WORKER",
            parentAdminId: session.user.id,
        },
        select: {
            id: true,
            email: true,
            name: true,
            canCreateReviews: true,
            canEditReviews: true,
            canDeleteReviews: true,
            canManageProfiles: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workers });
}

// POST /api/admin/workers - Create a new worker account
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, password, name, canCreateReviews, canEditReviews, canDeleteReviews, canManageProfiles } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        // Hash password
        const passwordHash = await hash(password, 12);

        // Create worker
        const worker = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name: name || email.split("@")[0],
                role: "WORKER",
                parentAdminId: session.user.id,
                canCreateReviews: canCreateReviews ?? false,
                canEditReviews: canEditReviews ?? false,
                canDeleteReviews: canDeleteReviews ?? false,
                canManageProfiles: canManageProfiles ?? false,
            },
            select: {
                id: true,
                email: true,
                name: true,
                canCreateReviews: true,
                canEditReviews: true,
                canDeleteReviews: true,
                canManageProfiles: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ worker }, { status: 201 });
    } catch (error) {
        console.error("Error creating worker:", error);
        return NextResponse.json({ error: "Failed to create worker" }, { status: 500 });
    }
}
