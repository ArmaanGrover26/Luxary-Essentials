import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/profile"];

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "luxury_essentials_secret_key_2026_super_secure_token"
);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow access to admin login page without authentication check
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAdminRoute = pathname.startsWith("/admin");

    if (!isProtected && !isAdminRoute) return NextResponse.next();

    const token = req.cookies.get("token")?.value;

    if (!token) {
        if (isAdminRoute) {
            const adminLoginUrl = new URL("/admin/login", req.url);
            adminLoginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(adminLoginUrl);
        }
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // jose's jwtVerify works in Edge Runtime (no Node.js crypto required)
        const { payload } = await jwtVerify(token, JWT_SECRET);

        const role = payload.role as string;
        const userId = payload.userId as string;
        const email = payload.email as string;

        // Admin-only route check
        if (isAdminRoute && role !== "admin") {
            const adminLoginUrl = new URL("/admin/login", req.url);
            adminLoginUrl.searchParams.set("error", "access_denied");
            const response = NextResponse.redirect(adminLoginUrl);
            response.cookies.delete("token");
            return response;
        }

        // Pass user info as headers for Server Components
        const headers = new Headers(req.headers);
        headers.set("x-user-id", userId || "");
        headers.set("x-user-role", role || "");
        headers.set("x-user-email", email || "");

        return NextResponse.next({ request: { headers } });
    } catch {
        // Token invalid or expired — clear it and redirect
        if (isAdminRoute) {
            const adminLoginUrl = new URL("/admin/login", req.url);
            adminLoginUrl.searchParams.set("from", pathname);
            const response = NextResponse.redirect(adminLoginUrl);
            response.cookies.delete("token");
            return response;
        }

        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/profile/:path*",
        "/admin/:path*",
    ],
};
