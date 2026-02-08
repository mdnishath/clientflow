import { prisma } from "@/lib/prisma";
import { requireAdmin, getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// PATCH /api/admin/clients/[id] - Update client account
// PATCH /api/admin/clients/[id] - Update client account
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const clientId = params.id;

        // RBAC: Verify this client belongs to this admin
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: scope.userId, // Must belong to this admin
            },
            include: {
                userAccount: true,
            },
        });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found or unauthorized" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const {
            name, email, password, phone, notes,
            canDelete, // Maps to User.canDelete
            canCreateProfiles, canEditProfiles, canDeleteProfiles,
            canCreateReviews, canEditReviews, canDeleteReviews
        } = body;

        // Update in transaction
        const updated = await prisma.$transaction(async (tx) => {
            // Update client record
            const updatedClient = await tx.client.update({
                where: { id: clientId },
                data: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(phone !== undefined && { phone }),
                    ...(notes !== undefined && { notes }),
                    // Permissions
                    ...(canCreateProfiles !== undefined && { canCreateProfiles }),
                    ...(canEditProfiles !== undefined && { canEditProfiles }),
                    ...(canDeleteProfiles !== undefined && { canDeleteProfiles }),
                    ...(canCreateReviews !== undefined && { canCreateReviews }),
                    ...(canEditReviews !== undefined && { canEditReviews }),
                    ...(canDeleteReviews !== undefined && { canDeleteReviews }),
                },
            });

            // Update user account if exists
            if (client.userAccount) {
                const userData: any = {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(canDelete !== undefined && { canDelete }),
                };

                // Hash password if provided
                if (password) {
                    userData.passwordHash = await bcrypt.hash(password, 10);
                }

                await tx.user.update({
                    where: { id: client.userAccount.id },
                    data: userData,
                });
            }

            return updatedClient;
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating client:", error);
        return NextResponse.json(
            { error: "Failed to update client" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/clients/[id] - Delete (archive) client
// DELETE /api/admin/clients/[id] - Delete (archive) client
export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const clientId = params.id;

        // RBAC: Verify this client belongs to this admin
        const client = await prisma.client.findFirst({
            where: {
                id: clientId,
                userId: scope.userId,
            },
        });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found or unauthorized" },
                { status: 404 }
            );
        }

        // Archive instead of delete
        await prisma.client.update({
            where: { id: clientId },
            data: { isArchived: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error archiving client:", error);
        return NextResponse.json(
            { error: "Failed to archive client" },
            { status: 500 }
        );
    }
}
