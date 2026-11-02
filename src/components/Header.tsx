"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, Search, X, Loader2 } from "lucide-react";

interface SearchProductPreview {
  _id: string;
  name: string;
  category: string;
  price: number;
  images?: string[];
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProductPreview[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { totalCount: cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [activeFestival, setActiveFestival] = useState<{ name: string; bannerText?: string } | null>(null);

  useEffect(() => {
    fetch("/api/festivals/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.isActive) {
          setActiveFestival({ name: data.data.name, bannerText: data.data.bannerText });
        } else {
          setActiveFestival(null);
        }
      })
      .catch(() => setActiveFestival(null));
  }, []);

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

  // Autofocus search input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchOpen]);

  // Handle escape key and click outside to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    if (searchOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  // Debounced live search preview
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = await res.json();
        if (data.success && data.data?.products) {
          setSearchResults(data.data.products);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const navLinks = [
    { label: "Shop", href: "/shop" },
    ...(activeFestival ? [{ label: `✨ ${activeFestival.name}`, href: "/shop?category=festival-special" }] : []),
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
        {activeFestival ? (
          <Link
            href="/shop?category=festival-special"
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
            }}
          >
            <span>✨</span>
            <span>{activeFestival.bannerText || `Celebrate ${activeFestival.name} — Explore Festive Specials`}</span>
            <span>✦</span>
          </Link>
        ) : (
          <>✦ &nbsp; Handcrafted with love &nbsp; ✦</>
        )}
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
            <button
              onClick={() => setSearchOpen((p) => !p)}
              aria-label="Search"
              style={{
                background: searchOpen ? "var(--ivory)" : "none",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: searchOpen ? "var(--gold)" : "var(--charcoal)",
                transition: "all 0.2s",
              }}
              title="Search products"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              style={{ position: "relative", textDecoration: "none", display: "flex", color: "var(--charcoal)" }}
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart
                size={19}
                fill={wishlistCount > 0 ? "rgba(190, 18, 60, 0.15)" : "none"}
                color={wishlistCount > 0 ? "#be123c" : "var(--charcoal)"}
                strokeWidth={1.5}
              />
              {wishlistCount > 0 && (
                <span
                  className="badge"
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "#be123c",
                    color: "#ffffff",
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

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
                      href="/wishlist"
                      onClick={() => setUserMenuOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)", textDecoration: "none", borderBottom: "1px solid var(--beige)" }}
                    >
                      <Heart size={15} color="#be123c" strokeWidth={1.5} />
                      My Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                    </Link>
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

        {/* Search Dropdown / Bar */}
        {searchOpen && (
          <div
            ref={searchContainerRef}
            style={{
              borderTop: "1px solid var(--beige)",
              background: "var(--white)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              padding: "1rem 2rem 1.25rem",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "0.75rem", position: "relative" }}>
                <Search size={20} color="var(--gold)" style={{ flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, resin art, candles, gifts..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: "0.95rem",
                    fontFamily: "'Jost', sans-serif",
                    color: "var(--charcoal)",
                    background: "transparent",
                    padding: "0.5rem 0",
                  }}
                />
                {searchLoading ? (
                  <Loader2 size={18} color="var(--gold)" style={{ animation: "spin 1s linear infinite" }} />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--light-gray)", padding: "4px", display: "flex" }}
                    aria-label="Clear search text"
                  >
                    <X size={16} />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="btn-gold"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.75rem", letterSpacing: "0.1em" }}
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--warm-gray)", padding: "4px", display: "flex" }}
                  aria-label="Close search bar"
                >
                  <X size={20} />
                </button>
              </form>

              {/* Instant Search Results Dropdown */}
              {searchQuery.trim() && (
                <div style={{ marginTop: "1rem", borderTop: "1px solid var(--beige)", paddingTop: "0.75rem" }}>
                  {searchResults.length > 0 ? (
                    <div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--warm-gray)", marginBottom: "0.5rem" }}>
                        Quick Results ({searchResults.length})
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {searchResults.map((item) => (
                          <Link
                            key={item._id}
                            href={`/product/${item._id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              padding: "0.5rem 0.75rem",
                              borderRadius: "8px",
                              textDecoration: "none",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ width: "42px", height: "42px", borderRadius: "6px", overflow: "hidden", position: "relative", background: "var(--beige)", flexShrink: 0 }}>
                              {item.images?.[0] ? (
                                <Image src={item.images[0]} alt={item.name} fill sizes="42px" style={{ objectFit: "cover" }} />
                              ) : null}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--charcoal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {item.name}
                              </div>
                              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)", textTransform: "capitalize" }}>
                                {item.category}
                              </div>
                            </div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)", flexShrink: 0 }}>
                              ₹{item.price?.toLocaleString("en-IN")}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={handleSearchSubmit}
                        style={{
                          marginTop: "0.75rem",
                          width: "100%",
                          textAlign: "center",
                          padding: "0.6rem",
                          background: "var(--cream)",
                          border: "1px solid var(--beige)",
                          borderRadius: "8px",
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "var(--charcoal)",
                          cursor: "pointer",
                        }}
                      >
                        View all results for &ldquo;{searchQuery}&rdquo; →
                      </button>
                    </div>
                  ) : !searchLoading ? (
                    <div style={{ padding: "1rem 0", textAlign: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--warm-gray)" }}>
                      No products found matching &ldquo;{searchQuery}&rdquo;. Press Enter to explore all items.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
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
          <div className="font-serif" style={{ fontSize: "1.6rem", color: "var(--charcoal)", marginBottom: "2rem" }}>
            Luxury <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Essentials</span>
          </div>
        </Link>

        {/* Mobile Search Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem("mobileSearch") as HTMLInputElement;
            if (input && input.value.trim()) {
              router.push(`/shop?q=${encodeURIComponent(input.value.trim())}`);
              setMenuOpen(false);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--ivory)",
            border: "1px solid var(--beige)",
            borderRadius: "10px",
            padding: "0.65rem 0.85rem",
            marginBottom: "1.5rem",
            gap: "0.5rem",
          }}
        >
          <Search size={16} color="var(--gold)" style={{ flexShrink: 0 }} />
          <input
            name="mobileSearch"
            type="text"
            placeholder="Search products..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.85rem",
              color: "var(--charcoal)",
              width: "100%",
            }}
          />
        </form>

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

          <Link
            href="/wishlist"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "'Jost', sans-serif", fontSize: "0.8rem",
              letterSpacing: "0.15em", textTransform: "uppercase",
              color: "var(--charcoal)", textDecoration: "none",
              padding: "0.875rem 0", borderBottom: "1px solid var(--beige)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span style={{ fontSize: "0.75rem", background: "rgba(190, 18, 60, 0.1)", color: "#be123c", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                {wishlistCount}
              </span>
            )}
          </Link>

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
