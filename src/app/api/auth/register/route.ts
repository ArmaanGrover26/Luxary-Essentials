import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
    successResponse,
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { registerSchema } from "@/utils/validators";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/otpEmailService";

export async function POST(req: NextRequest) {
    // Rate limit: 10 signup attempts per hour per IP
    const limited = rateLimit(getClientIp(req), "register", { limit: 10, windowMs: 60 * 60_000 });
    if (limited) return limited;

    try {
        await connectDB();

        const body = await req.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const { name, email, password } = parsed.data;

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            // If the account exists but is unverified, allow re-sending OTP
            if (!existing.emailVerified) {
                const { otp, hash } = await generateOtp();
                await User.findByIdAndUpdate(existing._id, {
                    emailOtp: hash,
                    emailOtpExpiresAt: new Date(Date.now() + 10 * 60_000),
                });
                await sendOtpEmail(email, existing.name, otp);
                return successResponse(
                    { requiresVerification: true, email },
                    200
                );
            }
            return errorResponse("Email already registered", 409);
        }

        // Create user (password hashed by pre-save hook)
        const user = await User.create({ name, email, password, emailVerified: false });

        // Generate OTP and store hash
        const { otp, hash } = await generateOtp();
        user.emailOtp = hash;
        user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60_000); // 10 minutes
        await user.save();

        // Send OTP via Gmail SMTP (dedicated account, doesn't touch Brevo or Resend quota)
        await sendOtpEmail(email, name, otp);

        // Do NOT issue JWT yet — user must verify email first
        return successResponse({ requiresVerification: true, email }, 201);
    } catch (err) {
        console.error("[POST /api/auth/register]", err);
        return serverErrorResponse();
    }
}
