import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/finance/worker-salary - List all worker salaries (admin only)
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
        const workerId = searchParams.get("workerId");
        const isPaid = searchParams.get("isPaid");

        const whereClause: any = {};
        if (workerId) whereClause.workerId = workerId;
        if (isPaid !== null && isPaid !== undefined) {
            whereClause.isPaid = isPaid === "true";
        }

        const salaries = await prisma.workerSalary.findMany({
            where: whereClause,
            include: {
                worker: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        logger.info(`Fetched ${salaries.length} worker salaries`, { workerId, isPaid }, "finance");

        return NextResponse.json({ salaries });
    } catch (error) {
        logger.error("Failed to fetch worker salaries", error, "finance");
        return NextResponse.json(
            { error: "Failed to fetch worker salaries" },
            { status: 500 }
        );
    }
}

// POST /api/finance/worker-salary - Create new salary record
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
            workerId,
            amount,
            salaryType,
            currency = "USD",
            effectiveFrom,
            notes,
            isPaid = false,
        } = body;

        // Validation
        if (!workerId || !amount || !salaryType || !effectiveFrom) {
            return NextResponse.json(
                { error: "Missing required fields: workerId, amount, salaryType, effectiveFrom" },
                { status: 400 }
            );
        }

        if (!["MONTHLY", "HOURLY", "PER_REVIEW", "BONUS", "OTHER"].includes(salaryType)) {
            return NextResponse.json(
                { error: "Invalid salaryType. Must be MONTHLY, HOURLY, PER_REVIEW, BONUS, or OTHER" },
                { status: 400 }
            );
        }

        // Verify worker exists
        const worker = await prisma.user.findUnique({
            where: { id: workerId },
        });

        if (!worker) {
            return NextResponse.json({ error: "Worker not found" }, { status: 404 });
        }

        const salary = await prisma.workerSalary.create({
            data: {
                workerId,
                amount,
                salaryType,
                currency,
                effectiveFrom: new Date(effectiveFrom),
                notes: notes?.trim() || null,
                isPaid,
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

        logger.info(`Created salary record for worker ${worker.name}`, { salaryId: salary.id, amount, salaryType }, "finance");

        return NextResponse.json({ salary }, { status: 201 });
    } catch (error) {
        logger.error("Failed to create worker salary", error, "finance");
        return NextResponse.json(
            { error: "Failed to create worker salary" },
            { status: 500 }
        );
    }
}
