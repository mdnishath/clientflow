import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/clients/:id - Get client with their GMB Profiles
export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findFirst({
        where: {
            id,
            userId: session.user.id,
        },
        include: {
            gmbProfiles: {
                where: { isArchived: false },
                orderBy: { businessName: "asc" },
                include: {
                    _count: {
                        select: { reviews: true }
                    }
                }
            },
            _count: {
                select: { gmbProfiles: { where: { isArchived: false } } },
            },
        },
    });

    if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
}

// PATCH /api/clients/:id - Update client info
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, email, phone, notes, isArchived } = body;

        // Verify ownership
        const existing = await prisma.client.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        const client = await prisma.client.update({
            where: { id },
            data: {
                ...(name !== undefined && { name: name.trim() }),
                ...(email !== undefined && { email: email?.trim() || null }),
                ...(phone !== undefined && { phone: phone?.trim() || null }),
                ...(notes !== undefined && { notes: notes?.trim() || null }),
                ...(isArchived !== undefined && { isArchived }),
            },
        });

        // Notification based on action
        if (isArchived === true) {
            await createNotification({
                userId: session.user.id,
                title: "Client Archived",
                message: `Client "${existing.name}" has been archived`,
                type: "warning",
            });
        } else if (isArchived === false) {
            await createNotification({
                userId: session.user.id,
                title: "Client Restored",
                message: `Client "${existing.name}" has been restored`,
                type: "success",
            });
        } else if (name || email || phone || notes) {
            await createNotification({
                userId: session.user.id,
                title: "Client Updated",
                message: `Client "${client.name}" has been updated`,
                type: "info",
                link: `/clients/${client.id}`,
            });
        }

        return NextResponse.json(client);
    } catch (error) {
        console.error("Error updating client:", error);
        return NextResponse.json(
            { error: "Failed to update client" },
            { status: 500 }
        );
    }
}

// DELETE /api/clients/:id - Permanently delete or archive client
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const permanent = searchParams.get("permanent") === "true";

    try {
        // Verify ownership
        const existing = await prisma.client.findFirst({
            where: { id, userId: session.user.id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        if (permanent) {
            // Permanent delete - cascade will handle related records
            await prisma.client.delete({ where: { id } });

            await createNotification({
                userId: session.user.id,
                title: "Client Deleted",
                message: `Client "${existing.name}" has been permanently deleted`,
                type: "error",
            });
        } else {
            // Soft delete (archive)
            await prisma.client.update({
                where: { id },
                data: { isArchived: true },
            });

            await createNotification({
                userId: session.user.id,
                title: "Client Archived",
                message: `Client "${existing.name}" has been archived`,
                type: "warning",
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json(
            { error: "Failed to delete client" },
            { status: 500 }
        );
    }
}
