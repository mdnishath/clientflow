import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/finance/worker-salary/:id/pay - Mark salary as paid
export async function POST(request: NextRequest, { params }: RouteParams) {
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
        const { paymentDate, paymentMethod, transactionId, notes } = body;

        // Verify salary record exists
        const existing = await prisma.workerSalary.findUnique({
            where: { id },
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
        }

        if (existing.isPaid) {
            return NextResponse.json(
                { error: "Salary already marked as paid" },
                { status: 400 }
            );
        }

        // Use transaction to update salary and create payment record
        const result = await prisma.$transaction(async (tx) => {
            // Update salary record
            const salary = await tx.workerSalary.update({
                where: { id },
                data: {
                    isPaid: true,
                    paidAt: paymentDate ? new Date(paymentDate) : new Date(),
                },
                include: {
                    worker: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            // Create payment record
            const payment = await tx.payment.create({
                data: {
                    paymentType: "WORKER_SALARY",
                    amount: existing.amount,
                    currency: existing.currency,
                    paymentMethod: paymentMethod || "BANK_TRANSFER",
                    status: "COMPLETED",
                    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                    workerId: existing.workerId,
                    transactionId: transactionId || null,
                    notes: notes || null,
                    createdBy: session.user.id,
                },
            });

            return { salary, payment };
        }, {
            isolationLevel: 'ReadCommitted',
            timeout: 10000,
        });

        // Create notification for worker
        await createNotification({
            userId: existing.workerId,
            title: "Salary Paid",
            message: `Your ${existing.salaryType.toLowerCase()} salary of ${existing.currency} ${existing.amount} has been processed`,
            type: "success",
            link: "/finance",
        });

        logger.info(
            `Marked salary as paid for ${existing.worker.name}`,
            { salaryId: id, amount: existing.amount, paymentId: result.payment.id },
            "finance"
        );

        return NextResponse.json({
            salary: result.salary,
            payment: result.payment,
        });
    } catch (error) {
        logger.error("Failed to mark salary as paid", error, "finance");
        return NextResponse.json(
            { error: "Failed to mark salary as paid" },
            { status: 500 }
        );
    }
}
