"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAdminUrl } from "@/config/adminConfig";

function AdminLoginForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "access_denied") {
      setError("Access denied. Administrator privileges are required.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.data.user.role !== "admin") {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        setError("Access denied. This account does not have administrator privileges.");
        setLoading(false);
        return;
      }

      // Full page redirect so httpOnly cookie is sent through middleware
      const from = searchParams.get("from") || getAdminUrl();
      window.location.href = from;
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Jost', sans-serif" }}>
      {/* ── Left Panel (hidden on mobile) ─────────────────── */}
      <div
        className="admin-left-panel"
        style={{
          flex: "0 0 45%",
          background: "linear-gradient(160deg, #1a1a1a 0%, #2c2c2c 50%, #1f1a14 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
        }}
      >
        {/* Decorative gold mandala pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(184,157,114,0.12) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(184,157,114,0.10) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(184,157,114,0.06) 0%, transparent 70%)
            `,
          }}
        />

        {/* Ornamental SVG geometric decoration */}
        <svg
          width="360"
          height="360"
          viewBox="0 0 360 360"
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            opacity: 0.18,
          }}
          aria-hidden="true"
        >
          <g stroke="#b89d72" strokeWidth="1" fill="none">
            <circle cx="180" cy="180" r="160" />
            <circle cx="180" cy="180" r="130" />
            <circle cx="180" cy="180" r="100" />
            <circle cx="180" cy="180" r="70" />
            <line x1="20" y1="180" x2="340" y2="180" />
            <line x1="180" y1="20" x2="180" y2="340" />
            <line x1="67" y1="67" x2="293" y2="293" />
            <line x1="293" y1="67" x2="67" y2="293" />
            <polygon points="180,40 310,250 50,250" />
            <polygon points="180,320 50,110 310,110" />
          </g>
        </svg>

        {/* Top badge */}
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ margin: "0 auto 1rem" }}>
              <path
                d="M26 4L6 14v12c0 11 8.5 21 20 24 11.5-3 20-13 20-24V14L26 4z"
                fill="none"
                stroke="#b89d72"
                strokeWidth="1.5"
              />
              <path
                d="M26 9L10 18v9c0 8.5 6.5 16.5 16 19 9.5-2.5 16-10.5 16-19v-9L26 9z"
                fill="none"
                stroke="#b89d72"
                strokeWidth="0.8"
                opacity="0.5"
              />
              <path
                d="M18 26l5 5 11-11"
                stroke="#b89d72"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Brand wordmark */}
          <div style={{ marginBottom: "0.5rem" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 400,
                color: "#ffffff",
                letterSpacing: "0.06em",
                lineHeight: 1.1,
              }}
            >
              Luxury
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                fontWeight: 300,
                color: "#b89d72",
                letterSpacing: "0.06em",
                lineHeight: 1.1,
                fontStyle: "italic",
              }}
            >
              Essentials
            </div>
          </div>

          {/* Gold ornamental divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, #b89d72)" }} />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="#b89d72">
              <rect x="5" y="0" width="2" height="2" transform="rotate(45 6 6)" />
            </svg>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, #b89d72, transparent)" }} />
          </div>

          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#a09990",
              fontWeight: 400,
            }}
          >
            Administration Portal
          </p>
        </div>

        {/* Bottom branding note */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            color: "#4a4540",
            fontFamily: "'Jost', sans-serif",
          }}
        >
          RESTRICTED ACCESS · AUTHORIZED PERSONNEL ONLY
        </div>
      </div>

      {/* ── Right Panel (login form) ───────────────────────── */}
      <div
        style={{
          flex: 1,
          background: "#faf7f2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
          }}
        >
          {/* Mobile brand header (only visible on small screens) */}
          <div className="admin-mobile-brand" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                color: "#2c2c2c",
                letterSpacing: "0.04em",
              }}
            >
              Luxury{" "}
              <span style={{ color: "#b89d72", fontStyle: "italic" }}>Essentials</span>
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#a09990",
                marginTop: "0.35rem",
              }}
            >
              Admin Portal
            </div>
          </div>

          {/* Form Heading */}
          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.6rem, 4vw, 2.1rem)",
                fontWeight: 400,
                color: "#2c2c2c",
                letterSpacing: "0.02em",
                marginBottom: "0.35rem",
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: "0.82rem", color: "#6b6560", lineHeight: 1.5 }}>
              Sign in to access the administration dashboard.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              style={{
                padding: "0.85rem 1rem",
                background: "#fff5f5",
                border: "1px solid #fecaca",
                borderRadius: "10px",
                color: "#991b1b",
                fontSize: "0.8rem",
                lineHeight: 1.5,
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6b6560",
                  marginBottom: "0.5rem",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a09990"
                  strokeWidth="1.5"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luxuryessentials.com"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.75rem",
                    background: "#ffffff",
                    border: "1px solid #ede5d8",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    color: "#2c2c2c",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "'Jost', sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#b89d72")}
                  onBlur={(e) => (e.target.style.borderColor = "#ede5d8")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#6b6560",
                  marginBottom: "0.5rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a09990"
                  strokeWidth="1.5"
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: "100%",
                    padding: "0.85rem 3rem 0.85rem 2.75rem",
                    background: "#ffffff",
                    border: "1px solid #ede5d8",
                    borderRadius: "10px",
                    fontSize: "0.875rem",
                    color: "#2c2c2c",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "'Jost', sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#b89d72")}
                  onBlur={(e) => (e.target.style.borderColor = "#ede5d8")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "#a09990",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              id="admin-login-btn"
              style={{
                width: "100%",
                padding: "0.95rem",
                background: loading
                  ? "#c9ae86"
                  : "linear-gradient(135deg, #b89d72 0%, #8b7355 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.8rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Jost', sans-serif",
                transition: "all 0.25s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                boxShadow: loading ? "none" : "0 4px 20px rgba(184,157,114,0.35)",
                marginTop: "0.5rem",
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Authenticating…
                </>
              ) : (
                <>
                  Sign In to Admin Portal
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "1.75rem 0 1.25rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#ede5d8" }} />
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "#a09990", textTransform: "uppercase" }}>
              secure access
            </span>
            <div style={{ flex: 1, height: "1px", background: "#ede5d8" }} />
          </div>

          {/* Footer link */}
          <div style={{ textAlign: "center" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.78rem",
                color: "#a09990",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b89d72")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a09990")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Return to Storefront
            </Link>
          </div>

          {/* Copyright */}
          <p
            style={{
              textAlign: "center",
              fontSize: "0.65rem",
              color: "#c5bdb7",
              marginTop: "2.5rem",
              letterSpacing: "0.08em",
            }}
          >
            © {new Date().getFullYear()} Luxury Essentials. All rights reserved.
          </p>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .admin-left-panel {
          display: flex !important;
        }
        .admin-mobile-brand {
          display: none !important;
        }

        @media (max-width: 768px) {
          .admin-left-panel {
            display: none !important;
          }
          .admin-mobile-brand {
            display: block !important;
          }
        }

        #admin-login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #c9ae86 0%, #9a8261 100%) !important;
          box-shadow: 0 6px 28px rgba(184,157,114,0.45) !important;
          transform: translateY(-1px);
        }

        #admin-login-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(184,157,114,0.3) !important;
        }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "36px", height: "36px", border: "2px solid #ede5d8", borderTopColor: "#b89d72", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
            <p style={{ fontSize: "0.8rem", color: "#a09990", letterSpacing: "0.1em" }}>Loading…</p>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
