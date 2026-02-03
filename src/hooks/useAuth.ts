"use client";

import { useSession } from "next-auth/react";

type Role = "ADMIN" | "CLIENT";

/**
 * Enhanced auth hook with role and scope awareness
 * Provides easy access to user session, role, and permission checking
 * 
 * ADMIN = Service provider (you) - full access
 * CLIENT = Customer - sees only their data
 */
export function useAuth() {
    const { data: session, status } = useSession();

    const role = session?.user?.role as Role | undefined;
    const clientId = session?.user?.clientId;
    const canDeletePermission = session?.user?.canDelete ?? false;

    return {
        // Session state
        session,
        status,
        isLoading: status === "loading",
        isAuthenticated: status === "authenticated",

        // User info
        user: session?.user,
        userId: session?.user?.id,

        // Role info
        role,
        isAdmin: role === "ADMIN",
        isClient: role === "CLIENT",
        clientId,

        // Permissions
        canDelete: role === "ADMIN" || canDeletePermission,

        /**
         * Check if user has one of the allowed roles
         */
        hasRole: (allowedRoles: Role[]) =>
            role ? allowedRoles.includes(role) : false,

        /**
         * Permission helpers
         */
        can: {
            // Admin-only actions
            manageUsers: role === "ADMIN",
            accessAdminPanel: role === "ADMIN",
            editProfiles: role === "ADMIN",
            editReviews: role === "ADMIN",
            createReviews: role === "ADMIN",
            manageClients: role === "ADMIN",

            // Both roles (but clients see filtered data)
            viewReviews: role === "ADMIN" || role === "CLIENT",
            viewProfiles: role === "ADMIN" || role === "CLIENT",
            addProfiles: role === "ADMIN" || role === "CLIENT",

            // Conditional delete (admin or permission granted)
            deleteProfiles: role === "ADMIN" || canDeletePermission,
            deleteReviews: role === "ADMIN" || canDeletePermission,
        },
    };
}
