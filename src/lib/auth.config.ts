import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    providers: [],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.clientId = user.clientId;
                token.parentAdminId = (user as any).parentAdminId;
                token.canDelete = user.canDelete;
                // Worker permissions
                token.canCreateReviews = user.canCreateReviews;
                token.canEditReviews = user.canEditReviews;
                token.canDeleteReviews = user.canDeleteReviews;
                token.canManageProfiles = user.canManageProfiles;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "WORKER" | "CLIENT";
                session.user.clientId = token.clientId as string | null;
                session.user.parentAdminId = token.parentAdminId as string | null;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
