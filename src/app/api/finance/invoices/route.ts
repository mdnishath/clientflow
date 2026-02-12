import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/finance/invoices - List all invoices
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
        const clientId = searchParams.get("clientId");
        const status = searchParams.get("status");

        const whereClause: any = {};
        if (clientId) whereClause.clientId = clientId;
        if (status) whereClause.status = status;

        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: {
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

        logger.info(`Fetched ${invoices.length} invoices`, { clientId, status }, "finance");

        return NextResponse.json({ invoices });
    } catch (error) {
        logger.error("Failed to fetch invoices", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch invoices" },
            { status: 500 }
        );
    }
}

// POST /api/finance/invoices - Create new invoice
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
            clientId,
            items,
            taxRate = 0,
            discount = 0,
            notes,
            dueDate,
            currency = "USD",
        } = body;

        // Validation
        if (!clientId || !items || !Array.isArray(items) || items.length === 0 || !dueDate) {
            return NextResponse.json(
                { error: "Missing required fields: clientId, items (must be non-empty array), dueDate" },
                { status: 400 }
            );
        }

        // Verify client exists
        const client = await prisma.client.findUnique({
            where: { id: clientId },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Calculate totals
        const amount = items.reduce((sum: number, item: any) => {
            return sum + (item.quantity * item.rate);
        }, 0);

        const tax = taxRate ? (amount * (taxRate / 100)) : 0;
        const totalAmount = amount + tax - discount;

        // Generate invoice number (format: INV-YYYYMMDD-XXX)
        const today = new Date();
        const datePrefix = today.toISOString().split('T')[0].replace(/-/g, '');
        const count = await prisma.invoice.count({
            where: {
                invoiceNumber: {
                    startsWith: `INV-${datePrefix}`,
                },
            },
        });
        const invoiceNumber = `INV-${datePrefix}-${String(count + 1).padStart(3, '0')}`;

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber,
                clientId,
                amount,
                tax,
                discount,
                totalAmount,
                currency,
                items,
                notes: notes?.trim() || null,
                dueDate: new Date(dueDate), // Required field
                status: "DRAFT",
                createdBy: session.user.id,
            },
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

        logger.info(
            `Created invoice ${invoiceNumber} for client ${client.name}`,
            { invoiceId: invoice.id, totalAmount },
            "finance"
        );

        return NextResponse.json({ invoice }, { status: 201 });
    } catch (error) {
        logger.error("Failed to create invoice", error, "finance");
        return NextResponse.json(
            { error: "Failed to create invoice" },
            { status: 500 }
        );
    }
}
