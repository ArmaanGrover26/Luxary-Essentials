"use client";
import Link from "next/link";

const categories = [
  {
    name: "Resin Kits",
    href: "/shop?cat=resin",
    label: "Start creating",
    desc: "Epoxy resin, pigments, molds & tools — everything to begin your resin journey.",
    color: "#7ea8b4",
    accent: "#5a8a9a",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    name: "Candle Supplies",
    href: "/shop?cat=candles",
    label: "Pour your first candle",
    desc: "Soy wax, fragrance oils, wicks, molds & dyes for beautiful handmade candles.",
    color: "#d4b896",
    accent: "#b89d72",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M12 2c0 0-2 3-2 5a2 2 0 0 0 4 0c0-2-2-5-2-5z" />
        <rect x="6" y="9" width="12" height="13" rx="1" />
        <path d="M6 12h12" />
      </svg>
    ),
  },
  {
    name: "Custom Frames",
    href: "/custom-order",
    label: "Order yours",
    desc: "Resin photo frames in 8\", 10\" & 12\" sizes — personalized to your aesthetic.",
    color: "#c4a882",
    accent: "#a08060",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    ),
  },
  {
    name: "Resin Wall Clocks",
    href: "/custom-order",
    label: "Design your clock",
    desc: "Stunning resin art clocks, fully customized — a statement piece for any room.",
    color: "#9eb8a0",
    accent: "#7a9880",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    name: "Preservation",
    href: "/custom-order",
    label: "Preserve your memories",
    desc: "Preserve flowers, jewelry, photos & memories in crystal-clear resin forever.",
    color: "#e8c4c4",
    accent: "#c49090",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    name: "Phone Covers",
    href: "/custom-order",
    label: "Get yours made",
    desc: "Unique resin phone covers — fully customized design, colors & inclusions.",
    color: "#b4a8d4",
    accent: "#9080b4",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
];

export default function CategoriesSection() {
  return (
    <section style={{ background: "var(--ivory)", padding: "7rem 1.5rem" }}>
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span className="section-label animate-fade-up">Shop by Category</span>
          <h2 className="section-title animate-fade-up delay-100" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
            What We Offer
          </h2>
          <hr className="gold-divider animate-fade-up delay-200" style={{ width: "60px", margin: "1.5rem auto 0" }} />
        </div>

        <div className="cat-grid">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`animate-fade-up delay-${(i + 1) * 100}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                className="cat-card"
                style={{
                  background: "var(--white)",
                  borderRadius: "8px",
                  border: "1px solid var(--beige)",
                  padding: "2.25rem 1.75rem",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.35s ease",
                  cursor: "pointer",
                  height: "100%",
                }}
              >
                {/* Color accent bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${cat.color}, ${cat.accent})` }} />

                {/* Icon circle */}
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${cat.color}22`, border: `1px solid ${cat.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: cat.accent, marginBottom: "1.25rem" }}>
                  {cat.icon}
                </div>

                <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.5rem" }}>{cat.name}</h3>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)", lineHeight: 1.65, marginBottom: "1.5rem" }}>{cat.desc}</p>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cat.accent, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {cat.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
