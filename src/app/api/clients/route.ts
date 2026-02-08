import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getClientScope, requireAdmin, requireRole } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

// GET /api/clients - List all clients (ADMIN and WORKER)
export async function GET(request: NextRequest) {
    const error = await requireRole(["ADMIN", "WORKER"]);
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const showArchived = searchParams.get("archived") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = {
        userId: scope.userId, // RBAC: Strict isolation - Admin only sees their own clients
        isArchived: showArchived,
        ...(search && {
            name: { contains: search, mode: "insensitive" },
        }),
    } as any;

    const [total, clients] = await Promise.all([
        prisma.client.count({ where }),
        prisma.client.findMany({
            where,
            include: {
                _count: {
                    select: {
                        gmbProfiles: { where: { isArchived: false } },
                    },
                },
                userAccount: {
                    select: { id: true, email: true, name: true, canDelete: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    return NextResponse.json({
        data: clients,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}

// POST /api/clients - Create a new client (ADMIN only)
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, email, phone, notes } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: "Client Name is required" },
                { status: 400 }
            );
        }

        const client = await prisma.client.create({
            data: {
                userId: scope.userId, // Admin who created this client
                name: name.trim(),
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                notes: notes?.trim() || null,
            },
        });

        // Notification: New client created
        await createNotification({
            userId: scope.userId,
            title: "New Client Added",
            message: `Client "${name}" has been created`,
            type: "success",
            link: `/clients/${client.id}`,
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        );
    }
}
