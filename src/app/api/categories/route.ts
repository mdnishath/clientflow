import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

interface CategoryWithStats {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    isSystem: boolean;
    isActive: boolean;
    isArchived: boolean;
    sortOrder: number;
    templateCount: number;
    contextCount: number;
}

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get("includeArchived") === "true";
        const activeOnly = searchParams.get("activeOnly") === "true";

        // Build where clause - only show current user's categories
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            userId: session.user.id,
        };

        if (!includeArchived) {
            where.isArchived = false;
        }

        if (activeOnly) {
            where.isActive = true;
        }

        const categories = await prisma.category.findMany({
            where,
            orderBy: [
                { sortOrder: "asc" },
                { name: "asc" }
            ],
        });

        // Get template and context counts
        const categoriesWithStats: CategoryWithStats[] = await Promise.all(
            categories.map(async (cat) => {
                const [templateCount, contextCount] = await Promise.all([
                    prisma.reviewTemplate.count({
                        where: { userId: session.user.id, category: cat.slug }
                    }),
                    prisma.reviewContext.count({
                        where: { userId: session.user.id, category: cat.slug }
                    })
                ]);
                return {
                    ...cat,
                    templateCount,
                    contextCount
                };
            })
        );

        return NextResponse.json(categoriesWithStats);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, icon, color, sortOrder } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Name and slug are required" },
                { status: 400 }
            );
        }

        // Check for duplicate slug
        const existing = await prisma.category.findFirst({
            where: {
                userId: session.user.id,
                slug: slug.toUpperCase().replace(/\s+/g, "_")
            }
        });

        if (existing) {
            return NextResponse.json(
                { error: "A category with this slug already exists" },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                userId: session.user.id,
                name,
                slug: slug.toUpperCase().replace(/\s+/g, "_"),
                description: description || null,
                icon: icon || null,
                color: color || null,
                sortOrder: sortOrder || 0,
            },
        });

        await createNotification({
            userId: session.user.id,
            title: "Category Created",
            message: `Category "${name}" has been created`,
            type: "success",
            link: "/admin/categories"
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}
