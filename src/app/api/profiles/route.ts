import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

// GET /api/profiles - List profiles (scoped by role)
// ADMIN: sees all profiles
// CLIENT: sees only their linked client's profiles
export async function GET(request: NextRequest) {
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const clientId = searchParams.get("clientId");
    const includeArchived = searchParams.get("includeArchived") === "true";
    const archivedOnly = searchParams.get("archivedOnly") === "true";
    const fullData = searchParams.get("fullData") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build where clause with scope filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
        // ADMIN sees all, CLIENT sees only their client's data
        ...(scope.isAdmin
            ? {} // Admin sees all
            : { clientId: scope.clientId } // Client sees only their data
        ),
    };

    // Archive filter
    if (archivedOnly) {
        where.isArchived = true;
    } else if (!includeArchived) {
        where.isArchived = false;
    }

    // Search filter
    if (search) {
        where.businessName = { contains: search, mode: "insensitive" };
    }

    // Category filter
    if (category && category !== "all") {
        where.category = category;
    }

    // Client filter (only admin can filter by clientId)
    if (clientId && clientId !== "all" && scope.isAdmin) {
        where.clientId = clientId;
    }

    // Full data for admin page (with pagination)
    if (fullData) {
        const [profiles, total] = await Promise.all([
            prisma.gmbProfile.findMany({
                where,
                include: {
                    client: { select: { id: true, name: true } },
                    _count: { select: { reviews: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.gmbProfile.count({ where }),
        ]);

        return NextResponse.json({
            profiles: profiles.map((p) => ({
                ...p,
                reviewCount: p._count.reviews,
                _count: undefined,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }

    // Simple list for dropdowns
    const profiles = await prisma.gmbProfile.findMany({
        where,
        select: {
            id: true,
            businessName: true,
            category: true,
            client: { select: { name: true } },
        },
        orderBy: { businessName: "asc" },
        take: limit,
    });

    return NextResponse.json(profiles);
}

// POST /api/profiles - Create new GMB Profile
// Both ADMIN and CLIENT can add profiles
export async function POST(request: NextRequest) {
    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { clientId, businessName, gmbLink, category } = body;

        if (!businessName) {
            return NextResponse.json(
                { error: "Business Name is required" },
                { status: 400 }
            );
        }

        // Determine which client to add profile to
        let targetClientId = clientId;

        if (!scope.isAdmin) {
            // CLIENT can only add to their own linked client
            if (!scope.clientId) {
                return NextResponse.json(
                    { error: "No client linked to your account" },
                    { status: 400 }
                );
            }
            targetClientId = scope.clientId;
        } else {
            // ADMIN must specify clientId
            if (!clientId) {
                return NextResponse.json(
                    { error: "Client ID is required" },
                    { status: 400 }
                );
            }
        }

        // Verify client exists
        const client = await prisma.client.findFirst({
            where: { id: targetClientId },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        const profile = await prisma.gmbProfile.create({
            data: {
                clientId: targetClientId,
                businessName: businessName.trim(),
                gmbLink: gmbLink?.trim() || null,
                category: category?.trim() || null,
            },
        });

        // Create notification
        await createNotification({
            userId: scope.userId,
            title: "New Profile Created",
            message: `Profile "${businessName}" has been added`,
            type: "success",
            link: `/profiles/${profile.id}`,
        });

        return NextResponse.json(profile, { status: 201 });
    } catch (error) {
        console.error("Error creating profile:", error);
        return NextResponse.json(
            { error: "Failed to create profile" },
            { status: 500 }
        );
    }
}
