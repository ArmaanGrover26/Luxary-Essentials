import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_SECRET_SLUG } from "@/config/adminConfig";

const PROTECTED_ROUTES = ["/dashboard", "/profile"];

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set");
}

const JWT_SECRET = new TextEncoder().encode(rawSecret);


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secretPrefix = `/${ADMIN_SECRET_SLUG}`;

  // 1. Direct access to `/admin` or `/admin/*` without internal rewrite header → Show 404
  if (pathname.startsWith("/admin")) {
    const isInternalRewrite = req.headers.get("x-secret-admin-access") === "true";
    if (!isInternalRewrite) {
      return NextResponse.rewrite(new URL("/_not-found", req.url));
    }
    return NextResponse.next();
  }

  // 2. Secret URL handling (`/<ADMIN_SECRET_SLUG>`)
  const isSecretAdminRoute =
    pathname === secretPrefix || pathname.startsWith(`${secretPrefix}/`);

  if (isSecretAdminRoute) {
    // Determine the internal target path (e.g. `/secret-owner-portal/products` -> `/admin/products`)
    const subPath = pathname.slice(secretPrefix.length); // e.g. "" or "/login" or "/products"
    const internalAdminPath = `/admin${subPath || ""}`;
    const isLogin = subPath === "/login";

    const token = req.cookies.get("token")?.value;

    // Helper for internal rewrite with security header
    const createRewrite = (targetUrlString: string, reqHeaders?: Headers) => {
      const targetUrl = new URL(targetUrlString, req.url);
      const headers = new Headers(reqHeaders || req.headers);
      headers.set("x-secret-admin-access", "true");
      return NextResponse.rewrite(targetUrl, { request: { headers } });
    };

    // If no token present
    if (!token) {
      if (isLogin) {
        return createRewrite("/admin/login");
      }
      const loginRedirectUrl = new URL(`${secretPrefix}/login`, req.url);
      loginRedirectUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginRedirectUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;
      const userId = payload.userId as string;
      const email = payload.email as string;

      // If user is logged in as admin
      if (role === "admin") {
        if (isLogin) {
          // Already logged in as admin, redirect to secret admin home
          return NextResponse.redirect(new URL(secretPrefix, req.url));
        }
        const headers = new Headers(req.headers);
        headers.set("x-user-id", userId || "");
        headers.set("x-user-role", role || "");
        headers.set("x-user-email", email || "");
        headers.set("x-secret-admin-access", "true");

        return createRewrite(internalAdminPath, headers);
      }

      // If logged in user is NOT an admin
      const loginRedirectUrl = new URL(`${secretPrefix}/login`, req.url);
      loginRedirectUrl.searchParams.set("error", "access_denied");
      const response = NextResponse.redirect(loginRedirectUrl);
      response.cookies.delete("token");
      return response;
    } catch {
      // Invalid/expired token
      if (isLogin) {
        const response = createRewrite("/admin/login");
        response.cookies.delete("token");
        return response;
      }
      const loginRedirectUrl = new URL(`${secretPrefix}/login`, req.url);
      const response = NextResponse.redirect(loginRedirectUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  // 3. Normal user protected routes (/dashboard, /profile)
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const headers = new Headers(req.headers);
    headers.set("x-user-id", (payload.userId as string) || "");
    headers.set("x-user-role", (payload.role as string) || "");
    headers.set("x-user-email", (payload.email as string) || "");
    return NextResponse.next({ request: { headers } });
  } catch {
    const loginUrl = new URL("/login", req.url);
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
    "/:path*",
  ],
};
