import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// GET /api/admin/workers/stats - Get worker performance stats (ADMIN only)
export async function GET() {
    const error = await requireRole(["ADMIN"]);
    if (error) return error;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get all workers under this admin
        const workers = await prisma.user.findMany({
            where: {
                parentAdminId: session.user.id,
                role: "WORKER",
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });

        const workerIds = workers.map(w => w.id);

        // Get review counts grouped by worker and status (for createdBy)
        const createdStats = await prisma.review.groupBy({
            by: ["createdById", "status"],
            where: {
                createdById: { in: workerIds },
            },
            _count: { id: true },
        });

        // Get review counts grouped by worker and status (for updatedBy - status changes)
        const updatedStats = await prisma.review.groupBy({
            by: ["updatedById", "status"],
            where: {
                updatedById: { in: workerIds },
            },
            _count: { id: true },
        });

        // Build stats map per worker
        const statsMap: Record<string, {
            created: Record<string, number>;
            updated: Record<string, number>;
            totalCreated: number;
            totalUpdated: number;
        }> = {};

        // Initialize with empty stats for all workers
        for (const worker of workers) {
            statsMap[worker.id] = {
                created: {},
                updated: {},
                totalCreated: 0,
                totalUpdated: 0,
            };
        }

        // Populate created stats
        for (const stat of createdStats) {
            if (stat.createdById && statsMap[stat.createdById]) {
                statsMap[stat.createdById].created[stat.status] = stat._count.id;
                statsMap[stat.createdById].totalCreated += stat._count.id;
            }
        }

        // Populate updated stats
        for (const stat of updatedStats) {
            if (stat.updatedById && statsMap[stat.updatedById]) {
                statsMap[stat.updatedById].updated[stat.status] = stat._count.id;
                statsMap[stat.updatedById].totalUpdated += stat._count.id;
            }
        }

        // Combine with worker info
        const result = workers.map(worker => ({
            ...worker,
            stats: statsMap[worker.id],
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch worker stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch worker stats" },
            { status: 500 }
        );
    }
}
