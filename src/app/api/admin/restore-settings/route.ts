/**
 * Settings-Only Restore API
 * Imports ONLY configuration data (templates, contexts, categories)
 * Safe for cross-deployment - won't affect existing business data
 * Does NOT touch: profiles, reviews, clients
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";

interface SettingsBackup {
    meta: {
        version: string;
        type: string;
        exportedAt: string;
        exportedBy: string;
        description: string;
    };
    templates?: Array<{
        name: string;
        lines?: number;
        promptInstruction: string;
        exampleOutput?: string | null;
        namePosition?: string;
        category?: string | null;
        tags?: string[];
        isActive?: boolean;
        createdAt: Date | string;
    }>;
    contexts?: Array<{
        type: string;
        title: string;
        content: string;
        tone?: string | null;
        category?: string | null;
        tags?: string[];
        createdAt: Date | string;
    }>;
    categories?: Array<{
        name: string;
        slug: string;
        description?: string | null;
        icon?: string | null;
        color?: string | null;
        createdAt: Date | string;
    }>;
}

export async function POST(req: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backup: SettingsBackup = await req.json();

        // Validate backup format
        if (!backup.meta || backup.meta.type !== "settings-only") {
            return NextResponse.json(
                { error: "Invalid backup file - must be a settings-only backup" },
                { status: 400 }
            );
        }

        const stats = {
            templatesCreated: 0,
            contextsCreated: 0,
            categoriesCreated: 0,
            errors: [] as string[],
        };

        // Restore Templates
        if (backup.templates && Array.isArray(backup.templates)) {
            for (const template of backup.templates) {
                try {
                    // Check if template already exists
                    const existing = await prisma.reviewTemplate.findFirst({
                        where: {
                            userId: scope.userId,
                            name: template.name,
                        },
                    });

                    if (!existing) {
                        await prisma.reviewTemplate.create({
                            data: {
                                userId: scope.userId,
                                name: template.name,
                                lines: template.lines || 2,
                                promptInstruction: template.promptInstruction,
                                exampleOutput: template.exampleOutput || null,
                                namePosition: template.namePosition || "none",
                                category: template.category || null,
                                tags: template.tags || [],
                                isActive: template.isActive !== false,
                            },
                        });
                        stats.templatesCreated++;
                    } else {
                        // Update existing template
                        await prisma.reviewTemplate.update({
                            where: { id: existing.id },
                            data: {
                                lines: template.lines || 2,
                                promptInstruction: template.promptInstruction,
                                exampleOutput: template.exampleOutput || null,
                                namePosition: template.namePosition || "none",
                                category: template.category || null,
                                tags: template.tags || [],
                                isActive: template.isActive !== false,
                            },
                        });
                        stats.templatesCreated++;
                    }
                } catch (err: any) {
                    stats.errors.push(`Template "${template.name}": ${err.message}`);
                }
            }
        }

        // Restore Contexts
        if (backup.contexts && Array.isArray(backup.contexts)) {
            for (const context of backup.contexts) {
                try {
                    // Check if context already exists
                    const existing = await prisma.reviewContext.findFirst({
                        where: {
                            userId: scope.userId,
                            title: context.title,
                        },
                    });

                    if (!existing) {
                        await prisma.reviewContext.create({
                            data: {
                                userId: scope.userId,
                                type: context.type,
                                title: context.title,
                                content: context.content,
                                tone: context.tone || null,
                                category: context.category || null,
                                tags: context.tags || [],
                            },
                        });
                        stats.contextsCreated++;
                    } else {
                        // Update existing context
                        await prisma.reviewContext.update({
                            where: { id: existing.id },
                            data: {
                                type: context.type,
                                content: context.content,
                                tone: context.tone || null,
                                category: context.category || null,
                                tags: context.tags || [],
                            },
                        });
                        stats.contextsCreated++;
                    }
                } catch (err: any) {
                    stats.errors.push(`Context "${context.title}": ${err.message}`);
                }
            }
        }

        // Restore Categories (user-scoped in this system)
        if (backup.categories && Array.isArray(backup.categories)) {
            for (const category of backup.categories) {
                try {
                    // Check if category already exists for this user
                    const existing = await prisma.category.findFirst({
                        where: {
                            userId: scope.userId,
                            name: category.name,
                        },
                    });

                    if (!existing) {
                        await prisma.category.create({
                            data: {
                                userId: scope.userId,
                                name: category.name,
                                slug: category.slug,
                                description: category.description || null,
                                icon: category.icon || null,
                                color: category.color || null,
                            },
                        });
                        stats.categoriesCreated++;
                    }
                    // If exists, skip (don't update)
                } catch (err: any) {
                    stats.errors.push(`Category "${category.name}": ${err.message}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Settings restored successfully",
            stats,
        });
    } catch (error: any) {
        console.error("Settings restore error:", error);
        return NextResponse.json(
            {
                error: "Failed to restore settings",
                details: error.message
            },
            { status: 500 }
        );
    }
}
