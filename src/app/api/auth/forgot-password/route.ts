import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from "@/utils/apiResponse";
import { rateLimit, getClientIp } from "@/lib/rateLimiter";
import { generateOtp } from "@/lib/otp";
import { sendPasswordResetOtpEmail } from "@/lib/otpEmailService";

const GENERIC_RESPONSE_MSG =
  "If an account is registered with this email, a 6-digit verification code has been sent.";

export async function POST(req: NextRequest) {
  // Rate limit: 5 forgot-password requests per 15 minutes per IP
  const limited = rateLimit(getClientIp(req), "forgot-password", {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (limited) return limited;

  try {
    const body = await req.json();
    const email = body?.email ? String(body.email).trim().toLowerCase() : "";

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return errorResponse("Please enter a valid email address.", 400);
    }

    await connectDB();

    const user = await User.findOne({ email }).select(
      "+resetPasswordLastRequestedAt"
    );

    // Only process if user exists AND is a customer (role: "user")
    // If user does not exist or is an admin, return the exact same generic message
    // to prevent email enumeration or admin account tampering.
    if (user && user.role === "user") {
      // 60-second cooldown per email
      if (user.resetPasswordLastRequestedAt) {
        const elapsed =
          Date.now() - new Date(user.resetPasswordLastRequestedAt).getTime();
        if (elapsed < 60_000) {
          const waitSec = Math.ceil((60_000 - elapsed) / 1000);
          return errorResponse(
            `Please wait ${waitSec}s before requesting a new code.`,
            429
          );
        }
      }

      const { otp, hash } = await generateOtp();

      user.resetPasswordOtp = hash;
      user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60_000); // 10 minutes
      user.resetPasswordAttempts = 0;
      user.resetPasswordLastRequestedAt = new Date();
      await user.save();

      // Send OTP via dedicated Gmail SMTP transporter
      try {
        await sendPasswordResetOtpEmail(user.email, user.name, otp);
      } catch (mailErr) {
        console.error("[forgot-password] Email send failed:", mailErr);
        return errorResponse(
          "Failed to send verification email. Please try again shortly.",
          500
        );
      }
    }

    return successResponse({
      message: GENERIC_RESPONSE_MSG,
      email,
    });
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    return serverErrorResponse();
  }
}

