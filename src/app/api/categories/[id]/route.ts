import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/categories/[id] - Get single category with stats
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const category = await prisma.category.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Get stats
        const [templateCount, contextCount] = await Promise.all([
            prisma.reviewTemplate.count({
                where: { userId: session.user.id, category: category.slug }
            }),
            prisma.reviewContext.count({
                where: { userId: session.user.id, category: category.slug }
            })
        ]);

        return NextResponse.json({
            ...category,
            templateCount,
            contextCount
        });
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return NextResponse.json(
            { error: "Failed to fetch category" },
            { status: 500 }
        );
    }
}

// PATCH /api/categories/[id] - Update category
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.category.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Handle restore from archive
        if (body.isArchived === false && existing.isArchived) {
            const category = await prisma.category.update({
                where: { id },
                data: { isArchived: false },
            });

            await createNotification({
                userId: session.user.id,
                title: "Category Restored",
                message: `Category "${existing.name}" has been restored`,
                type: "success",
                link: "/admin/categories"
            });

            return NextResponse.json(category);
        }

        // Regular update
        const { name, slug, description, icon, color, isActive, sortOrder } = body;
        const oldSlug = existing.slug;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (slug !== undefined) updateData.slug = slug.toUpperCase().replace(/\s+/g, "_");
        if (description !== undefined) updateData.description = description;
        if (icon !== undefined) updateData.icon = icon;
        if (color !== undefined) updateData.color = color;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

        const category = await prisma.category.update({
            where: { id },
            data: updateData,
        });

        // If slug changed, update all templates and contexts
        if (slug && slug.toUpperCase().replace(/\s+/g, "_") !== oldSlug) {
            const newSlug = slug.toUpperCase().replace(/\s+/g, "_");
            await Promise.all([
                prisma.reviewTemplate.updateMany({
                    where: { userId: session.user.id, category: oldSlug },
                    data: { category: newSlug }
                }),
                prisma.reviewContext.updateMany({
                    where: { userId: session.user.id, category: oldSlug },
                    data: { category: newSlug }
                })
            ]);
        }

        await createNotification({
            userId: session.user.id,
            title: "Category Updated",
            message: `Category "${category.name}" has been updated`,
            type: "info",
            link: "/admin/categories"
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("Failed to update category:", error);
        return NextResponse.json(
            { error: "Failed to update category" },
            { status: 500 }
        );
    }
}

// DELETE /api/categories/[id] - Archive or permanently delete
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const permanent = searchParams.get("permanent") === "true";

        const existing = await prisma.category.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!existing) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // System categories cannot be deleted
        if (existing.isSystem) {
            return NextResponse.json(
                { error: "System categories cannot be deleted" },
                { status: 400 }
            );
        }

        if (permanent) {
            // Permanent delete - set templates/contexts category to null
            await Promise.all([
                prisma.reviewTemplate.updateMany({
                    where: { userId: session.user.id, category: existing.slug },
                    data: { category: null }
                }),
                prisma.reviewContext.updateMany({
                    where: { userId: session.user.id, category: existing.slug },
                    data: { category: null }
                })
            ]);

            await prisma.category.delete({ where: { id } });

            await createNotification({
                userId: session.user.id,
                title: "Category Deleted",
                message: `Category "${existing.name}" has been permanently deleted`,
                type: "error",
            });

            return NextResponse.json({ success: true, action: "deleted" });
        } else {
            // Archive
            await prisma.category.update({
                where: { id },
                data: { isArchived: true },
            });

            await createNotification({
                userId: session.user.id,
                title: "Category Archived",
                message: `Category "${existing.name}" has been archived`,
                type: "warning",
                link: "/admin/categories"
            });

            return NextResponse.json({ success: true, action: "archived" });
        }
    } catch (error) {
        console.error("Failed to delete category:", error);
        return NextResponse.json(
            { error: "Failed to delete category" },
            { status: 500 }
        );
    }
}
