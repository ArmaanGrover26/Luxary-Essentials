"use client";
import Link from "next/link";
import { useState } from "react";

const products = [
    {
        id: 1,
        name: "Ocean Resin Serving Tray",
        category: "Resin Art",
        price: 1499,
        originalPrice: 1999,
        badge: "Bestseller",
        rating: 4.9,
        reviews: 128,
        swatches: ["#7ea8b4", "#b89d72", "#c4a882"],
        description: "Hand-poured ocean-inspired resin art tray with gold leaf details.",
    },
    {
        id: 2,
        name: "Vanilla Amber Pillar Candle",
        category: "Candles",
        price: 649,
        originalPrice: null,
        badge: "New",
        rating: 4.8,
        reviews: 64,
        swatches: ["#d4b896", "#f0e4dc", "#2c2c2c"],
        description: "100% natural soy wax candle with warm vanilla and amber fragrance.",
    },
    {
        id: 3,
        name: "Premium Epoxy Resin Kit",
        category: "Raw Materials",
        price: 1299,
        originalPrice: 1599,
        badge: "Sale",
        rating: 4.7,
        reviews: 92,
        swatches: ["#e8d5cc", "#f0e4dc"],
        description: "Crystal-clear, low-yellowing epoxy resin — 500g kit for beginners.",
    },
    {
        id: 4,
        name: "Blush Rose Wax Melt Set",
        category: "Candles",
        price: 449,
        originalPrice: null,
        badge: null,
        rating: 4.9,
        reviews: 47,
        swatches: ["#f0e4dc", "#e8d5cc", "#b89d72"],
        description: "Set of 6 artisanal wax melts in delicate floral blends.",
    },
];

function Stars({ rating }: { rating: number }) {
    return (
        <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <svg
                    key={i}
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill={i <= Math.round(rating) ? "var(--gold)" : "var(--beige)"}
                    stroke="none"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </span>
    );
}

function ProductCard({ product }: { product: typeof products[0] }) {
    const [activeColor, setActiveColor] = useState(0);
    const [wished, setWished] = useState(false);

    return (
        <div className="product-card">
            {/* Image area */}
            <div
                style={{
                    position: "relative",
                    aspectRatio: "4/5",
                    overflow: "hidden",
                    background: "var(--blush)",
                }}
            >
                {/* Colored resin visual */}
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        background: `radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.6), ${product.swatches[activeColor]}55 50%, ${product.swatches[activeColor]}33)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.5s ease",
                    }}
                    className="card-img"
                >
                    <div
                        className="animate-float"
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "50%",
                            background: `radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.7), ${product.swatches[activeColor]}88)`,
                            boxShadow: `0 16px 40px ${product.swatches[activeColor]}44`,
                            border: "1px solid rgba(255,255,255,0.5)",
                        }}
                    />
                </div>

                {/* Badge */}
                {product.badge && (
                    <div
                        style={{
                            position: "absolute",
                            top: "1rem",
                            left: "1rem",
                            padding: "0.3rem 0.75rem",
                            background:
                                product.badge === "Sale"
                                    ? "var(--charcoal)"
                                    : product.badge === "New"
                                        ? "var(--gold)"
                                        : "var(--charcoal)",
                            color: "white",
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.65rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            borderRadius: "2px",
                        }}
                    >
                        {product.badge}
                    </div>
                )}

                {/* Wishlist */}
                <button
                    onClick={() => setWished(!wished)}
                    aria-label="Wishlist"
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(8px)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.3s ease",
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={wished ? "var(--gold)" : "none"}
                        stroke={wished ? "var(--gold)" : "var(--charcoal)"}
                        strokeWidth="1.5"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Quick add overlay */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "1rem",
                        background: "linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
                        opacity: 0,
                        transition: "opacity 0.35s ease",
                    }}
                    className="card-hover-overlay"
                >
                    <button className="btn-gold" style={{ width: "100%", borderRadius: "2px", padding: "0.7rem" }}>
                        Quick Add
                    </button>
                </div>
            </div>

            {/* Info */}
            <div style={{ padding: "1.25rem" }}>
                {/* Category */}
                <span
                    style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.65rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--gold)",
                    }}
                >
                    {product.category}
                </span>

                {/* Name */}
                <Link
                    href={`/product/${product.id}`}
                    style={{ textDecoration: "none" }}
                >
                    <h3
                        className="font-serif"
                        style={{
                            fontSize: "1.1rem",
                            fontWeight: 400,
                            color: "var(--charcoal)",
                            marginTop: "0.25rem",
                            marginBottom: "0.5rem",
                            lineHeight: 1.3,
                            transition: "color 0.3s",
                        }}
                    >
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Stars rating={product.rating} />
                    <span
                        style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.72rem",
                            color: "var(--light-gray)",
                        }}
                    >
                        ({product.reviews})
                    </span>
                </div>

                {/* Swatches */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "1rem" }}>
                    {product.swatches.map((c, i) => (
                        <button
                            key={i}
                            className={`swatch ${activeColor === i ? "active" : ""}`}
                            style={{ background: c }}
                            onClick={() => setActiveColor(i)}
                            aria-label={`Color ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Price + CTA */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <span
                            className="font-serif"
                            style={{
                                fontSize: "1.2rem",
                                fontWeight: 400,
                                color: "var(--charcoal)",
                            }}
                        >
                            ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                            <span
                                style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.8rem",
                                    color: "var(--light-gray)",
                                    textDecoration: "line-through",
                                    marginLeft: "0.5rem",
                                }}
                            >
                                ₹{product.originalPrice.toLocaleString()}
                            </span>
                        )}
                    </div>
                    <Link href={`/product/${product.id}`} className="btn-dark" style={{ padding: "0.6rem 1.1rem", fontSize: "0.72rem" }}>
                        View
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .product-card:hover .card-hover-overlay { opacity: 1 !important; }
      `}</style>
        </div>
    );
}

export default function FeaturedProducts() {
    return (
        <section style={{ background: "var(--cream)", padding: "7rem 2rem" }}>
            <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <span className="section-label animate-fade-up">Handpicked for You</span>
                    <h2
                        className="section-title animate-fade-up delay-100"
                        style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}
                    >
                        Featured Creations
                    </h2>
                    <hr
                        className="gold-divider animate-fade-up delay-200"
                        style={{ width: "60px", margin: "1.5rem auto 0" }}
                    />
                </div>

                {/* Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "1.75rem",
                    }}
                    className="products-grid"
                >
                    {products.map((p, i) => (
                        <div key={p.id} className={`animate-fade-up delay-${(i + 1) * 100}`}>
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
                    <Link href="/shop" className="btn-outline">
                        View All Products
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.75rem;
        }
        @media (max-width: 1024px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .products-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </section>
    );
}
