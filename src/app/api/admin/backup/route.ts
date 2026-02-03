import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/rbac";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/backup
 * Exports database content as JSON
 * Requires ADMIN role
 */
export async function GET(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    try {
        // Fetch all data from critical tables
        // Using transaction to ensure consistent snapshot
        const backupData = await prisma.$transaction(async (tx) => {
            const users = await tx.user.findMany();
            const clients = await tx.client.findMany();
            const profiles = await tx.gmbProfile.findMany();
            const reviews = await tx.review.findMany();
            const templates = await tx.reviewTemplate.findMany();
            const contexts = await tx.reviewContext.findMany();
            const tags = await tx.tag.findMany();

            return {
                timestamp: new Date().toISOString(),
                version: "1.0",
                data: {
                    users,
                    clients,
                    profiles,
                    reviews,
                    templates,
                    contexts,
                    tags,
                },
            };
        });

        // Return as download
        return new NextResponse(JSON.stringify(backupData, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="backup-${new Date().toISOString().split("T")[0]}.json"`,
            },
        });
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json(
            { error: "Failed to generate backup" },
            { status: 500 }
        );
    }
}
