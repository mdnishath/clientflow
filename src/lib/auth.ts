import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user) {
                    return null;
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    clientId: user.clientId,
                    parentAdminId: user.parentAdminId,
                    canDelete: user.canDelete,
                    // Worker permissions
                    canCreateReviews: user.canCreateReviews,
                    canEditReviews: user.canEditReviews,
                    canDeleteReviews: user.canDeleteReviews,
                    canManageProfiles: user.canManageProfiles,
                };
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async session({ session, token }) {
            if (session.user && token.id) {
                // Fetch fresh user data from DB to ensure permissions are up to date
                // This fixes the issue where permission changes didn't reflect until re-login
                const user = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: {
                        id: true,
                        role: true,
                        clientId: true,
                        parentAdminId: true,
                        canDelete: true,
                        canCreateReviews: true,
                        canEditReviews: true,
                        canDeleteReviews: true,
                        canManageProfiles: true,
                    }
                });

                if (user) {
                    session.user.id = user.id;
                    session.user.role = user.role as "ADMIN" | "WORKER" | "CLIENT";
                    session.user.clientId = user.clientId;
                    session.user.parentAdminId = user.parentAdminId;
                    session.user.canDelete = user.canDelete;
                    // Worker permissions (fresh from DB)
                    session.user.canCreateReviews = user.canCreateReviews ?? (user.role === "ADMIN");
                    session.user.canEditReviews = user.canEditReviews ?? (user.role === "ADMIN");
                    session.user.canDeleteReviews = user.canDeleteReviews ?? (user.role === "ADMIN");
                    session.user.canManageProfiles = user.canManageProfiles ?? (user.role === "ADMIN");
                } else {
                    // Fallback to token if DB fetch fails (unlikely)
                    session.user.id = token.id as string;
                    session.user.role = token.role as "ADMIN" | "WORKER" | "CLIENT";
                    session.user.clientId = token.clientId as string | null;
                    session.user.parentAdminId = token.parentAdminId as string | null;
                    session.user.canDelete = token.canDelete as boolean;
                    session.user.canCreateReviews = token.canCreateReviews as boolean;
                    session.user.canEditReviews = token.canEditReviews as boolean;
                    session.user.canDeleteReviews = token.canDeleteReviews as boolean;
                    session.user.canManageProfiles = token.canManageProfiles as boolean;
                }
            }
            return session;
        },
    },
});
