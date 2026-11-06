import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/utils/apiResponse";
import { verifyOtp } from "@/lib/otp";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";

export async function POST(req: NextRequest) {
  // Rate limit: 10 attempts per 15 minutes per IP (prevents brute-forcing)
  const limited = rateLimit(getClientIp(req), "reset-password", {
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    await connectDB();

    const body = await req.json();
    const { email, otp, newPassword } = body;

    const normalizedEmail = email ? String(email).trim().toLowerCase() : "";
    const cleanOtp = otp ? String(otp).trim() : "";
    const passwordStr = newPassword ? String(newPassword) : "";

    if (!normalizedEmail || !cleanOtp || !passwordStr) {
      return errorResponse("Email, verification code, and new password are required.", 400);
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      return errorResponse("Verification code must be a 6-digit number.", 400);
    }

    if (passwordStr.length < 8) {
      return errorResponse("Password must be at least 8 characters long.", 400);
    }

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +resetPasswordOtp +resetPasswordExpiresAt +resetPasswordAttempts"
    );

    // Only allow customer accounts to be reset via this route
    if (!user || user.role !== "user") {
      return errorResponse("Invalid request or expired verification code.", 400);
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpiresAt) {
      return errorResponse(
        "No active password reset request found. Please request a new code.",
        400
      );
    }

    if (new Date(user.resetPasswordExpiresAt) < new Date()) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpiresAt = undefined;
      user.resetPasswordAttempts = 0;
      await user.save();
      return errorResponse(
        "Verification code has expired. Please request a new code.",
        400
      );
    }

    // Check attempts limit (max 5 failed attempts per OTP)
    if ((user.resetPasswordAttempts || 0) >= 5) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpiresAt = undefined;
      user.resetPasswordAttempts = 0;
      await user.save();
      return errorResponse(
        "Too many incorrect attempts. For security, please request a new verification code.",
        400
      );
    }

    const isValid = await verifyOtp(cleanOtp, user.resetPasswordOtp);
    if (!isValid) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      const remaining = Math.max(0, 5 - user.resetPasswordAttempts);
      await user.save();

      return errorResponse(
        `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        400
      );
    }

    // Assign plain password — UserSchema pre-save hook will hash it with 12 bcrypt salt rounds
    user.password = passwordStr;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.resetPasswordAttempts = 0;
    user.resetPasswordLastRequestedAt = undefined;
    user.emailVerified = true; // Email ownership verified through OTP
    await user.save();

    return successResponse(
      {
        message: "Password has been successfully updated. You can now sign in.",
      },
      200
    );
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return serverErrorResponse();
  }
}

