import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/restore
 * Restores database from JSON backup
 * Requires ADMIN role
 */
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    try {
        const body = await request.json();
        const { data } = body;

        if (!data || !data.users) {
            return NextResponse.json(
                { error: "Invalid backup file format" },
                { status: 400 }
            );
        }

        // Execute restore in a transaction
        await prisma.$transaction(async (tx) => {
            // 1. CLEAR EXISTING DATA (Reverse dependency order)
            await tx.review.deleteMany();
            await tx.gmbProfile.deleteMany();

            // We need to break the User-Client circular link before deleting
            // updateMany cannot be used on unique fields in some Prisma versions, so we use loop
             
            const linkedUsers = await tx.user.findMany({
                where: { linkedClient: { isNot: null } } as any,
                select: { id: true }
            });

            for (const user of linkedUsers) {
                await tx.user.update({
                    where: { id: user.id },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data: { linkedClient: { disconnect: true } } as any
                });
            }

            await tx.client.deleteMany();
            await tx.tag.deleteMany();
            await tx.reviewTemplate.deleteMany();
            await tx.reviewContext.deleteMany();
            // Delete users last (parents)
            await tx.user.deleteMany();

            // 2. RESTORE DATA (Dependency order)

            // Users - Insert without clientId first (circular dep)
            if (data.users && data.users.length > 0) {
                await tx.user.createMany({
                    data: data.users.map((u: any) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { clientId, ...rest } = u; // Remove clientId
                        return {
                            ...rest,
                            clientId: null, // Defer linking
                        };
                    }) as any,
                });
            }

            // Clients
            if (data.clients && data.clients.length > 0) {
                await tx.client.createMany({
                    data: data.clients.map((c: any) => ({
                        ...c,
                    })),
                });
            }

            // Re-link Users to Clients
            // We only need to update users that had a clientId
            const clientUsers = data.users.filter((u: any) => u.clientId);
            for (const u of clientUsers) {
                await tx.user.update({
                    where: { id: u.id },
                     
                    data: {
                        linkedClient: { connect: { id: u.clientId } }
                    } as any,
                });
            }

            // GmbProfiles
            if (data.profiles.length > 0) {
                await tx.gmbProfile.createMany({
                    data: data.profiles,
                });
            }

            // Auxiliary tables
            if (data.tags && data.tags.length > 0) {
                await tx.tag.createMany({ data: data.tags });
            }
            if (data.templates && data.templates.length > 0) {
                await tx.reviewTemplate.createMany({ data: data.templates });
            }
            if (data.contexts && data.contexts.length > 0) {
                await tx.reviewContext.createMany({ data: data.contexts });
            }

            // Reviews
            if (data.reviews.length > 0) {
                await tx.review.createMany({
                    data: data.reviews,
                });
            }
        });

        return NextResponse.json({ success: true, message: "Database restored successfully" });
    } catch (error) {
        console.error("Restore error:", error);
        return NextResponse.json(
            { error: "Failed to restore database: " + (error as Error).message },
            { status: 500 }
        );
    }
}
