import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "WORKER" | "CLIENT";
            clientId: string | null; // For CLIENT: their linked client entity ID
            parentAdminId?: string | null; // For WORKER: the admin they work for
            canDelete: boolean; // Admin-granted delete permission
            // Worker permissions
            canCreateReviews: boolean;
            canEditReviews: boolean;
            canDeleteReviews: boolean;
            canManageProfiles: boolean;
        } & DefaultSession["user"];
    }

    interface User {
        role: "ADMIN" | "WORKER" | "CLIENT";
        clientId: string | null;
        parentAdminId?: string | null;
        canDelete: boolean;
        // Worker permissions
        canCreateReviews: boolean;
        canEditReviews: boolean;
        canDeleteReviews: boolean;
        canManageProfiles: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "WORKER" | "CLIENT";
        clientId: string | null;
        parentAdminId?: string | null;
        canDelete: boolean;
        // Worker permissions
        canCreateReviews: boolean;
        canEditReviews: boolean;
        canDeleteReviews: boolean;
        canManageProfiles: boolean;
    }
}
