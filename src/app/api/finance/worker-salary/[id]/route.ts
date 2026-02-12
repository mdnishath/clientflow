import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/finance/worker-salary/:id - Get single salary record
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

        const salary = await prisma.workerSalary.findUnique({
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

        if (!salary) {
            return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
        }

        return NextResponse.json({ salary });
    } catch (error) {
        logger.error("Failed to fetch salary record", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch salary record" },
            { status: 500 }
        );
    }
}

// PATCH /api/finance/worker-salary/:id - Update salary record
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
            salaryType,
            currency,
            effectiveFrom,
            notes,
            isPaid,
        } = body;

        // Verify record exists
        const existing = await prisma.workerSalary.findUnique({
            where: { id },
            include: {
                worker: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
        }

        const updateData: any = {};
        if (amount !== undefined) updateData.amount = amount;
        if (salaryType !== undefined) {
            if (!["MONTHLY", "HOURLY", "PER_REVIEW", "BONUS", "OTHER"].includes(salaryType)) {
                return NextResponse.json(
                    { error: "Invalid salaryType" },
                    { status: 400 }
                );
            }
            updateData.salaryType = salaryType;
        }
        if (currency !== undefined) updateData.currency = currency;
        if (effectiveFrom !== undefined) updateData.effectiveFrom = new Date(effectiveFrom);
        if (notes !== undefined) updateData.notes = notes?.trim() || null;
        if (isPaid !== undefined) updateData.isPaid = isPaid;

        const salary = await prisma.workerSalary.update({
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
            },
        });

        logger.info(`Updated salary record for ${existing.worker.name}`, { salaryId: id }, "finance");

        return NextResponse.json({ salary });
    } catch (error) {
        logger.error("Failed to update salary record", error, "finance");
        return NextResponse.json(
            { error: "Failed to update salary record" },
            { status: 500 }
        );
    }
}

// DELETE /api/finance/worker-salary/:id - Delete salary record
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

        const existing = await prisma.workerSalary.findUnique({
            where: { id },
            include: {
                worker: { select: { name: true } },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Salary record not found" }, { status: 404 });
        }

        await prisma.workerSalary.delete({ where: { id } });

        logger.info(`Deleted salary record for ${existing.worker.name}`, { salaryId: id }, "finance");

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error("Failed to delete salary record", error, "finance");
        return NextResponse.json(
            { error: "Failed to delete salary record" },
            { status: 500 }
        );
    }
}
