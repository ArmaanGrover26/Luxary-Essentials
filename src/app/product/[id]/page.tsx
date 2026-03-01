"use client";
import { useState } from "react";
import Link from "next/link";

const product = {
    id: 1,
    name: "Ocean Resin Serving Tray",
    category: "Resin Art",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviews: 128,
    stock: 8,
    sku: "LE-RSN-001",
    description:
        "A breathtaking hand-poured ocean-inspired resin art tray featuring real gold leaf, deep-sea pigments, and a glossy finish. Each piece is entirely unique — no two are alike. Perfect as a decorative tray or a centrepiece.",
    details: [
        "100% food-safe, non-toxic epoxy resin",
        "Dimensions: 30cm × 20cm × 2cm",
        "Weight: 450g",
        "Gold leaf accents — genuine 24K",
        "UV-resistant finish — won't yellow",
        "Handcrafted in India",
    ],
    swatches: [
        { name: "Deep Ocean", color: "#5b8fa8" },
        { name: "Sunset Coral", color: "#c4826a" },
        { name: "Champagne Gold", color: "#c4a882" },
    ],
    sizes: ["Small 20×14cm", "Medium 30×20cm", "Large 40×28cm"],
    images: [
        { bg: "linear-gradient(135deg,#c8dde8,#7ea8b4,#5b8fa8)", label: "Ocean Blue" },
        { bg: "linear-gradient(135deg,#f0e4dc,#e8d5cc,#d4b896)", label: "Warm Ivory" },
        { bg: "linear-gradient(135deg,#e8d5cc,#c4826a,#a05a3c)", label: "Sunset" },
    ],
    testimonials: [
        { name: "Priya S.", rating: 5, text: "Absolutely stunning — exceeded all expectations!", date: "Jan 2026" },
        { name: "Meena K.", rating: 5, text: "The quality is unreal. Looks so premium in person.", date: "Feb 2026" },
        { name: "Aarti J.", rating: 4, text: "Beautiful piece, fast shipping. Will buy again.", date: "Feb 2026" },
    ],
    ratingBreakdown: [
        { stars: 5, pct: 78 },
        { stars: 4, pct: 14 },
        { stars: 3, pct: 5 },
        { stars: 2, pct: 2 },
        { stars: 1, pct: 1 },
    ],
};

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span style={{ display: "inline-flex", gap: "2px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "var(--gold)" : "var(--beige)"}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </span>
    );
}

