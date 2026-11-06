import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { verifyOtp } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";
import { verifyPendingRegistrationToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
    // Rate limit: 10 attempts per 15 minutes per IP (prevents OTP brute-force)
    const limited = rateLimit(getClientIp(req), "verify-email", { limit: 10, windowMs: 15 * 60_000 });
    if (limited) return limited;

    try {
        await connectDB();

        const body = await req.json();
        const { email, otp, pendingToken: bodyToken } = body;

        const cleanOtp = otp ? String(otp).trim() : "";
        if (!cleanOtp) {
            return errorResponse("Verification code is required.", 400);
        }

        const cookieToken = req.cookies.get("pending_verification")?.value;
        const token = bodyToken || cookieToken;

        // Path 1: Stateless pending registration (User is NOT yet in database)
        if (token) {
            let pending;
            try {
                pending = verifyPendingRegistrationToken(token);
            } catch {
                return errorResponse(
                    "Verification session has expired. Please sign up again.",
                    400
                );
            }

            if (email && pending.email !== String(email).trim().toLowerCase()) {
                return errorResponse("Email does not match verification session.", 400);
            }

            const isValid = await verifyOtp(cleanOtp, pending.otpHash);
            if (!isValid) {
                return errorResponse("Invalid verification code. Please try again.", 400);
            }

            // Check if user was already created in the meantime
            const existing = await User.findOne({ email: pending.email });
            if (existing && existing.emailVerified) {
                return errorResponse("This email is already registered. Please log in.", 409);
            }
            if (existing && !existing.emailVerified) {
                await User.deleteOne({ _id: existing._id });
            }

            // CREATE USER IN DATABASE ONLY NOW, AFTER SUCCESSFUL VERIFICATION!
            await User.create({
                name: pending.name,
                email: pending.email,
                password: pending.passwordHash,
                emailVerified: true,
            });

            // Clear the pending verification cookie
            const response = NextResponse.json(
                {
                    success: true,
                    message: "Account verified and created successfully.",
                },
                { status: 200 }
            );

            response.cookies.set("pending_verification", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 0,
                path: "/",
            });

            return response;
        }

        // Path 2: Fallback for any legacy user in database
        if (email) {
            const user = await User.findOne({ email: String(email).trim().toLowerCase() })
                .select("+emailOtp +emailOtpExpiresAt");

            if (user) {
                if (user.emailVerified) {
                    return errorResponse("This email is already verified. Please log in.", 400);
                }
                if (!user.emailOtp || !user.emailOtpExpiresAt) {
                    return errorResponse("No active verification code found. Please sign up again.", 400);
                }
                if (new Date(user.emailOtpExpiresAt) < new Date()) {
                    return errorResponse("Verification code has expired. Please request a new one.", 400);
                }

                const isValid = await verifyOtp(cleanOtp, user.emailOtp);
                if (!isValid) {
                    return errorResponse("Invalid verification code. Please try again.", 400);
                }

                user.emailVerified = true;
                user.emailOtp = undefined;
                user.emailOtpExpiresAt = undefined;
                await user.save();

                return NextResponse.json(
                    {
                        success: true,
                        message: "Account verified successfully.",
                    },
                    { status: 200 }
                );
            }
        }

        return errorResponse("Verification session expired. Please sign up again.", 400);
    } catch (err) {
        console.error("[POST /api/auth/verify-email]", err);
        return serverErrorResponse();
    }
}
