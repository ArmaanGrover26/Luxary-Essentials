"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount: cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Resin Kits", href: "/shop?cat=resin" },
    { label: "Candles", href: "/shop?cat=candles" },
    { label: "Raw Materials", href: "/shop?cat=raw" },
    { label: "About", href: "/about" },
  ];

  return (
    <>
      {/* Announcement bar */}
      <div className="announcement-bar">
        ✦ &nbsp; Free shipping on orders above ₹999 &nbsp; ✦ &nbsp; Handcrafted with love &nbsp; ✦
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

          {/* Desktop Nav — hidden via CSS on mobile */}
          <nav className="desktop-nav" style={{ gap: "2.5rem" }}>
            {navLinks.map((l) => (
              <Link key={l.label} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
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

            {/* Hamburger — shown via CSS on mobile only */}
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <Link href="/" style={{ textDecoration: "none" }} onClick={() => setMenuOpen(false)}>
          <div className="font-serif" style={{ fontSize: "1.6rem", color: "var(--charcoal)", marginBottom: "3rem" }}>
            Luxury <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Essentials</span>
          </div>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.8rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--charcoal)",
                textDecoration: "none",
                padding: "0.875rem 0",
                borderBottom: "1px solid var(--beige)",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "3rem" }}>
          <Link href="/cart" className="btn-gold" onClick={() => setMenuOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
            View Cart
          </Link>
        </div>
      </div>
    </>
  );
}
