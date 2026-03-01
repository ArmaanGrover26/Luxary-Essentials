import { NextRequest } from "next/server";
import { verifyToken, TokenPayload } from "./jwt";

/**
 * Extracts and verifies JWT from Authorization header or token cookie.
 * Returns the decoded payload or throws an error with a message.
 */
export async function getAuthUser(req: NextRequest): Promise<TokenPayload> {
    // 1. Try Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization");
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
    }

    // 2. Fall back to cookie
    if (!token) {
        token = req.cookies.get("token")?.value ?? null;
    }

    if (!token) {
        throw new Error("Authentication required. No token provided.");
    }

    try {
        return verifyToken(token);
    } catch {
        throw new Error("Invalid or expired token.");
    }
}

/**
 * Verifies the user is authenticated AND is an admin.
 */
export async function requireAdmin(req: NextRequest): Promise<TokenPayload> {
    const user = await getAuthUser(req);
    if (user.role !== "admin") {
        throw new Error("Access denied. Admins only.");
    }
    return user;
}
