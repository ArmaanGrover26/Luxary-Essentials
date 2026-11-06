import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { registerSchema } from "@/utils/validators";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/otpEmailService";
import { signPendingRegistrationToken } from "@/lib/jwt";

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
        const normalizedEmail = email.trim().toLowerCase();

        // Check if email already exists
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            if (existing.emailVerified) {
                return errorResponse("Email already registered", 409);
            }
            // Remove any legacy unverified document so new clean registration takes over
            await User.deleteOne({ _id: existing._id });
        }

        // Hash password and generate OTP
        const passwordHash = await bcrypt.hash(password, 12);
        const { otp, hash: otpHash } = await generateOtp();

        // Send OTP via Gmail SMTP (dedicated OTP account)
        await sendOtpEmail(normalizedEmail, name.trim(), otp);

        // Sign a 10-minute stateless token containing the pending registration data
        // NOTE: Nothing is saved in the User database yet!
        // The account will ONLY be created once the user successfully verifies the OTP.
        const pendingToken = signPendingRegistrationToken({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            otpHash,
        });

        const response = NextResponse.json(
            {
                success: true,
                data: {
                    requiresVerification: true,
                    email: normalizedEmail,
                    pendingToken,
                },
            },
            { status: 200 }
        );

        response.cookies.set("pending_verification", pendingToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 10 * 60, // 10 minutes
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("[POST /api/auth/register]", err);
        return serverErrorResponse();
    }
}
