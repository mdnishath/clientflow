import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export type Role = "ADMIN" | "WORKER" | "CLIENT";

/**
 * Permission definitions - Multi-tenant RBAC system
 * ADMIN = Service provider (you) - sees all data
 * WORKER = Works under an admin - sees admin's data (limited by permissions)
 * CLIENT = Customer accounts - sees only their own data
 */
export const PERMISSIONS: Record<string, readonly Role[]> = {
    // Profile permissions
    "profile:create": ["CLIENT", "ADMIN", "WORKER"], // Clients can add profiles
    "profile:read": ["CLIENT", "ADMIN", "WORKER"],
    "profile:update": ["ADMIN", "WORKER"], // Only admin/worker can edit
    "profile:delete": ["ADMIN"], // Only admin can delete (unless canDelete granted)

    // Review permissions (view-only for clients by default)
    "review:read": ["CLIENT", "ADMIN", "WORKER"],
    "review:create": ["ADMIN", "WORKER"],
    "review:update": ["ADMIN", "WORKER"],
    "review:delete": ["ADMIN"],

    // Client management (admin only)
    "client:create": ["ADMIN"],
    "client:read": ["ADMIN"],
    "client:update": ["ADMIN"],
    "client:delete": ["ADMIN"],

    // Admin area access
    "admin:access": ["ADMIN"],
    "admin:templates": ["ADMIN", "WORKER"],
    "admin:contexts": ["ADMIN", "WORKER"],
    "admin:categories": ["ADMIN"],
    "admin:profiles": ["ADMIN", "WORKER"],
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
    isWorker: boolean;
    clientId: string | null;
    userId: string; // Effective userId for data scoping (parentAdminId for workers)
    actualUserId: string; // The actual logged-in user's ID
    canDelete: boolean;
    canCreateProfiles: boolean;
    canEditProfiles: boolean;
    canDeleteProfiles: boolean;
    canCreateReviews: boolean;
    canEditReviews: boolean;
    canDeleteReviews: boolean;
}

/**
 * Get client scope for data filtering
 * Admin sees all their data, Worker sees their parent admin's data, Client sees only their linked client's data
 */
export async function getClientScope(): Promise<ClientScope | null> {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    // Always fetch fresh data from DB to ensure permissions are up to date
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            role: true,
            clientId: true,
            canDelete: true,
            parentAdminId: true,
            canDeleteReviews: true,
            // Worker specific
            canCreateReviews: true,
            canEditReviews: true,
            canManageProfiles: true,
            // Client specific (fetched via relation)
            linkedClient: {
                select: {
                    canCreateProfiles: true,
                    canEditProfiles: true,
                    canDeleteProfiles: true,
                    canCreateReviews: true,
                    canEditReviews: true,
                    canDeleteReviews: true,
                }
            }
        },
    });

    if (!user) return null;

    if (user.role === "ADMIN") {
        return {
            isAdmin: true,
            isWorker: false,
            clientId: null, // Admin sees all their clients
            userId: user.id,
            actualUserId: user.id,
            canDelete: true,
            canCreateProfiles: true,
            canEditProfiles: true,
            canDeleteProfiles: true,
            canCreateReviews: true,
            canEditReviews: true,
            canDeleteReviews: true,
        };
    }

    if (user.role === "WORKER") {
        // Workers see their parent admin's data
        if (!user.parentAdminId) {
            return null; // Worker without parent admin is invalid
        }
        return {
            isAdmin: true, // Treat as admin for data visibility
            isWorker: true,
            clientId: null,
            userId: user.parentAdminId, // Use parent admin's ID for data scoping
            actualUserId: user.id,
            canDelete: user.canDeleteReviews ?? false,
            canCreateProfiles: user.canManageProfiles ?? false,
            canEditProfiles: user.canManageProfiles ?? false,
            canDeleteProfiles: false, // Workers generally don't delete profiles
            canCreateReviews: user.canCreateReviews ?? true,
            canEditReviews: user.canEditReviews ?? true,
            canDeleteReviews: user.canDeleteReviews ?? false,
        };
    }

    // CLIENT role - must have a linked clientId
    return {
        isAdmin: false,
        isWorker: false,
        clientId: user.clientId, // Client can only see their own data
        userId: user.id,
        actualUserId: user.id,
        canDelete: user.linkedClient?.canDeleteProfiles ?? false,
        canCreateProfiles: user.linkedClient?.canCreateProfiles ?? false,
        canEditProfiles: user.linkedClient?.canEditProfiles ?? false,
        canDeleteProfiles: user.linkedClient?.canDeleteProfiles ?? false,
        canCreateReviews: user.linkedClient?.canCreateReviews ?? false,
        canEditReviews: user.linkedClient?.canEditReviews ?? false,
        canDeleteReviews: user.linkedClient?.canDeleteReviews ?? false,
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
