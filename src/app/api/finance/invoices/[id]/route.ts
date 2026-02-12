import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/finance/invoices/:id - Get single invoice
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

        const invoice = await prisma.invoice.findUnique({
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

        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        return NextResponse.json({ invoice });
    } catch (error) {
        logger.error("Failed to fetch invoice", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch invoice" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/invoices/:id - Update invoice
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
            items,
            taxRate,
            discount,
            notes,
            dueDate,
            status,
            paidAt,
        } = body;

        // Verify invoice exists
        const existing = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        const updateData: any = {};

        // Recalculate totals if items or tax/discount changed
        if (items !== undefined || taxRate !== undefined || discount !== undefined) {
            const invoiceItems = items ?? existing.items;
            const newTax = taxRate ? ((existing.amount || 0) * (taxRate / 100)) : (existing.tax || 0);
            const newDiscount = discount ?? (existing.discount || 0);

            const amount = (invoiceItems as any[]).reduce((sum: number, item: any) => {
                return sum + (item.quantity * item.rate);
            }, 0);

            const tax = taxRate ? (amount * (taxRate / 100)) : newTax;
            const totalAmount = amount + tax - newDiscount;

            updateData.items = invoiceItems;
            updateData.amount = amount;
            updateData.tax = tax;
            updateData.discount = newDiscount;
            updateData.totalAmount = totalAmount;
        }

        if (notes !== undefined) updateData.notes = notes?.trim() || null;
        if (dueDate !== undefined) updateData.dueDate = new Date(dueDate); // Required field
        if (status !== undefined) {
            if (!["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"].includes(status)) {
                return NextResponse.json(
                    { error: "Invalid status" },
                    { status: 400 }
                );
            }
            updateData.status = status;
        }
        if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null;

        const invoice = await prisma.invoice.update({
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
                title: "Invoice Paid",
                message: `Invoice ${existing.invoiceNumber} from ${existing.client.name} has been paid`,
                type: "success",
                link: "/finance",
            });
        }

        // Notify if status changed to SENT
        if (status === "SENT" && existing.status === "DRAFT") {
            await createNotification({
                userId: session.user.id,
                title: "Invoice Sent",
                message: `Invoice ${existing.invoiceNumber} sent to ${existing.client.name}`,
                type: "info",
                link: "/finance",
            });
        }

        logger.info(
            `Updated invoice ${existing.invoiceNumber} for ${existing.client.name}`,
            { invoiceId: id, status },
            "finance"
        );

        return NextResponse.json({ invoice });
    } catch (error) {
        logger.error("Failed to update invoice", error, "finance");
        return NextResponse.json(
            { error: "Failed to update invoice" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/invoices/:id - Delete invoice
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

        const existing = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Don't allow deletion of paid invoices
        if (existing.status === "PAID") {
            return NextResponse.json(
                { error: "Cannot delete paid invoices" },
                { status: 400 }
            );
        }

        await prisma.invoice.delete({ where: { id } });

        logger.info(
            `Deleted invoice ${existing.invoiceNumber} for ${existing.client.name}`,
            { invoiceId: id },
            "finance"
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to delete invoice", error, "finance");
        return NextResponse.json(
            { error: "Failed to delete invoice" },
            { status: 500 }
        );
    }
}
