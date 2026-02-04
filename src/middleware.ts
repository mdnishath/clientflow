import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Routes that require ADMIN role
const ADMIN_ROUTES = ["/admin"];



export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;
    const pathname = req.nextUrl.pathname;

    const isAuthPage = pathname.startsWith("/login");
    const isApiAuth = pathname.startsWith("/api/auth");
    const isPublicApi = pathname === "/api/health";
    const isUnauthorizedPage = pathname === "/unauthorized";
    const isAdminRoute = ADMIN_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    // Allow auth-related API requests
    if (isApiAuth || isPublicApi) {
        return NextResponse.next();
    }

    // Allow unauthorized page access
    if (isUnauthorizedPage) {
        return NextResponse.next();
    }

    // Redirect logged-in users away from login page
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Redirect non-logged-in users to login
    if (!isAuthPage && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Protect admin routes - only ADMIN role can access
    if (isAdminRoute && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
