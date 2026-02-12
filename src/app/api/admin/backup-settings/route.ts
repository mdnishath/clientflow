/**
 * Settings-Only Backup API
 * Exports ONLY configuration data (templates, contexts, categories)
 * Perfect for cross-deployment configuration transfer
 * Does NOT include: profiles, reviews, clients (business data)
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

export async function GET() {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Export only configuration/settings data
        const [templates, contexts, categories] = await Promise.all([
            // Review Templates - with RBAC filtering
            prisma.reviewTemplate.findMany({
                where: { userId: scope.userId },
                select: {
                    name: true,
                    lines: true,
                    promptInstruction: true,
                    exampleOutput: true,
                    namePosition: true,
                    category: true,
                    tags: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            // Review Contexts - with RBAC filtering
            prisma.reviewContext.findMany({
                where: { userId: scope.userId },
                select: {
                    type: true,
                    title: true,
                    content: true,
                    tone: true,
                    category: true,
                    tags: true,
                    createdAt: true,
                },
            }),
            // Categories - with RBAC filtering (userId exists in model)
            prisma.category.findMany({
                where: { userId: scope.userId },
                select: {
                    name: true,
                    slug: true,
                    description: true,
                    icon: true,
                    color: true,
                    createdAt: true,
                },
            }),
        ]);

        const settingsBackup = {
            meta: {
                version: "1.0",
                type: "settings-only",
                exportedAt: new Date().toISOString(),
                exportedBy: scope.userId,
                description: "Configuration backup (templates, contexts, categories only)",
            },
            templates,
            contexts,
            categories,
        };

        const filename = `clientflow-settings-${new Date().toISOString().split('T')[0]}.json`;

        return new NextResponse(JSON.stringify(settingsBackup, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Settings backup error:", error);
        return NextResponse.json(
            { error: "Failed to create settings backup" },
            { status: 500 }
        );
    }
}
