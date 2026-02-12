import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/finance/payments/:id - Get single payment
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
        }

        const { id } = await params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        return NextResponse.json({ payment });
    } catch (error) {
        logger.error("Failed to fetch payment", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch payment" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/payments/:id - Update payment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const {
            amount,
            paymentMethod,
            status,
            paymentDate,
            transactionId,
            notes,
        } = body;

        // Verify payment exists
        const existing = await prisma.payment.findUnique({
            where: { id },
            include: {
                worker: { select: { name: true, id: true } },
                client: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        const updateData: any = {};
        if (amount !== undefined) updateData.amount = amount;
        if (paymentMethod !== undefined) {
            if (!["BANK_TRANSFER", "PAYPAL", "STRIPE", "CASH", "CHECK", "CRYPTO", "OTHER"].includes(paymentMethod)) {
                return NextResponse.json(
                    { error: "Invalid paymentMethod" },
                    { status: 400 }
                );
            }
            updateData.paymentMethod = paymentMethod;
        }
        if (status !== undefined) {
            if (!["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
                return NextResponse.json(
                    { error: "Invalid status" },
                    { status: 400 }
                );
            }
            updateData.status = status;
        }
        if (paymentDate !== undefined) updateData.paymentDate = new Date(paymentDate);
        if (transactionId !== undefined) updateData.transactionId = transactionId?.trim() || null;
        if (notes !== undefined) updateData.notes = notes?.trim() || null;

        const payment = await prisma.payment.update({
            where: { id },
            data: updateData,
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Notify if payment completed
        if (status === "COMPLETED" && existing.status !== "COMPLETED") {
            if (existing.paymentType === "WORKER_SALARY" && existing.workerId) {
                await createNotification({
                    userId: existing.workerId,
                    title: "Payment Received",
                    message: `Your payment of ${payment.currency} ${payment.amount} has been completed`,
                    type: "success",
                    link: "/finance",
                });
            }

            await createNotification({
                userId: session.user.id,
                title: "Payment Completed",
                message: `Payment of ${payment.currency} ${payment.amount} has been marked as completed`,
                type: "success",
                link: "/finance",
            });
        }

        logger.info(
            `Updated payment`,
            { paymentId: id, status },
            "finance"
        );

        return NextResponse.json({ payment });
    } catch (error) {
        logger.error("Failed to update payment", error, "finance");
        return NextResponse.json(
            { error: "Failed to update payment" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/payments/:id - Delete payment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
        }

        const { id } = await params;

        const existing = await prisma.payment.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        // Don't allow deletion of completed payments
        if (existing.status === "COMPLETED") {
            return NextResponse.json(
                { error: "Cannot delete completed payments" },
                { status: 400 }
            );
        }

        await prisma.payment.delete({ where: { id } });

        logger.info(
            `Deleted payment`,
            { paymentId: id },
            "finance"
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to delete payment", error, "finance");
        return NextResponse.json(
            { error: "Failed to delete payment" },
            { status: 500 }
        );
    }
}
