import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/otpEmailService";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";
import { verifyPendingRegistrationToken, signPendingRegistrationToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    // Rate limit: 3 resend requests per 10 minutes per IP (prevents Gmail quota abuse)
    const limited = rateLimit(getClientIp(req), "resend-otp", { limit: 3, windowMs: 10 * 60_000 });
    if (limited) return limited;

    try {
        await connectDB();

        const body = await req.json().catch(() => ({}));
        const email = body?.email ? String(body.email).trim().toLowerCase() : "";
        const bodyToken = body?.pendingToken;
        const cookieToken = req.cookies.get("pending_verification")?.value;
        const token = bodyToken || cookieToken;

        // Path 1: Resend OTP for pending stateless registration
        if (token) {
            let pending;
            try {
                pending = verifyPendingRegistrationToken(token);
            } catch {
                return errorResponse("Verification session has expired. Please sign up again.", 400);
            }

            // Generate fresh OTP
            const { otp, hash: otpHash } = await generateOtp();

            // Send fresh OTP email
            await sendOtpEmail(pending.email, pending.name, otp);

            // Re-sign fresh 10-minute token with new OTP hash
            const newPendingToken = signPendingRegistrationToken({
                name: pending.name,
                email: pending.email,
                passwordHash: pending.passwordHash,
                otpHash,
            });

            const response = NextResponse.json(
                {
                    success: true,
                    data: {
                        message: "A new verification code has been sent to your email.",
                        pendingToken: newPendingToken,
                    },
                },
                { status: 200 }
            );

            response.cookies.set("pending_verification", newPendingToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 10 * 60,
                path: "/",
            });

            return response;
        }

        // Path 2: Legacy fallback if account was in database
        if (email) {
            const user = await User.findOne({ email });
            if (user && !user.emailVerified) {
                const { otp, hash } = await generateOtp();
                user.emailOtp = hash;
                user.emailOtpExpiresAt = new Date(Date.now() + 10 * 60_000);
                await user.save();

                await sendOtpEmail(email, user.name, otp);

                return NextResponse.json(
                    {
                        success: true,
                        data: {
                            message: "A new verification code has been sent to your email.",
                        },
                    },
                    { status: 200 }
                );
            }
        }

        return errorResponse("No active registration found. Please sign up again.", 404);
    } catch (err) {
        console.error("[POST /api/auth/resend-otp]", err);
        return serverErrorResponse();
    }
}
