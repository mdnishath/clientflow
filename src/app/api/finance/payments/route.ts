import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/finance/payments - List all payments
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const paymentType = searchParams.get("paymentType");
        const status = searchParams.get("status");
        const workerId = searchParams.get("workerId");
        const clientId = searchParams.get("clientId");

        const whereClause: any = {};
        if (paymentType) whereClause.paymentType = paymentType;
        if (status) whereClause.status = status;
        if (workerId) whereClause.workerId = workerId;
        if (clientId) whereClause.clientId = clientId;

        const payments = await prisma.payment.findMany({
            where: whereClause,
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
            orderBy: { createdAt: "desc" },
        });

        logger.info(`Fetched ${payments.length} payments`, { paymentType, status }, "finance");

        return NextResponse.json({ payments });
    } catch (error) {
        logger.error("Failed to fetch payments", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}

// POST /api/finance/payments - Create new payment record
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const {
            paymentType,
            amount,
            currency = "USD",
            paymentMethod,
            workerId,
            clientId,
            invoiceId,
            transactionId,
            status = "COMPLETED",
            paymentDate,
            notes,
        } = body;

        // Validation
        if (!paymentType || !amount || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing required fields: paymentType, amount, paymentMethod" },
                { status: 400 }
            );
        }

        if (!["CLIENT_PAYMENT", "WORKER_SALARY", "EXPENSE", "REFUND", "OTHER"].includes(paymentType)) {
            return NextResponse.json(
                { error: "Invalid paymentType" },
                { status: 400 }
            );
        }

        if (!["BANK_TRANSFER", "PAYPAL", "STRIPE", "CASH", "CHECK", "CRYPTO", "OTHER"].includes(paymentMethod)) {
            return NextResponse.json(
                { error: "Invalid paymentMethod" },
                { status: 400 }
            );
        }

        if (!["PENDING", "COMPLETED", "FAILED", "REFUNDED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        // Verify references exist
        if (workerId) {
            const workerExists = await prisma.user.findUnique({ where: { id: workerId } });
            if (!workerExists) {
                return NextResponse.json({ error: "Worker not found" }, { status: 404 });
            }
        }

        if (clientId) {
            const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
            if (!clientExists) {
                return NextResponse.json({ error: "Client not found" }, { status: 404 });
            }
        }

        if (invoiceId) {
            const invoiceExists = await prisma.invoice.findUnique({ where: { id: invoiceId } });
            if (!invoiceExists) {
                return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
            }
        }

        const payment = await prisma.payment.create({
            data: {
                paymentType,
                amount,
                currency,
                paymentMethod,
                workerId: workerId || null,
                clientId: clientId || null,
                invoiceId: invoiceId || null,
                transactionId: transactionId || null,
                status,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                notes: notes?.trim() || null,
                createdBy: session.user.id,
            },
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

        logger.info(
            `Created payment record`,
            { paymentId: payment.id, paymentType, amount },
            "finance"
        );

        return NextResponse.json({ payment }, { status: 201 });
    } catch (error) {
        logger.error("Failed to create payment", error, "finance");
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}
