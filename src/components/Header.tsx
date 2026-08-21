"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { totalCount: cartCount } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Resin Kits", href: "/shop?cat=resin" },
    { label: "Candles", href: "/shop?cat=candles" },
    { label: "Raw Materials", href: "/shop?cat=raw" },
    { label: "About", href: "/about" },
  ];

  const getInitials = (name: string) =>
    name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar">
        ✦ &nbsp; Handcrafted with love &nbsp; ✦
      </div>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: scrolled ? "rgba(250,247,242,0.96)" : "var(--cream)",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          boxShadow: scrolled ? "0 2px 30px rgba(0,0,0,0.06)" : "none",
          transition: "all 0.4s ease",
          borderBottom: "1px solid var(--beige)",
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "0 2rem",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <div>
              <div className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 400, color: "var(--charcoal)", letterSpacing: "0.04em", lineHeight: 1 }}>
                Luxury
              </div>
              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.55rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold)", marginTop: "2px" }}>
                Essentials
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ gap: "2.5rem" }}>
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {/* Search */}
            <button aria-label="Search" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart */}
            <Link href="/cart" style={{ position: "relative", textDecoration: "none", display: "flex" }} aria-label="Cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="badge" style={{ position: "absolute", top: "-8px", right: "-8px" }}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu / Login button */}
            {user ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "var(--charcoal)", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cormorant Garamond', serif", fontSize: "0.8rem",
                    fontWeight: 700, color: "var(--gold)", letterSpacing: "0.05em",
                  }}
                  aria-label="User menu"
                >
                  {getInitials(user.name)}
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    background: "var(--white)", border: "1px solid var(--beige)",
                    borderRadius: "10px", boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                    minWidth: "180px", overflow: "hidden", zIndex: 200,
                  }}>
                    <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--beige)" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontWeight: 500, color: "var(--charcoal)" }}>{user.name}</div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)", marginTop: "2px" }}>{user.email}</div>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)", textDecoration: "none", borderBottom: "1px solid var(--beige)" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%", padding: "0.75rem 1rem", background: "none", border: "none", fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#c53030", cursor: "pointer", textAlign: "left" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--charcoal)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}
                className="desktop-nav"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Login
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="mobile-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="1.5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`mobile-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile slide-in menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button
          onClick={() => setMenuOpen(false)}
          style={{ position: "absolute", top: "1.75rem", right: "1.75rem", background: "none", border: "none", cursor: "pointer" }}
          aria-label="Close"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--charcoal)" strokeWidth="1.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <Link href="/" style={{ textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
          <div className="font-serif" style={{ fontSize: "1.6rem", color: "var(--charcoal)", marginBottom: "3rem" }}>
            Luxury <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Essentials</span>
          </div>
        </Link>

        {/* User info in mobile menu */}
        {user && (
          <div style={{ background: "var(--ivory)", borderRadius: "8px", padding: "0.875rem 1rem", marginBottom: "1.5rem", border: "1px solid var(--beige)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "var(--charcoal)" }}>{user.name}</div>
            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)" }}>{user.email}</div>
          </div>
        )}

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: "0.8rem",
                letterSpacing: "0.15em", textTransform: "uppercase",
                color: "var(--charcoal)", textDecoration: "none",
                padding: "0.875rem 0", borderBottom: "1px solid var(--beige)",
              }}
            >
              {l.label}
            </Link>
          ))}

          {user && (
            <Link
              href="/orders"
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: "0.8rem",
                letterSpacing: "0.15em", textTransform: "uppercase",
                color: "var(--charcoal)", textDecoration: "none",
                padding: "0.875rem 0", borderBottom: "1px solid var(--beige)",
              }}
            >
              My Orders
            </Link>
          )}
        </nav>

        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link href="/cart" className="btn-gold" onClick={() => setMenuOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
            View Cart {cartCount > 0 && `(${cartCount})`}
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              style={{
                width: "100%", padding: "0.9rem", background: "none",
                border: "1px solid #fecdd3", borderRadius: "6px",
                fontFamily: "'Jost', sans-serif", fontSize: "0.75rem",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#be123c", cursor: "pointer",
              }}
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="btn-outline"
              style={{ width: "100%", justifyContent: "center" }}
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
