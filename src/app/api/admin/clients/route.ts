import { prisma } from "@/lib/prisma";
import { requireAdmin, getClientScope } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET /api/admin/clients - List clients for logged-in admin
export async function GET(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const clients = await prisma.client.findMany({
            where: {
                userId: scope.userId, // RBAC: Only this admin's clients
            },
            include: {
                userAccount: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        canDelete: true,
                    },
                },
                gmbProfiles: {
                    select: { id: true },
                },
            },
            orderBy: { name: "asc" },
        });

        // Transform to include profile count
        const clientsWithCount = clients.map((client) => ({
            ...client,
            profileCount: client.gmbProfiles.length,
        }));

        return NextResponse.json(clientsWithCount);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}

// POST /api/admin/clients - Create new client account
export async function POST(request: NextRequest) {
    const error = await requireAdmin();
    if (error) return error;

    const scope = await getClientScope();
    if (!scope) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            name, email, password, phone, notes,
            canCreateProfiles, canEditProfiles, canDeleteProfiles,
            canCreateReviews, canEditReviews, canDeleteReviews
        } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already in use" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user and client in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create client record first
            const client = await tx.client.create({
                data: {
                    userId: scope.userId, // RBAC: Link to admin
                    name,
                    email,
                    phone: phone || null,
                    notes: notes || null,
                    // Permissions (default false, but allow override if sent)
                    canCreateProfiles: canCreateProfiles || false,
                    canEditProfiles: canEditProfiles || false,
                    canDeleteProfiles: canDeleteProfiles || false,
                    canCreateReviews: canCreateReviews || false,
                    canEditReviews: canEditReviews || false,
                    canDeleteReviews: canDeleteReviews || false,
                },
            });

            // Create user account for client
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    role: "CLIENT",
                    clientId: client.id, // Link user to client
                },
            });

            return { client, user };
        });

        return NextResponse.json(
            {
                ...result.client,
                userAccount: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    canDelete: result.user.canDelete,
                },
                profileCount: 0,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        );
    }
}
