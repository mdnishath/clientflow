import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export type Role = "ADMIN" | "CLIENT";

/**
 * Permission definitions - Multi-tenant RBAC system
 * ADMIN = Service provider (you) - sees all data
 * CLIENT = Customer accounts - sees only their own data
 */
export const PERMISSIONS: Record<string, readonly Role[]> = {
    // Profile permissions
    "profile:create": ["CLIENT", "ADMIN"], // Clients can add profiles
    "profile:read": ["CLIENT", "ADMIN"],
    "profile:update": ["ADMIN"], // Only admin can edit
    "profile:delete": ["ADMIN"], // Only admin can delete (unless canDelete granted)

    // Review permissions (view-only for clients by default)
    "review:read": ["CLIENT", "ADMIN"],
    "review:create": ["ADMIN"],
    "review:update": ["ADMIN"],
    "review:delete": ["ADMIN"],

    // Client management (admin only)
    "client:create": ["ADMIN"],
    "client:read": ["ADMIN"],
    "client:update": ["ADMIN"],
    "client:delete": ["ADMIN"],

    // Admin area access
    "admin:access": ["ADMIN"],
    "admin:templates": ["ADMIN"],
    "admin:contexts": ["ADMIN"],
    "admin:categories": ["ADMIN"],
    "admin:profiles": ["ADMIN"],
};

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    const allowedRoles = PERMISSIONS[permission as string];
    return allowedRoles?.includes(role) ?? false;
}

/**
 * Check if user role is in the allowed roles list
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
    return allowedRoles.includes(userRole);
}

/**
 * Client scope result - used for data isolation
 */
export interface ClientScope {
    isAdmin: boolean;
    clientId: string | null;
    userId: string;
    canDelete: boolean;
}

/**
 * Get client scope for data filtering
 * Admin sees all data, Client sees only their linked client's data
 */
export async function getClientScope(): Promise<ClientScope | null> {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    // Always fetch fresh data from DB to ensure permissions (canDelete) are up to date
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, clientId: true, canDelete: true },
    });

    if (!user) return null;

    if (user.role === "ADMIN") {
        return {
            isAdmin: true,
            clientId: null, // Admin sees all
            userId: user.id,
            canDelete: true,
        };
    }

    // CLIENT role - must have a linked clientId
    return {
        isAdmin: false,
        clientId: user.clientId, // Client can only see their own data
        userId: user.id,
        canDelete: user.canDelete ?? false, // Admin-granted delete permission
    };
}

/**
 * API route guard - Returns error response if unauthorized, null if access granted
 */
export async function requireRole(allowedRoles: Role[]) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized - Please log in" },
            { status: 401 }
        );
    }

    const userRole = session.user.role as Role;

    if (!hasRole(userRole, allowedRoles)) {
        return NextResponse.json(
            { error: "Forbidden - Insufficient permissions" },
            { status: 403 }
        );
    }

    return null; // Access granted
}

/**
 * Convenience function for admin-only API routes
 */
export async function requireAdmin() {
    return requireRole(["ADMIN"]);
}

/**
 * Check if user can delete based on role and canDelete permission
 */
export async function canDelete(): Promise<boolean> {
    const scope = await getClientScope();
    if (!scope) return false;

    return scope.isAdmin || scope.canDelete;
}

/**
 * Full auth check with scope - use in API routes
 */
export async function checkAuth() {
    const session = await auth();

    if (!session?.user?.id) {
        return {
            authorized: false,
            error: NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            ),
            session: null,
            scope: null,
        };
    }

    const scope = await getClientScope();

    return {
        authorized: true,
        error: null,
        session,
        scope,
        role: session.user.role as Role,
        userId: session.user.id,
    };
}
