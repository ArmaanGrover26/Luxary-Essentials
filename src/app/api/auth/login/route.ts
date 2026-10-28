import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import User from "@/models/User";
import {
    successResponse,
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { loginSchema } from "@/utils/validators";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
    // Rate limit: 5 login attempts per 15 minutes per IP
    const limited = rateLimit(getClientIp(req), "login", { limit: 5, windowMs: 15 * 60_000 });
    if (limited) return limited;

    try {
        await connectDB();

        const body = await req.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const { email, password } = parsed.data;

        // Select password explicitly since it has select: false
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return errorResponse("Invalid email or password", 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse("Invalid email or password", 401);
        }

        // Block login for unverified accounts
        if (!user.emailVerified) {
            return errorResponse(
                "Please verify your email before logging in. Check your inbox for the verification code.",
                403
            );
        }

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set HttpOnly cookie + return token in body
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                },
            },
            { status: 200 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("[POST /api/auth/login]", err);
        return serverErrorResponse();
    }
}
