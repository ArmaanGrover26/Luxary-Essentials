"use client";
import Link from "next/link";

const categories = [
    {
        name: "Resin Kits",
        description: "Start your resin journey with our curated beginner & pro kits.",
        items: "48 Products",
        accent: "#b89d72",
        bg: "linear-gradient(135deg, var(--blush) 0%, var(--rose) 100%)",
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b89d72" strokeWidth="1">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a7 7 0 1 0 7 7" />
                <path d="M8.5 8.5s1.5 2 3.5 2 3.5-2 3.5-2" />
            </svg>
        ),
        href: "/shop?cat=resin",
    },
    {
        name: "Candles",
        description: "Hand-poured soy candles in exquisite scents and elegant vessels.",
        items: "36 Products",
        accent: "#c4a882",
        bg: "linear-gradient(135deg, var(--ivory) 0%, var(--beige) 100%)",
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4a882" strokeWidth="1">
                <path d="M9 2h6l1 7H8L9 2z" />
                <rect x="7" y="9" width="10" height="12" rx="1" />
                <line x1="12" y1="2" x2="12" y2="0" />
                <path d="M12 0 q1-1 0-2 q-1 1 0 2" />
            </svg>
        ),
        href: "/shop?cat=candles",
    },
    {
        name: "Raw Materials",
        description: "Premium pigments, molds, wax, and tools for your craft.",
        items: "72 Products",
        accent: "#8b7355",
        bg: "linear-gradient(135deg, var(--beige) 0%, var(--ivory) 50%, var(--blush) 100%)",
        icon: (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8b7355" strokeWidth="1">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        href: "/shop?cat=raw",
    },
];

export default function CategoriesSection() {
    return (
        <section
            style={{
                background: "var(--ivory)",
                padding: "7rem 2rem",
                borderTop: "1px solid var(--beige)",
            }}
        >
            <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        marginBottom: "4rem",
                        flexWrap: "wrap",
                        gap: "1.5rem",
                    }}
                >
                    <div>
                        <span className="section-label">Explore</span>
                        <h2
                            className="section-title"
                            style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
                        >
                            Shop by Category
                        </h2>
                    </div>
                    <Link href="/shop" className="btn-outline">
                        All Categories
                    </Link>
                </div>

                {/* Category grid */}
                <div className="cat-grid">
                    {categories.map((cat, i) => (
                        <Link
                            key={cat.name}
                            href={cat.href}
                            style={{ textDecoration: "none" }}
                            className={`animate-fade-up delay-${(i + 1) * 100}`}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    background: cat.bg,
                                    padding: "3rem 2.5rem",
                                    minHeight: "320px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    boxShadow: "var(--shadow-card)",
                                    transition: "all 0.4s ease",
                                    border: "1px solid rgba(184,157,114,0.15)",
                                }}
                                className="cat-card"
                            >
                                {/* Icon */}
                                <div
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.55)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "2rem",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    {cat.icon}
                                </div>

                                {/* Text */}
                                <div>
                                    <div
                                        style={{
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: "0.65rem",
                                            letterSpacing: "0.2em",
                                            textTransform: "uppercase",
                                            color: cat.accent,
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        {cat.items}
                                    </div>
                                    <h3
                                        className="font-serif"
                                        style={{
                                            fontSize: "1.75rem",
                                            fontWeight: 400,
                                            color: "var(--charcoal)",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        {cat.name}
                                    </h3>
                                    <p
                                        style={{
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: "0.85rem",
                                            color: "var(--warm-gray)",
                                            lineHeight: 1.7,
                                            marginBottom: "1.5rem",
                                        }}
                                    >
                                        {cat.description}
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: "0.75rem",
                                            letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            color: cat.accent,
                                            fontWeight: 500,
                                        }}
                                    >
                                        Shop Now
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Decorative circle */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-40px",
                                        right: "-40px",
                                        width: "160px",
                                        height: "160px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.2)",
                                        transition: "all 0.4s ease",
                                    }}
                                    className="cat-deco"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-hover);
        }
        .cat-card:hover .cat-deco {
          transform: scale(1.3);
          opacity: 0.6;
        }
        @media (max-width: 900px) {
          .cat-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </section>
    );
}
