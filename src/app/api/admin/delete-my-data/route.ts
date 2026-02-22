import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * DELETE /api/admin/delete-my-data
 *
 * Deletes ALL data created by the current admin user
 * - Clients and their profiles/reviews
 * - Reviews created/updated by this admin
 * - Tags, templates, contexts
 * - Categories, notifications
 * - Finance records (billings, invoices, payments, salaries)
 * - Workers under this admin
 * - Audit logs
 *
 * DOES NOT DELETE:
 * - The admin's user account (role, email, password)
 *
 * This is a DESTRUCTIVE operation and cannot be undone!
 */
export async function DELETE() {
    try {
        const session = await auth();

        // Only admins can use this endpoint
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            );
        }

        const adminId = session.user.id;

        // Start a transaction to ensure all-or-nothing deletion
        await prisma.$transaction(async (tx) => {
            // 1. Delete all workers under this admin
            // First, get all worker IDs
            const workers = await tx.user.findMany({
                where: { parentAdminId: adminId },
                select: { id: true }
            });
            const workerIds = workers.map(w => w.id);

            // Delete worker-related data
            if (workerIds.length > 0) {
                await tx.workerSalary.deleteMany({ where: { workerId: { in: workerIds } } });
                await tx.payment.deleteMany({ where: { workerId: { in: workerIds } } });
                await tx.auditLog.deleteMany({ where: { userId: { in: workerIds } } });

                // Delete workers themselves (this will cascade to their reviews via onDelete: Cascade)
                await tx.user.deleteMany({ where: { id: { in: workerIds } } });
            }

            // 2. Delete all clients created by this admin (cascade will handle profiles/reviews)
            // But first, delete finance records
            const clients = await tx.client.findMany({
                where: { userId: adminId },
                select: { id: true }
            });
            const clientIds = clients.map(c => c.id);

            if (clientIds.length > 0) {
                // Delete client-related finance records
                await tx.payment.deleteMany({ where: { clientId: { in: clientIds } } });

                // Delete invoices and their relations
                const invoices = await tx.invoice.findMany({
                    where: { clientId: { in: clientIds } },
                    select: { id: true }
                });
                const invoiceIds = invoices.map(i => i.id);

                if (invoiceIds.length > 0) {
                    await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
                    await tx.clientBilling.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
                }

                await tx.invoice.deleteMany({ where: { clientId: { in: clientIds } } });
                await tx.clientBilling.deleteMany({ where: { clientId: { in: clientIds } } });

                // Now delete clients (cascade to profiles and reviews)
                await tx.client.deleteMany({ where: { userId: adminId } });
            }

            // 3. Delete admin's own created content
            await tx.tag.deleteMany({ where: { userId: adminId } });
            await tx.reviewTemplate.deleteMany({ where: { userId: adminId } });
            await tx.reviewContext.deleteMany({ where: { userId: adminId } });
            await tx.category.deleteMany({ where: { userId: adminId } });
            await tx.notification.deleteMany({ where: { userId: adminId } });

            // 4. Delete audit logs
            await tx.auditLog.deleteMany({ where: { userId: adminId } });

            // Note: We don't delete the admin's User record itself
            // This preserves their login credentials and role
        });

        // Create an audit log entry for this action
        await prisma.auditLog.create({
            data: {
                userId: adminId,
                action: "DELETE_ALL_DATA",
                entity: "admin",
                entityId: adminId,
                detail: "Admin deleted all their own data (clients, profiles, reviews, workers, finance records)"
            }
        });

        return NextResponse.json({
            success: true,
            message: "All your data has been successfully deleted. Your account access remains active."
        });

    } catch (error) {
        console.error("Error deleting admin data:", error);
        return NextResponse.json(
            { error: "Failed to delete data" },
            { status: 500 }
        );
    }
}
