import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/finance/client-billing/:id - Get single billing record
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

        const billing = await prisma.clientBilling.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!billing) {
            return NextResponse.json({ error: "Billing record not found" }, { status: 404 });
        }

        return NextResponse.json({ billing });
    } catch (error) {
        logger.error("Failed to fetch billing record", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch billing record" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/client-billing/:id - Update billing record
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
            billingType,
            currency,
            billingDate,
            dueDate,
            description,
            status,
        } = body;

        // Verify record exists
        const existing = await prisma.clientBilling.findUnique({
            where: { id },
            include: {
                client: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Billing record not found" }, { status: 404 });
        }

        const updateData: any = {};
        if (amount !== undefined) updateData.amount = amount;
        if (billingType !== undefined) {
            if (!["PER_REVIEW", "MONTHLY", "FIXED_PROJECT", "HOURLY", "OTHER"].includes(billingType)) {
                return NextResponse.json(
                    { error: "Invalid billingType" },
                    { status: 400 }
                );
            }
            updateData.billingType = billingType;
        }
        if (currency !== undefined) updateData.currency = currency;
        if (billingDate !== undefined) updateData.billingDate = new Date(billingDate);
        if (dueDate !== undefined) updateData.dueDate = new Date(dueDate); // Required field
        if (description !== undefined) updateData.description = description?.trim() || "";
        if (status !== undefined) {
            if (!["PENDING", "PAID", "OVERDUE", "CANCELLED"].includes(status)) {
                return NextResponse.json(
                    { error: "Invalid status" },
                    { status: 400 }
                );
            }
            updateData.status = status;
        }

        const billing = await prisma.clientBilling.update({
            where: { id },
            data: updateData,
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Notify if status changed to PAID
        if (status === "PAID" && existing.status !== "PAID") {
            await createNotification({
                userId: session.user.id,
                title: "Payment Received",
                message: `Payment of ${billing.currency} ${billing.amount} received from ${existing.client.name}`,
                type: "success",
                link: "/finance",
            });
        }

        logger.info(
            `Updated billing record for ${existing.client.name}`,
            { billingId: id, status },
            "finance"
        );

        return NextResponse.json({ billing });
    } catch (error) {
        logger.error("Failed to update billing record", error, "finance");
        return NextResponse.json(
            { error: "Failed to update billing record" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/client-billing/:id - Delete billing record
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

        const existing = await prisma.clientBilling.findUnique({
            where: { id },
            include: {
                client: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Billing record not found" }, { status: 404 });
        }

        await prisma.clientBilling.delete({ where: { id } });

        logger.info(
            `Deleted billing record for ${existing.client.name}`,
            { billingId: id },
            "finance"
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to delete billing record", error, "finance");
        return NextResponse.json(
            { error: "Failed to delete billing record" },
            { status: 500 }
        );
    }
}
