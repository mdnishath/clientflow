import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "CLIENT";
            clientId: string | null; // For CLIENT: their linked client entity ID
            canDelete: boolean; // Admin-granted delete permission
        } & DefaultSession["user"];
    }

    interface User {
        role: "ADMIN" | "CLIENT";
        clientId: string | null;
        canDelete: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "CLIENT";
        clientId: string | null;
        canDelete: boolean;
    }
}
