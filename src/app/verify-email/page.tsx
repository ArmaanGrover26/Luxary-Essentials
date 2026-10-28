"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function VerifyEmailForm() {
  const { verifyEmail, resendOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const redirect = searchParams.get("redirect") || "/";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email param
  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Accept only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5) {
      const otp = [...newDigits.slice(0, 5), digit].join("");
      if (otp.length === 6) handleVerify(otp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      setError("");
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otp: string) => {
    if (loading) return;
    setLoading(true);
    setError("");
    const result = await verifyEmail(email, otp);
    setLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || "Verification failed.");
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    handleVerify(otp);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setInfo("");
    setError("");
    const result = await resendOtp(email);
    if (result.success) {
      setInfo("A new verification code has been sent to your email. Please check your spam folder as well.");
      setResendCooldown(60); // 60-second cooldown
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } else {
      setError(result.error || "Failed to resend code. Try again.");
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c)
    : "";

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexDirection: "column" }}>
      {/* Top brand strip */}
      <div style={{ background: "var(--charcoal)", padding: "1.25rem 2rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 400, color: "var(--ivory)", letterSpacing: "0.04em", lineHeight: 1 }}>
              Luxury
            </div>
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.5rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold)", marginTop: "2px" }}>
              Essentials
            </div>
          </div>
        </Link>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.25rem" }}>
        <div style={{
          width: "100%", maxWidth: "440px",
          background: "var(--white)", borderRadius: "16px",
          border: "1px solid var(--beige)", padding: "2.5rem 2rem",
          boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
              One last step
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "var(--charcoal)", margin: "0 0 0.75rem", lineHeight: 1.2 }}>
              Verify Your Email
            </h1>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)", margin: 0, lineHeight: 1.7 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: "var(--charcoal)" }}>{maskedEmail}</strong>
            </p>

            {/* Spam notice tip */}
            <div style={{
              marginTop: "0.9rem",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "0.6rem 0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textAlign: "left",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "#92400e", lineHeight: 1.4 }}>
                Can&apos;t find it? Please check your <strong>spam or junk folder</strong> as well.
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px",
              padding: "0.75rem 1rem", marginBottom: "1.25rem",
              fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#c53030",
            }}>
              {error}
            </div>
          )}

          {/* Info */}
          {info && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px",
              padding: "0.75rem 1rem", marginBottom: "1.25rem",
              fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#166534",
            }}>
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 6-digit OTP input */}
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginBottom: "1.75rem" }} onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  style={{
                    width: "48px", height: "56px",
                    textAlign: "center",
                    fontFamily: "'Jost', sans-serif", fontSize: "1.4rem", fontWeight: 600,
                    color: "var(--charcoal)",
                    background: "var(--cream)", border: `2px solid ${digit ? "var(--gold)" : "var(--beige)"}`,
                    borderRadius: "10px", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = digit ? "var(--gold)" : "var(--beige)")}
                />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "0.9rem",
                background: loading ? "var(--beige)" : "var(--charcoal)",
                color: loading ? "var(--warm-gray)" : "var(--ivory)",
                border: "none", borderRadius: "8px", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Jost', sans-serif", fontSize: "0.78rem",
                letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "background 0.2s",
              }}
            >
              {loading ? (
                <>
                  <span style={{ width: "16px", height: "16px", border: "2px solid var(--warm-gray)", borderTop: "2px solid transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Verifying...
                </>
              ) : "Verify Email"}
            </button>
          </form>

          {/* Resend */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>
              Didn&apos;t receive a code?{" "}
            </span>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              style={{
                background: "none", border: "none", padding: 0, cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                fontFamily: "'Jost', sans-serif", fontSize: "0.82rem",
                color: resendCooldown > 0 ? "var(--light-gray)" : "var(--gold)",
                fontWeight: 500, textDecoration: resendCooldown > 0 ? "none" : "underline",
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
          </div>

          {/* Back to register */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <Link
              href="/register"
              style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--warm-gray)", textDecoration: "none" }}
            >
              ← Back to Register
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--cream)" }} />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

