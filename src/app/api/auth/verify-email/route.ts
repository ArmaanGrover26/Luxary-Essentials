import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import {
    successResponse,
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { verifyOtp } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
    // Rate limit: 10 attempts per 15 minutes per IP (prevents OTP brute-force)
    const limited = rateLimit(getClientIp(req), "verify-email", { limit: 10, windowMs: 15 * 60_000 });
    if (limited) return limited;

    try {
        await connectDB();

        const body = await req.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return errorResponse("Email and OTP are required", 400);
        }

        const user = await User.findOne({ email })
            .select("+emailOtp +emailOtpExpiresAt");

        if (!user) return errorResponse("No account found with this email", 404);

        if (user.emailVerified) {
            return errorResponse("This email is already verified. Please log in.", 400);
        }

        if (!user.emailOtp || !user.emailOtpExpiresAt) {
            return errorResponse("No OTP found. Please register again.", 400);
        }

        if (user.emailOtpExpiresAt < new Date()) {
            return errorResponse("OTP has expired. Please request a new one.", 400);
        }

        const isValid = await verifyOtp(String(otp), user.emailOtp);
        if (!isValid) {
            return errorResponse("Invalid verification code. Please try again.", 400);
        }

        // Mark email as verified and clear OTP fields
        user.emailVerified = true;
        user.emailOtp = undefined;
        user.emailOtpExpiresAt = undefined;
        await user.save();

        // Now issue JWT — user is fully verified
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return successResponse(
            {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            200
        );
    } catch (err) {
        console.error("[POST /api/auth/verify-email]", err);
        return serverErrorResponse();
    }
}

