import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/finance/client-billing - List all client billings
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

        const billings = await prisma.clientBilling.findMany({
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

        logger.info(`Fetched ${billings.length} client billings`, { clientId, status }, "finance");

        return NextResponse.json({ billings });
    } catch (error) {
        logger.error("Failed to fetch client billings", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch client billings" },
            { status: 500 }
        );
    }
}

// POST /api/finance/client-billing - Create new billing record
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
            amount,
            billingType,
            currency = "USD",
            billingDate,
            dueDate,
            description,
            status = "PENDING",
        } = body;

        // Validation
        if (!clientId || !amount || !billingType || !dueDate) {
            return NextResponse.json(
                { error: "Missing required fields: clientId, amount, billingType, dueDate" },
                { status: 400 }
            );
        }

        if (!["PER_REVIEW", "MONTHLY", "FIXED_PROJECT", "HOURLY", "OTHER"].includes(billingType)) {
            return NextResponse.json(
                { error: "Invalid billingType" },
                { status: 400 }
            );
        }

        if (!["PENDING", "PAID", "OVERDUE", "CANCELLED"].includes(status)) {
            return NextResponse.json(
                { error: "Invalid status" },
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

        const billing = await prisma.clientBilling.create({
            data: {
                clientId,
                amount,
                billingType,
                currency,
                billingDate: billingDate ? new Date(billingDate) : new Date(),
                dueDate: new Date(dueDate), // Required field
                description: description?.trim() || "",
                status,
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
            `Created billing record for client ${client.name}`,
            { billingId: billing.id, amount, billingType },
            "finance"
        );

        return NextResponse.json({ billing }, { status: 201 });
    } catch (error) {
        logger.error("Failed to create client billing", error, "finance");
        return NextResponse.json(
            { error: "Failed to create client billing" },
            { status: 500 }
        );
    }
}
