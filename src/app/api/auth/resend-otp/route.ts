import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
    successResponse,
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/otpEmailService";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
    // Rate limit: 3 resend requests per 10 minutes per IP (prevents Gmail quota abuse)
    const limited = rateLimit(getClientIp(req), "resend-otp", { limit: 3, windowMs: 10 * 60_000 });
    if (limited) return limited;

    try {
        await connectDB();

        const { email } = await req.json();
        if (!email) return errorResponse("Email is required", 400);

        const user = await User.findOne({ email });
        if (!user) return errorResponse("No account found with this email", 404);

        if (user.emailVerified) {
            return errorResponse("This email is already verified.", 400);
        }

        // Generate fresh OTP
        const { otp, hash } = await generateOtp();
        user.emailOtp = hash;
        user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60_000); // 10 minutes
        await user.save();

        await sendOtpEmail(email, user.name, otp);

        return successResponse({ message: "A new verification code has been sent to your email." }, 200);
    } catch (err) {
        console.error("[POST /api/auth/resend-otp]", err);
        return serverErrorResponse();
    }
}

