"use client";
import Link from "next/link";

export default function Footer() {
    const year = new Date().getFullYear();

    const links = {
        Shop: [
            { label: "Resin Kits", href: "/shop?cat=resin" },
            { label: "Candles", href: "/shop?cat=candles" },
            { label: "Raw Materials", href: "/shop?cat=raw" },
            { label: "Gifting", href: "/shop?cat=gifts" },
            { label: "New Arrivals", href: "/shop?cat=new" },
        ],
        Help: [
            { label: "Shipping Policy", href: "/shipping" },
            { label: "Returns & Refunds", href: "/returns" },
            { label: "Order Tracking", href: "/track" },
            { label: "FAQs", href: "/faqs" },
        ],
        Brand: [
            { label: "Our Story", href: "/about" },
            { label: "Sustainability", href: "/sustainability" },
            { label: "Press & Media", href: "/press" },
            { label: "Careers", href: "/careers" },
        ],
    };

    const socials = [
        {
            label: "Instagram",
            href: "https://instagram.com",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            ),
        },
        {
            label: "Pinterest",
            href: "https://pinterest.com",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.1-2 .2-2.9l1.2-5.2s-.3-.6-.3-1.5c0-1.4.8-2.5 2-2.5.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-3.7-3.8-2.6 0-4.1 1.9-4.1 3.9 0 .8.3 1.6.7 2.1.1.1.1.2.1.3l-.3 1c-.1.3-.3.4-.5.3C6.6 14 5.8 12.1 5.8 10.7c0-3.1 2.3-6 6.6-6 3.5 0 6.1 2.4 6.1 5.7 0 3.8-2.2 6.7-5.3 6.7-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2-1.4 2.7.9.3 1.8.4 2.8.4 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                </svg>
            ),
        },
        {
            label: "YouTube",
            href: "https://youtube.com",
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                </svg>
            ),
        },
    ];

    return (
        <footer style={{ background: "var(--charcoal)", color: "var(--ivory)" }}>
            {/* Newsletter strip */}
            <div
                style={{
                    background: "var(--gold-dark)",
                    padding: "3rem 2rem",
                    textAlign: "center",
                }}
            >
                <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                    <span className="section-label" style={{ color: "var(--gold-light)" }}>
                        Join the circle
                    </span>
                    <h3
                        className="font-serif"
                        style={{ fontSize: "2rem", fontWeight: 400, color: "var(--white)", marginBottom: "0.5rem" }}
                    >
                        Exclusive Offers & New Arrivals
                    </h3>
                    <p
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.85rem",
                            color: "rgba(255,255,255,0.65)",
                            marginBottom: "2rem",
                            letterSpacing: "0.04em",
                        }}
                    >
                        Subscribe for early access, styling tips & members-only discounts.
                    </p>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        style={{ display: "flex", gap: "0.75rem", maxWidth: "480px", margin: "0 auto" }}
                    >
                        <input
                            type="email"
                            placeholder="Your email address"
                            style={{
                                flex: 1,
                                padding: "0.875rem 1.25rem",
                                background: "rgba(255,255,255,0.12)",
                                border: "1px solid rgba(255,255,255,0.25)",
                                borderRadius: "2px",
                                color: "white",
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.85rem",
                                outline: "none",
                                letterSpacing: "0.04em",
                            }}
                        />
                        <button
                            type="submit"
                            className="btn-gold"
                            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Gold divider */}
            <hr className="gold-divider" style={{ margin: 0 }} />

            {/* Main footer */}
            <div
                style={{
                    maxWidth: "1320px",
                    margin: "0 auto",
                    padding: "5rem 2rem 3rem",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: "4rem",
                    }}
                    className="footer-grid"
                >
                    {/* Brand */}
                    <div>
                        <div
                            className="font-serif"
                            style={{ fontSize: "1.75rem", fontWeight: 400, color: "var(--ivory)", marginBottom: "0.25rem" }}
                        >
                            Luxury Essentials
                        </div>
                        <div
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.65rem",
                                letterSpacing: "0.3em",
                                textTransform: "uppercase",
                                color: "var(--gold)",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Crafted with Elegance
                        </div>
                        <p
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.85rem",
                                color: "rgba(245,240,232,0.55)",
                                lineHeight: 1.8,
                                maxWidth: "280px",
                                marginBottom: "2rem",
                            }}
                        >
                            Handcrafted resin art, artisanal candles, and premium raw materials — curated for those who appreciate beauty in every detail.
                        </p>
                        {/* Socials */}
                        <div style={{ display: "flex", gap: "1rem" }}>
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        border: "1px solid rgba(184,157,114,0.3)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "var(--gold-light)",
                                        transition: "all 0.35s ease",
                                        textDecoration: "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.background = "var(--gold)";
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--gold)";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "white";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(184,157,114,0.3)";
                                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold-light)";
                                    }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(links).map(([title, items]) => (
                        <div key={title}>
                            <h4
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.7rem",
                                    letterSpacing: "0.22em",
                                    textTransform: "uppercase",
                                    color: "var(--gold)",
                                    marginBottom: "1.5rem",
                                    fontWeight: 500,
                                }}
                            >
                                {title}
                            </h4>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            style={{
                                                fontFamily: "'Jost', sans-serif",
                                                fontSize: "0.83rem",
                                                color: "rgba(245,240,232,0.55)",
                                                textDecoration: "none",
                                                letterSpacing: "0.04em",
                                                transition: "color 0.3s",
                                            }}
                                            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--gold-light)")}
                                            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "rgba(245,240,232,0.55)")}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gold divider */}
            <hr className="gold-divider" style={{ margin: "0 2rem" }} />

            {/* Bottom */}
            <div
                style={{
                    maxWidth: "1320px",
                    margin: "0 auto",
                    padding: "1.5rem 2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "1rem",
                }}
            >
                <p
                    style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.75rem",
                        color: "rgba(245,240,232,0.4)",
                        letterSpacing: "0.06em",
                    }}
                >
                    © {year} Luxury Essentials. All rights reserved.
                </p>
                <div style={{ display: "flex", gap: "2rem" }}>
                    {["Privacy Policy", "Terms of Service", "Cookie Settings"].map((t) => (
                        <Link
                            key={t}
                            href="#"
                            style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.75rem",
                                color: "rgba(245,240,232,0.35)",
                                textDecoration: "none",
                                letterSpacing: "0.06em",
                                transition: "color 0.3s",
                            }}
                            onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "var(--gold)")}
                            onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "rgba(245,240,232,0.35)")}
                        >
                            {t}
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 4rem;
        }
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
        }
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
        </footer>
    );
}
