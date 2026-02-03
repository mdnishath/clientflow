"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";
import { ShieldX } from "lucide-react";

type Role = "ADMIN" | "CLIENT";

interface RoleGuardProps {
    /** Roles that are allowed to see the children */
    allowedRoles: Role[];
    /** Content to show when user has permission */
    children: ReactNode;
    /** Content to show when user doesn't have permission (optional) */
    fallback?: ReactNode;
    /** Show access denied message instead of nothing (optional) */
    showAccessDenied?: boolean;
}

/**
 * Role-based UI guard component
 * Renders children only if user has one of the allowed roles
 * 
 * @example
 * <RoleGuard allowedRoles={["ADMIN"]}>
 *   <AdminOnlyButton />
 * </RoleGuard>
 */
export function RoleGuard({
    allowedRoles,
    children,
    fallback = null,
    showAccessDenied = false,
}: RoleGuardProps) {
    const { data: session, status } = useSession();

    // Show nothing while loading
    if (status === "loading") {
        return null;
    }

    const userRole = session?.user?.role as Role | undefined;

    // User doesn't have required role
    if (!userRole || !allowedRoles.includes(userRole)) {
        if (showAccessDenied) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <ShieldX className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-slate-400">
                        You don&apos;t have permission to view this content.
                    </p>
                </div>
            );
        }
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Convenience component for admin-only content
 * 
 * @example
 * <AdminOnly>
 *   <DeleteUserButton />
 * </AdminOnly>
 */
export function AdminOnly({
    children,
    fallback,
    showAccessDenied,
}: {
    children: ReactNode;
    fallback?: ReactNode;
    showAccessDenied?: boolean;
}) {
    return (
        <RoleGuard
            allowedRoles={["ADMIN"]}
            fallback={fallback}
            showAccessDenied={showAccessDenied}
        >
            {children}
        </RoleGuard>
    );
}

/**
 * Convenience component for client-only content (excludes admin)
 */
export function ClientOnly({
    children,
    fallback,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <RoleGuard allowedRoles={["CLIENT"]} fallback={fallback}>
            {children}
        </RoleGuard>
    );
}