export default function ProductPage() {
    const [activeImg, setActiveImg] = useState(0);
    const [activeSwatch, setActiveSwatch] = useState(0);
    const [activeSize, setActiveSize] = useState(1);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState<"details" | "reviews">("details");
    const [addedToCart, setAddedToCart] = useState(false);

    const handleAddToCart = () => {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    return (
        <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
            {/* Breadcrumb */}
            <div style={{ background: "var(--white)", borderBottom: "1px solid var(--beige)", padding: "1rem 2rem" }}>
                <div style={{ maxWidth: "1320px", margin: "0 auto" }} className="breadcrumb">
                    <Link href="/">Home</Link>
                    {" / "}
                    <Link href="/shop">Shop</Link>
                    {" / "}
                    <Link href="/shop?cat=resin">Resin Art</Link>
                    {" / "}
                    <span>{product.name}</span>
                </div>
            </div>

            {/* Main product section */}
            <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "4rem 2rem" }}>
                <div className="product-layout">
                    {/* ── Left: Images ── */}
                    <div>
                        {/* Main image */}
                        <div
                            style={{
                                borderRadius: "8px",
                                overflow: "hidden",
                                background: product.images[activeImg].bg,
                                aspectRatio: "4/5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "var(--shadow-card)",
                                marginBottom: "1rem",
                                position: "relative",
                                transition: "all 0.4s ease",
                            }}
                        >
                            <div
                                className="animate-float"
                                style={{
                                    width: "160px",
                                    height: "160px",
                                    borderRadius: "50%",
                                    background: "rgba(255,255,255,0.35)",
                                    boxShadow: "inset -8px -8px 24px rgba(0,0,0,0.08), 0 16px 48px rgba(184,157,114,0.2)",
                                    border: "1px solid rgba(255,255,255,0.6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backdropFilter: "blur(4px)",
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: "0.85rem",
                                        textAlign: "center",
                                        color: "rgba(44,44,44,0.7)",
                                        padding: "0.5rem",
                                        fontStyle: "italic",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {product.images[activeImg].label}
                                    <br />
                                    Resin Tray
                                </div>
                            </div>

                            {/* Zoom hint */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "1rem",
                                    right: "1rem",
                                    background: "rgba(255,255,255,0.75)",
                                    backdropFilter: "blur(8px)",
                                    borderRadius: "4px",
                                    padding: "0.4rem 0.75rem",
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.65rem",
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: "var(--warm-gray)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                                Hover to zoom
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    style={{
                                        flex: 1,
                                        aspectRatio: "1",
                                        borderRadius: "4px",
                                        background: img.bg,
                                        border: activeImg === i ? "2px solid var(--gold)" : "2px solid transparent",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        overflow: "hidden",
                                    }}
                                    aria-label={img.label}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Info ── */}
                    <div>
                        {/* Category & SKU */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                            <span className="section-label" style={{ margin: 0 }}>{product.category}</span>
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--light-gray)" }}>
                                SKU: {product.sku}
                            </span>
                        </div>

                        {/* Name */}
                        <h1
                            className="font-serif"
                            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "var(--charcoal)", lineHeight: 1.15, marginBottom: "1rem" }}
                        >
                            {product.name}
                        </h1>

                        {/* Rating row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <Stars rating={product.rating} />
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--gold)", fontWeight: 500 }}>
                                {product.rating}
                            </span>
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--light-gray)" }}>
                                ({product.reviews} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                            <span className="font-serif" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--charcoal)" }}>
                                ₹{product.price.toLocaleString()}
                            </span>
                            {product.originalPrice && (
                                <>
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "1rem", color: "var(--light-gray)", textDecoration: "line-through" }}>
                                        ₹{product.originalPrice.toLocaleString()}
                                    </span>
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "#6b9e7a", fontWeight: 500, background: "#edf7f0", padding: "0.2rem 0.6rem", borderRadius: "2px" }}>
                                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <hr className="gold-divider" style={{ marginBottom: "2rem" }} />

                        {/* Color swatches */}
                        <div style={{ marginBottom: "1.75rem" }}>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--charcoal)", marginBottom: "0.75rem" }}>
                                Color — <span style={{ color: "var(--gold)" }}>{product.swatches[activeSwatch].name}</span>
                            </div>
                            <div style={{ display: "flex", gap: "0.75rem" }}>
                                {product.swatches.map((sw, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setActiveSwatch(i); setActiveImg(i < product.images.length ? i : 0); }}
                                        className={`swatch ${activeSwatch === i ? "active" : ""}`}
                                        style={{ width: "32px", height: "32px", background: sw.color }}
                                        title={sw.name}
                                        aria-label={sw.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div style={{ marginBottom: "1.75rem" }}>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--charcoal)", marginBottom: "0.75rem" }}>
                                Size
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {product.sizes.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveSize(i)}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: "0.75rem",
                                            letterSpacing: "0.06em",
                                            border: `1px solid ${activeSize === i ? "var(--gold)" : "var(--beige)"}`,
                                            background: activeSize === i ? "var(--gold)" : "transparent",
                                            color: activeSize === i ? "white" : "var(--charcoal)",
                                            borderRadius: "2px",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stock indicator */}
                        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: product.stock > 5 ? "#6b9e7a" : "#c1956a" }} />
                            <span className={product.stock > 5 ? "in-stock" : "low-stock"}>
                                {product.stock > 5 ? "In Stock" : `Only ${product.stock} left`}
                            </span>
                        </div>

                        {/* Qty + Add to cart */}
                        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid var(--beige)", borderRadius: "2px", padding: "0 0.5rem" }}>
                                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} style={{ border: "none" }}>−</button>
                                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", minWidth: "28px", textAlign: "center", color: "var(--charcoal)" }}>
                                    {qty}
                                </span>
                                <button className="qty-btn" onClick={() => setQty(qty + 1)} style={{ border: "none" }}>+</button>
                            </div>
                            <button
                                className="btn-gold"
                                style={{ flex: 1, minWidth: "200px", justifyContent: "center" }}
                                onClick={handleAddToCart}
                            >
                                {addedToCart ? (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                            <line x1="3" y1="6" x2="21" y2="6" />
                                            <path d="M16 10a4 4 0 0 1-8 0" />
                                        </svg>
                                        Add to Cart
                                    </>
                                )}
                            </button>
                        </div>

                        <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            Add to Wishlist
                        </button>

                        <hr className="gold-divider" style={{ margin: "2rem 0" }} />

                        {/* Trust mini-icons */}
                        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                            {[
                                { icon: "🚚", text: "Free shipping above ₹999" },
                                { icon: "🔄", text: "Easy 7-day returns" },
                                { icon: "✨", text: "Handcrafted with care" },
                            ].map((t) => (
                                <div key={t.text} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{ fontSize: "1rem" }}>{t.icon}</span>
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--warm-gray)" }}>
                                        {t.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tabs: Details / Reviews ── */}
                <div style={{ marginTop: "5rem" }}>
                    <div style={{ display: "flex", gap: "2.5rem", borderBottom: "1px solid var(--beige)", marginBottom: "3rem" }}>
                        {(["details", "reviews"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                            >
                                {tab === "details" ? "Product Details" : `Reviews (${product.reviews})`}
                            </button>
                        ))}
                    </div>

                    {activeTab === "details" && (
                        <div className="tab-grid">
                            <div>
                                <h3 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 400, marginBottom: "1rem", color: "var(--charcoal)" }}>
                                    Crafted to Perfection
                                </h3>
                                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "var(--warm-gray)", lineHeight: 1.85, marginBottom: "1.5rem" }}>
                                    {product.description}
                                </p>
                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                    {product.details.map((d) => (
                                        <li key={d} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--warm-gray)" }}>
                                            <span style={{ color: "var(--gold)", marginTop: "2px", flexShrink: 0 }}>✦</span>
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div
                                style={{
                                    background: "var(--ivory)",
                                    borderRadius: "8px",
                                    padding: "2.5rem",
                                    border: "1px solid var(--beige)",
                                }}
                            >
                                <h4 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1.5rem" }}>
                                    Care Instructions
                                </h4>
                                {[
                                    "Wipe clean with a damp cloth",
                                    "Avoid prolonged direct sunlight",
                                    "Do not soak in water",
                                    "Not dishwasher safe",
                                    "Store flat to prevent warping",
                                ].map((c) => (
                                    <div key={c} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--warm-gray)" }}>
                                        <span style={{ color: "var(--gold)" }}>•</span>
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="tab-grid">
                            {/* Rating breakdown */}
                            <div>
                                <div style={{ display: "flex", gap: "2rem", alignItems: "flex-end", marginBottom: "2rem" }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div className="font-serif" style={{ fontSize: "4rem", fontWeight: 300, color: "var(--charcoal)", lineHeight: 1 }}>
                                            {product.rating}
                                        </div>
                                        <Stars rating={product.rating} />
                                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)", marginTop: "0.5rem" }}>
                                            {product.reviews} reviews
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {product.ratingBreakdown.map((r) => (
                                            <div key={r.stars} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--warm-gray)", width: "40px" }}>
                                                    {r.stars}★
                                                </span>
                                                <div className="rating-bar-bg" style={{ flex: 1 }}>
                                                    <div className="rating-bar-fill" style={{ width: `${r.pct}%` }} />
                                                </div>
                                                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)", width: "30px" }}>
                                                    {r.pct}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Review cards */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    {product.testimonials.map((t) => (
                                        <div
                                            key={t.name}
                                            style={{
                                                background: "var(--white)",
                                                borderRadius: "6px",
                                                padding: "1.5rem",
                                                boxShadow: "var(--shadow-soft)",
                                                border: "1px solid var(--beige)",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem" }}>
                                                        {t.name[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 500, color: "var(--charcoal)" }}>{t.name}</div>
                                                        <Stars rating={t.rating} size={11} />
                                                    </div>
                                                </div>
                                                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--light-gray)" }}>{t.date}</span>
                                            </div>
                                            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--warm-gray)", lineHeight: 1.7 }}>
                                                {t.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Write a review */}
                            <div>
                                <h4 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "2rem" }}>
                                    Write a Review
                                </h4>
                                <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
                                    <div>
                                        <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--warm-gray)", display: "block", marginBottom: "0.5rem" }}>Your Rating</label>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button key={s} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--beige)" stroke="var(--gold)" strokeWidth="1">
                                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--warm-gray)", display: "block", marginBottom: "0.5rem" }}>Name</label>
                                        <input className="input-luxury" type="text" placeholder="Your name" />
                                    </div>
                                    <div>
                                        <label style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--warm-gray)", display: "block", marginBottom: "0.5rem" }}>Review</label>
                                        <textarea
                                            className="input-luxury"
                                            placeholder="Share your experience..."
                                            rows={4}
                                            style={{ resize: "vertical" }}
                                        />
                                    </div>
                                    <button type="submit" className="btn-gold">Submit Review</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: start;
        }
        .tab-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }
        @media (max-width: 900px) {
          .product-layout { grid-template-columns: 1fr; gap: 3rem; }
          .tab-grid { grid-template-columns: 1fr; gap: 2.5rem; }
        }
      `}</style>
        </div>
    );
}
