import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/checkout"];
// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

    if (!isProtected && !isAdmin) return NextResponse.next();

    const token = req.cookies.get("token")?.value;

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        const payload = verifyToken(token);

        // Admin-only route check
        if (isAdmin && payload.role !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Pass user info as headers for Server Components
        const headers = new Headers(req.headers);
        headers.set("x-user-id", payload.userId);
        headers.set("x-user-role", payload.role);
        headers.set("x-user-email", payload.email);

        return NextResponse.next({ request: { headers } });
    } catch {
        // Token invalid/expired
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
        "/checkout/:path*",
        "/admin/:path*",
    ],
};
