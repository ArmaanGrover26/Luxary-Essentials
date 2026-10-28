import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generates a cryptographically random 6-digit OTP
 * and returns both the plain OTP (to send to user) and its bcrypt hash (to store in DB).
 */
export async function generateOtp(): Promise<{ otp: string; hash: string }> {
  // Use crypto.randomInt for uniform distribution (avoids Math.random bias)
  const otp = String(crypto.randomInt(100000, 1000000)); // 100000–999999
  const hash = await bcrypt.hash(otp, 10);
  return { otp, hash };
}

/**
 * Verifies a plain OTP against its stored bcrypt hash.
 */
export async function verifyOtp(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

