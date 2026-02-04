import { prisma } from "@/lib/prisma";
import { getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

// GET /api/filters/options - Get filter options for reviews page
export async function GET(request: NextRequest) {
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type"); // clients, profiles, categories

        if (type === "clients" && scope.isAdmin) {
            // Get all clients created by this admin
            const clients = await prisma.client.findMany({
                where: {
                    userId: scope.userId,
                    isArchived: false,
                },
                select: {
                    id: true,
                    name: true,
                },
                orderBy: { name: "asc" },
            });
            return NextResponse.json(clients);
        }

        if (type === "profiles") {
            // Get profiles based on user role  
            const whereClause: any = {
                isArchived: false,
            };

            if (scope.isAdmin) {
                whereClause.client = { userId: scope.userId };
            } else if (scope.clientId) {
                whereClause.clientId = scope.clientId;
            } else {
                // Client without clientId - return empty
                return NextResponse.json([]);
            }

            const profiles = await prisma.gmbProfile.findMany({
                where: whereClause,
                select: {
                    id: true,
                    businessName: true,
                    client: { select: { name: true } },
                },
                orderBy: { businessName: "asc" },
            });
            return NextResponse.json(profiles);
        }

        if (type === "categories") {
            // Get unique categories from profiles
            const whereClause: any = {
                isArchived: false,
                category: { not: null },
            };

            if (scope.isAdmin) {
                whereClause.client = { userId: scope.userId };
            } else if (scope.clientId) {
                whereClause.clientId = scope.clientId;
            } else {
                // Client without clientId - return empty
                return NextResponse.json([]);
            }

            const profiles = await prisma.gmbProfile.findMany({
                where: whereClause,
                select: { category: true },
                distinct: ["category"],
                orderBy: { category: "asc" },
            });

            const categories = profiles
                .map((p) => p.category)
                .filter((c): c is string => c !== null);

            return NextResponse.json(categories);
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        return NextResponse.json(
            { error: "Failed to fetch filter options" },
            { status: 500 }
        );
    }
}
