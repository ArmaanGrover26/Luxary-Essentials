import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import User from "@/models/User";
import {
    successResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";

// GET /api/auth/me — return current user profile
export async function GET(req: NextRequest) {
    try {
        const payload = await getAuthUser(req);
        await connectDB();

        const user = await User.findById(payload.userId).select(
            "-password -__v"
        );
        if (!user) return unauthorizedResponse("User not found");

        return successResponse({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("token")) {
            return unauthorizedResponse(err.message);
        }
        console.error("[GET /api/auth/me]", err);
        return serverErrorResponse();
    }
}

// POST /api/auth/logout — clear token cookie
export async function POST() {
    const response = NextResponse.json(
        { success: true, data: { message: "Logged out successfully" } },
        { status: 200 }
    );
    response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    });
    return response;
}
