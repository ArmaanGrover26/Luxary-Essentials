"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || "Login failed.");
    }
  };

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
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
              Welcome back
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "var(--charcoal)", margin: 0, lineHeight: 1.2 }}>
              Sign In
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px",
              padding: "0.75rem 1rem", marginBottom: "1.5rem",
              fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#c53030",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Email */}
            <div>
              <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--warm-gray)", display: "block", marginBottom: "0.4rem" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "var(--cream)", border: "1px solid var(--beige)",
                  borderRadius: "8px", padding: "0.75rem 1rem",
                  fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "var(--charcoal)",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--beige)")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--warm-gray)", display: "block", marginBottom: "0.4rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "var(--cream)", border: "1px solid var(--beige)",
                    borderRadius: "8px", padding: "0.75rem 3rem 0.75rem 1rem",
                    fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "var(--charcoal)",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--beige)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--light-gray)", padding: 0, display: "flex" }}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
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
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.75rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--beige)" }} />
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--beige)" }} />
          </div>

          {/* Register link */}
          <div style={{ textAlign: "center" }}>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--gold)", textDecoration: "none", fontWeight: 500 }}
            >
              Create Account
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--cream)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
