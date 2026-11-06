"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  // Step 1: enter email, Step 2: enter OTP & new password, Step 3: success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setInfo("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
        setResendCooldown(60);
        setInfo(`A 6-digit verification code has been sent to ${cleanEmail}`);
        // Autofocus first digit
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.message || "Failed to send verification code. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Digit Inputs
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
      inputRefs.current[5]?.focus();
    }
  };

  // Handle Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const otp = digits.join("");
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(3);
      } else {
        setError(data.message || "Password reset failed. Please check your code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--cream)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top brand header */}
      <div
        style={{
          background: "var(--charcoal)",
          padding: "1.25rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.6rem",
                fontWeight: 400,
                color: "var(--ivory)",
                letterSpacing: "0.04em",
                lineHeight: 1,
              }}
            >
              Luxury
            </div>
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.5rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginTop: "2px",
              }}
            >
              Essentials
            </div>
          </div>
        </Link>
      </div>

      {/* Main card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.25rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "var(--white)",
            borderRadius: "16px",
            border: "1px solid var(--beige)",
            padding: "2.5rem 2rem",
            boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* STEP 1: Request Code */}
          {step === 1 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  Account Recovery
                </div>
                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 400,
                    color: "var(--charcoal)",
                    margin: "0 0 0.5rem",
                    lineHeight: 1.2,
                  }}
                >
                  Forgot Password?
                </h1>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.85rem",
                    color: "var(--warm-gray)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Enter your registered email address. We will send you a 6-digit
                  verification code to set a new password.
                </p>
              </div>

              {error && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid #fed7d7",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.5rem",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    color: "#c53030",
                  }}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleRequestOtp}
                style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
              >
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--warm-gray)",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "var(--cream)",
                      border: "1px solid var(--beige)",
                      borderRadius: "8px",
                      padding: "0.75rem 1rem",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.9rem",
                      color: "var(--charcoal)",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--beige)")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.9rem",
                    background: loading ? "var(--beige)" : "var(--charcoal)",
                    color: loading ? "var(--warm-gray)" : "var(--ivory)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid var(--warm-gray)",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Sending Code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
                <Link
                  href="/login"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    color: "var(--gold)",
                    textDecoration: "none",
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  Verification &amp; Reset
                </div>
                <h1
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2rem",
                    fontWeight: 400,
                    color: "var(--charcoal)",
                    margin: "0 0 0.5rem",
                    lineHeight: 1.2,
                  }}
                >
                  Set New Password
                </h1>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.85rem",
                    color: "var(--warm-gray)",
                    lineHeight: 1.5,
                    margin: "0 0 0.5rem",
                  }}
                >
                  We sent a 6-digit code to{" "}
                  <strong style={{ color: "var(--charcoal)" }}>{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                    setInfo("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--gold)",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Change email address
                </button>
              </div>

              {info && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.25rem",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    color: "#166534",
                  }}
                >
                  {info}
                </div>
              )}

              {error && (
                <div
                  style={{
                    background: "#fff5f5",
                    border: "1px solid #fed7d7",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.25rem",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    color: "#c53030",
                  }}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={handleResetPassword}
                style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                {/* 6 Digit OTP input */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--warm-gray)",
                      display: "block",
                      marginBottom: "0.6rem",
                      textAlign: "center",
                    }}
                  >
                    6-Digit Verification Code
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                    onPaste={handlePaste}
                  >
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        style={{
                          width: "44px",
                          height: "52px",
                          textAlign: "center",
                          fontSize: "1.4rem",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "var(--charcoal)",
                          background: "var(--cream)",
                          border: `1.5px solid ${digit ? "var(--gold)" : "var(--beige)"}`,
                          borderRadius: "8px",
                          outline: "none",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "var(--gold)";
                          e.target.style.background = "var(--white)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = digit
                            ? "var(--gold)"
                            : "var(--beige)";
                          e.target.style.background = "var(--cream)";
                        }}
                      />
                    ))}
                  </div>

                  {/* Resend button */}
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "0.75rem",
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.78rem",
                      color: "var(--warm-gray)",
                    }}
                  >
                    Didn&apos;t receive code?{" "}
                    {resendCooldown > 0 ? (
                      <span style={{ color: "var(--light-gray)" }}>
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestOtp()}
                        disabled={loading}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--gold)",
                          cursor: "pointer",
                          fontWeight: 500,
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--warm-gray)",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "var(--cream)",
                        border: "1px solid var(--beige)",
                        borderRadius: "8px",
                        padding: "0.75rem 3rem 0.75rem 1rem",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.9rem",
                        color: "var(--charcoal)",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--beige)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      style={{
                        position: "absolute",
                        right: "0.9rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--light-gray)",
                        padding: 0,
                        display: "flex",
                      }}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? (
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--warm-gray)",
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Confirm New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      required
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "var(--cream)",
                        border: "1px solid var(--beige)",
                        borderRadius: "8px",
                        padding: "0.75rem 3rem 0.75rem 1rem",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.9rem",
                        color: "var(--charcoal)",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--beige)")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((p) => !p)}
                      style={{
                        position: "absolute",
                        right: "0.9rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--light-gray)",
                        padding: 0,
                        display: "flex",
                      }}
                      aria-label={
                        showConfirmPass ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPass ? (
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    marginTop: "0.5rem",
                    padding: "0.9rem",
                    background: loading ? "var(--beige)" : "var(--charcoal)",
                    color: loading ? "var(--warm-gray)" : "var(--ivory)",
                    border: "none",
                    borderRadius: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid var(--warm-gray)",
                          borderTop: "2px solid transparent",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <Link
                  href="/login"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.82rem",
                    color: "var(--gold)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#f0fdf4",
                  border: "2px solid #86efac",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                Success
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "2rem",
                  fontWeight: 400,
                  color: "var(--charcoal)",
                  margin: "0 0 0.75rem",
                }}
              >
                Password Updated!
              </h2>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.88rem",
                  color: "var(--warm-gray)",
                  lineHeight: 1.6,
                  margin: "0 0 2rem",
                }}
              >
                Your password has been successfully reset. You can now sign in with
                your new credentials.
              </p>

              <button
                type="button"
                onClick={() => router.push("/login?reset=success")}
                className="btn-gold"
                style={{
                  width: "100%",
                  padding: "0.9rem",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                Proceed to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--cream)",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "2px solid var(--gold)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

