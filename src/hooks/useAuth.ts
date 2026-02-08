"use client";

import { useSession } from "next-auth/react";

type Role = "ADMIN" | "CLIENT" | "WORKER";

/**
 * Enhanced auth hook with role and scope awareness
 * Provides easy access to user session, role, and permission checking
 * 
 * ADMIN = Service provider (you) - full access
 * WORKER = Employee - can manage reviews/profiles based on permissions
 * CLIENT = Customer - sees only their data
 */
export function useAuth() {
    const { data: session, status } = useSession();

    const role = session?.user?.role as Role | undefined;
    const clientId = session?.user?.clientId;
    const canDeletePermission = session?.user?.canDelete ?? false;

    // Worker-specific permissions from session
    const canCreateReviews = session?.user?.canCreateReviews ?? false;
    const canEditReviews = session?.user?.canEditReviews ?? false;
    const canDeleteReviews = session?.user?.canDeleteReviews ?? false;
    const canManageProfiles = session?.user?.canManageProfiles ?? false;

    const isAdmin = role === "ADMIN";
    const isWorker = role === "WORKER";
    const isClient = role === "CLIENT";

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
        isAdmin,
        isWorker,
        isClient,
        clientId,

        // Permissions
        canDelete: isAdmin || canDeletePermission,

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
            manageUsers: isAdmin,
            accessAdminPanel: isAdmin,
            manageClients: isAdmin,

            // Profile permissions
            viewProfiles: isAdmin || isClient || isWorker,
            addProfiles: isAdmin || canManageProfiles,
            editProfiles: isAdmin || canManageProfiles,
            deleteProfiles: isAdmin || canDeletePermission,

            // Review permissions
            viewReviews: isAdmin || isClient || isWorker,
            createReviews: isAdmin || canCreateReviews,
            editReviews: isAdmin || canEditReviews,
            deleteReviews: isAdmin || canDeleteReviews,
        },
    };
}
