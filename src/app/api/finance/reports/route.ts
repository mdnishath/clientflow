import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

// GET /api/finance/reports - Generate financial reports
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
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const reportType = searchParams.get("type") || "overview";

        // Date range for filtering
        const dateFilter: any = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        let report: any = {};

        if (reportType === "overview" || reportType === "all") {
            // Revenue Overview
            const invoices = await prisma.invoice.findMany({
                where: dateFilter.gte ? { createdAt: dateFilter } : {},
                select: {
                    status: true,
                    totalAmount: true,
                    currency: true,
                },
            });

            const revenue = {
                total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
                paid: invoices.filter(inv => inv.status === "PAID").reduce((sum, inv) => sum + inv.totalAmount, 0),
                pending: invoices.filter(inv => inv.status === "SENT" || inv.status === "DRAFT").reduce((sum, inv) => sum + inv.totalAmount, 0),
                overdue: invoices.filter(inv => inv.status === "OVERDUE").reduce((sum, inv) => sum + inv.totalAmount, 0),
            };

            // Expenses Overview
            const salaries = await prisma.workerSalary.findMany({
                where: dateFilter.gte ? { createdAt: dateFilter } : {},
                select: {
                    amount: true,
                    isPaid: true,
                },
            });

            const expenses = {
                totalSalaries: salaries.reduce((sum, sal) => sum + sal.amount, 0),
                paidSalaries: salaries.filter(sal => sal.isPaid).reduce((sum, sal) => sum + sal.amount, 0),
                pendingSalaries: salaries.filter(sal => !sal.isPaid).reduce((sum, sal) => sum + sal.amount, 0),
            };

            // Payments Overview
            const payments = await prisma.payment.findMany({
                where: dateFilter.gte ? { createdAt: dateFilter } : {},
                select: {
                    paymentType: true,
                    amount: true,
                    status: true,
                },
            });

            const paymentStats = {
                total: payments.length,
                completed: payments.filter(p => p.status === "COMPLETED").length,
                pending: payments.filter(p => p.status === "PENDING").length,
                failed: payments.filter(p => p.status === "FAILED").length,
                totalAmount: payments.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0),
            };

            report.overview = {
                revenue,
                expenses,
                payments: paymentStats,
                profit: revenue.paid - expenses.paidSalaries,
            };
        }

        if (reportType === "clients" || reportType === "all") {
            // Client-wise breakdown
            const clientBillings = await prisma.clientBilling.findMany({
                where: dateFilter.gte ? { createdAt: dateFilter } : {},
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            const clientStats = clientBillings.reduce((acc: any, billing) => {
                const clientId = billing.clientId;
                if (!acc[clientId]) {
                    acc[clientId] = {
                        clientId,
                        clientName: billing.client.name,
                        totalBilled: 0,
                        paid: 0,
                        pending: 0,
                    };
                }
                acc[clientId].totalBilled += billing.amount;
                if (billing.status === "PAID") {
                    acc[clientId].paid += billing.amount;
                } else {
                    acc[clientId].pending += billing.amount;
                }
                return acc;
            }, {});

            report.clients = Object.values(clientStats);
        }

        if (reportType === "workers" || reportType === "all") {
            // Worker-wise salary breakdown
            const workerSalaries = await prisma.workerSalary.findMany({
                where: dateFilter.gte ? { createdAt: dateFilter } : {},
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

            const workerStats = workerSalaries.reduce((acc: any, salary) => {
                const workerId = salary.workerId;
                if (!acc[workerId]) {
                    acc[workerId] = {
                        workerId,
                        workerName: salary.worker.name,
                        workerEmail: salary.worker.email,
                        totalSalary: 0,
                        paid: 0,
                        pending: 0,
                        payments: 0,
                    };
                }
                acc[workerId].totalSalary += salary.amount;
                if (salary.isPaid) {
                    acc[workerId].paid += salary.amount;
                    acc[workerId].payments++;
                } else {
                    acc[workerId].pending += salary.amount;
                }
                return acc;
            }, {});

            report.workers = Object.values(workerStats);
        }

        if (reportType === "timeline" || reportType === "all") {
            // Monthly breakdown - build query string dynamically
            let query = `
                SELECT
                    DATE_TRUNC('month', "created_at") as month,
                    COUNT(*) as count,
                    SUM("total_amount") as total
                FROM "invoices"
                WHERE "status" = 'PAID'
            `;

            if (dateFilter.gte) {
                query += ` AND "created_at" >= '${startDate}'`;
            }
            if (dateFilter.lte) {
                query += ` AND "created_at" <= '${endDate}'`;
            }

            query += `
                GROUP BY DATE_TRUNC('month', "created_at")
                ORDER BY month DESC
                LIMIT 12
            `;

            const monthlyData = await prisma.$queryRawUnsafe(query) as any;

            report.timeline = monthlyData;
        }

        logger.info(`Generated ${reportType} financial report`, { startDate, endDate }, "finance");

        return NextResponse.json({ report, reportType, dateRange: { startDate, endDate } });
    } catch (error) {
        logger.error("Failed to generate financial report", error, "finance");
        return NextResponse.json(
            { error: "Failed to generate financial report" },
            { status: 500 }
        );
    }
}
