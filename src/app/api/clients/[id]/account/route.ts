import { prisma } from "@/lib/prisma";
import { requireAdmin, getClientScope } from "@/lib/rbac";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// POST /api/clients/[id]/account - Create login account for client
// ADMIN only
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Find the client
        const client = await prisma.client.findUnique({
            where: { id },
            include: { userAccount: true },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Check if account already exists
        if (client.userAccount) {
            return NextResponse.json(
                { error: "Client already has a login account", existingEmail: client.userAccount.email },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { email, password, canDelete = false } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 400 }
            );
        }

        // Create user account linked to client
        const passwordHash = await hash(password, 10);
        const userAccount = await prisma.user.create({
            data: {
                email,
                name: client.name,
                role: "CLIENT",
                clientId: client.id,
                canDelete,
                passwordHash,
            },
        });

        return NextResponse.json({
            message: "Client account created successfully",
            account: {
                id: userAccount.id,
                email: userAccount.email,
                name: userAccount.name,
                canDelete: userAccount.canDelete,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating client account:", error);
        return NextResponse.json(
            { error: "Failed to create client account" },
            { status: 500 }
        );
    }
}

// PATCH /api/clients/[id]/account - Update client account permissions
// ADMIN only
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const error = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const client = await prisma.client.findUnique({
            where: { id },
            include: { userAccount: true },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        if (!client.userAccount) {
            return NextResponse.json(
                { error: "Client does not have a login account" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { canDelete } = body;

        const updatedUser = await prisma.user.update({
            where: { id: client.userAccount.id },
            data: {
                canDelete: canDelete ?? client.userAccount.canDelete,
            },
        });

        return NextResponse.json({
            message: "Client account updated",
            account: {
                id: updatedUser.id,
                email: updatedUser.email,
                canDelete: updatedUser.canDelete,
            },
        });
    } catch (error) {
        console.error("Error updating client account:", error);
        return NextResponse.json(
            { error: "Failed to update client account" },
            { status: 500 }
        );
    }
}

// DELETE /api/clients/[id]/account - Remove client login account
// ADMIN only
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const error = await requireAdmin();
    if (error) return error;

    const { id } = await params;

    try {
        const client = await prisma.client.findUnique({
            where: { id },
            include: { userAccount: true },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        if (!client.userAccount) {
            return NextResponse.json(
                { error: "Client does not have a login account" },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: { id: client.userAccount.id },
        });

        return NextResponse.json({
            message: "Client account removed successfully",
        });
    } catch (error) {
        console.error("Error removing client account:", error);
        return NextResponse.json(
            { error: "Failed to remove client account" },
            { status: 500 }
        );
    }
}
