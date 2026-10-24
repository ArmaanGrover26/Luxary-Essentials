"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Package, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface HeroProduct {
  _id: string;
  name: string;
  price: number;
  mrp?: number | null;
  category: string;
  images: string[];
  stock: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  inStock?: boolean;
  maxPurchasable?: number;
  rating: number;
  numReviews: number;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={10}
          fill={i <= Math.round(rating || 5) ? "var(--gold)" : "none"}
          color={i <= Math.round(rating || 5) ? "var(--gold)" : "rgba(255,255,255,0.2)"}
        />
      ))}
    </span>
  );
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export default function HeroSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Parallax mouse-track
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  // ── New Arrivals state ────────────────────────────────────────────────────
  const [products, setProducts] = useState<HeroProduct[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const { addToCart, getItemCartQty, setCartNotification } = useCart();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/new-arrivals")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setIsEnabled(data.data.isEnabled);
        setProducts(data.data.products ?? []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const total = products.length;

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning || total === 0) return;
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((idx + total) % total);
        setTransitioning(false);
      }, 220);
    },
    [total, transitioning]
  );

  // Auto-advance
  useEffect(() => {
    if (!isEnabled || total <= 1) return;
    const t = setInterval(() => goTo(currentIdx + 1), 4000);
    return () => clearInterval(t);
  }, [isEnabled, total, currentIdx, goTo]);

  const handleAdd = (product: HeroProduct) => {
    const currentInCart = getItemCartQty(product._id);
    const maxAllowed = typeof product.maxPurchasable === "number"
      ? product.maxPurchasable
      : (product.inStock === false ? 0 : 10);

    if (maxAllowed <= 0 || currentInCart >= maxAllowed) {
      setCartNotification("You've reached the available quantity for this item.");
      return;
    }

    const res = addToCart(
      {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.images[0] || "",
        maxPurchasable: product.maxPurchasable,
        inStock: product.inStock,
        stockStatus: product.stockStatus,
      },
      1
    );

    if (res.success) {
      setAddedIds((prev) => [...prev, product._id]);
      setTimeout(() => setAddedIds((prev) => prev.filter((x) => x !== product._id)), 1500);
    }
  };

  const current = products[currentIdx];
  const disc =
    current && current.mrp && current.mrp > current.price
      ? Math.round(((current.mrp - current.price) / current.mrp) * 100)
      : 0;

  const showCarousel = isEnabled && total > 0;

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "var(--ivory)",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "55%",
          height: "110%",
          background: "radial-gradient(ellipse at center, var(--blush) 0%, var(--ivory) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "5%",
          width: "30%",
          height: "60%",
          background: "radial-gradient(ellipse at center, rgba(212,184,150,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="hero-grid"
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "6rem 2rem",
          width: "100%",
        }}
      >
        {/* ── LEFT: Text content ──────────────────────────────────────────── */}
        <div>
          <div className="animate-fade-up">
            <span className="section-label">New Collection 2026</span>
          </div>
          <h1
            className="font-serif animate-fade-up delay-100"
            style={{
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              color: "var(--charcoal)",
              marginBottom: "1.5rem",
            }}
          >
            Crafted
            <br />
            <em style={{ color: "var(--gold)", fontStyle: "italic" }}>with</em>
            <br />
            Elegance
          </h1>
          <p
            className="animate-fade-up delay-200"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              color: "var(--warm-gray)",
              lineHeight: 1.85,
              maxWidth: "380px",
              marginBottom: "2.5rem",
              fontWeight: 300,
            }}
          >
            Discover handcrafted resin art, artisanal candles, and premium craft
            supplies — designed for those who find beauty in the details.
          </p>

          <div
            className="animate-fade-up delay-300"
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
            <Link href="/shop" className="btn-gold">
              Shop Collection
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/about" className="btn-outline">
              Our Story
            </Link>
          </div>

          {/* Stats */}
          <div
            className="animate-fade-up delay-400"
            style={{
              display: "flex",
              gap: "3rem",
              marginTop: "4rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--beige)",
            }}
          >
            {[
              { num: "2k+", label: "Happy Customers" },
              { num: "150+", label: "Unique Products" },
              { num: "4.9★", label: "Avg. Rating" },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="font-serif"
                  style={{ fontSize: "1.75rem", fontWeight: 400, color: "var(--charcoal)" }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.72rem",
                    color: "var(--light-gray)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginTop: "4px",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: New Arrivals card / fallback decoration ─────────────── */}
        <div
          className="animate-scale-in delay-200"
          style={{ position: "relative" }}
        >
          {showCarousel && current ? (
            /* ──── Dynamic product card carousel ──── */
            <div style={{ position: "relative" }}>
              {/* Label tag (top-right) */}
              <div
                className="hero-visual animate-slide-left delay-400"
                style={{
                  position: "absolute",
                  top: "1.75rem",
                  right: "-1.5rem",
                  background: "var(--charcoal)",
                  color: "var(--gold-light)",
                  padding: "0.85rem 1.1rem",
                  borderRadius: "4px",
                  textAlign: "center",
                  boxShadow: "var(--shadow-card)",
                  zIndex: 10,
                }}
              >
                <div className="font-serif" style={{ fontSize: "1.35rem", fontWeight: 300 }}>
                  New
                </div>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.55rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  Arrivals
                </div>
              </div>

              {/* Product card */}
              <div
                onClick={() => router.push(`/product/${current._id}`)}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.14)",
                  background: "var(--white)",
                  border: "1px solid var(--beige)",
                  cursor: "pointer",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "4/3",
                    background: "var(--ivory)",
                    overflow: "hidden",
                  }}
                >
                  <Link
                    href={`/product/${current._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: transitioning ? 0 : 1,
                        transition: "opacity 0.22s ease",
                      }}
                    >
                      {current.images?.[0] ? (
                        <Image
                          src={current.images[0]}
                          alt={current.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 540px"
                          style={{ objectFit: "cover" }}
                          priority
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--beige)",
                          }}
                        >
                          <Package size={48} />
                        </div>
                      )}
                    </div>

                    {/* Discount badge */}
                    {disc > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          padding: "0.25rem 0.6rem",
                          background: "#be123c",
                          color: "white",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          borderRadius: "4px",
                          zIndex: 4,
                          pointerEvents: "none",
                        }}
                      >
                        -{disc}%
                      </div>
                    )}

                    {/* Low stock */}
                    {current.stock <= 5 && current.stock > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0.75rem",
                          left: "0.75rem",
                          padding: "0.25rem 0.6rem",
                          background: "rgba(193,149,106,0.92)",
                          color: "white",
                          fontSize: "0.6rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          borderRadius: "4px",
                          fontWeight: 600,
                          zIndex: 4,
                          pointerEvents: "none",
                        }}
                      >
                        Only a Few Left
                      </div>
                    )}
                  </Link>

                  {/* Favorite Button */}
                  <FavoriteButton productId={current._id} size="sm" style={{ top: "0.75rem", right: "0.75rem", zIndex: 12 }} />

                  {/* Nav arrows overlay - outside Link */}
                  {total > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goTo(currentIdx - 1);
                        }}
                        aria-label="Previous product"
                        style={{
                          position: "absolute",
                          left: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(6px)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                          zIndex: 5,
                          transition: "all 0.18s ease",
                        }}
                        className="hero-arrow-btn"
                      >
                        <ChevronLeft size={16} color="#2c2c2c" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          goTo(currentIdx + 1);
                        }}
                        aria-label="Next product"
                        style={{
                          position: "absolute",
                          right: "0.75rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(6px)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                          zIndex: 5,
                          transition: "all 0.18s ease",
                        }}
                        className="hero-arrow-btn"
                      >
                        <ChevronRight size={16} color="#2c2c2c" />
                      </button>
                    </>
                  )}
                </div>

                {/* Card body */}
                <div
                  style={{
                    padding: "1.25rem 1.5rem 1.5rem",
                    opacity: transitioning ? 0 : 1,
                    transition: "opacity 0.22s ease",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--gold)",
                      fontWeight: 600,
                      marginBottom: "0.3rem",
                    }}
                  >
                    New Arrival
                  </div>

                  <Link
                    href={`/product/${current._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <h3
                      className="font-serif"
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 400,
                        color: "var(--charcoal)",
                        lineHeight: 1.2,
                        marginBottom: "0.4rem",
                      }}
                    >
                      {current.name}
                    </h3>
                  </Link>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.85rem" }}>
                    <Stars rating={current.rating || 5} />
                    <span style={{ fontSize: "0.68rem", color: "var(--light-gray)", fontFamily: "'Jost', sans-serif" }}>
                      ({current.numReviews || 0})
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Price */}
                    <div>
                      {disc > 0 ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                          <span
                            className="font-serif"
                            style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--charcoal)" }}
                          >
                            {fmt(current.price)}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: "0.82rem",
                              color: "var(--light-gray)",
                              textDecoration: "line-through",
                            }}
                          >
                            {fmt(current.mrp!)}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="font-serif"
                          style={{ fontSize: "1.4rem", fontWeight: 600, color: "var(--charcoal)" }}
                        >
                          {fmt(current.price)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAdd(current);
                      }}
                      disabled={
                        current.stockStatus === "out_of_stock" ||
                        (current.maxPurchasable ?? current.stock) <= 0 ||
                        getItemCartQty(current._id) >= (current.maxPurchasable ?? 10)
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "0.6rem 1.1rem",
                        borderRadius: "6px",
                        border: "none",
                        background: addedIds.includes(current._id)
                          ? "var(--gold)"
                          : getItemCartQty(current._id) >= (current.maxPurchasable ?? 10)
                          ? "rgba(44, 44, 44, 0.7)"
                          : "var(--charcoal)",
                        color: "white",
                        fontSize: "0.72rem",
                        fontWeight: 500,
                        cursor:
                          current.stockStatus === "out_of_stock" ||
                          (current.maxPurchasable ?? current.stock) <= 0
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          current.stockStatus === "out_of_stock" ||
                          (current.maxPurchasable ?? current.stock) <= 0
                            ? 0.5
                            : 1,
                        transition: "all 0.2s ease",
                        whiteSpace: "nowrap",
                        fontFamily: "'Jost', sans-serif",
                      }}
                    >
                      <ShoppingBag size={13} />
                      {current.stockStatus === "out_of_stock" ||
                      (current.maxPurchasable ?? current.stock) <= 0
                        ? "Out of Stock"
                        : addedIds.includes(current._id)
                        ? "Added ✓"
                        : getItemCartQty(current._id) >= (current.maxPurchasable ?? 10)
                        ? "Limit in Cart"
                        : "Add to Cart"}
                    </button>
                  </div>

                  {/* Dot indicators */}
                  {total > 1 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        marginTop: "1rem",
                        paddingTop: "0.85rem",
                        borderTop: "1px solid var(--beige)",
                        justifyContent: "center",
                      }}
                    >
                      {products.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goTo(i);
                          }}
                          aria-label={`Go to product ${i + 1}`}
                          style={{
                            width: i === currentIdx ? "22px" : "7px",
                            height: "7px",
                            borderRadius: "4px",
                            border: "none",
                            background: i === currentIdx ? "var(--gold)" : "var(--beige)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            padding: 0,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Counter badge (bottom-left) */}
              {total > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-1rem",
                    left: "1.5rem",
                    background: "var(--gold)",
                    color: "var(--charcoal)",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "20px",
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    boxShadow: "0 4px 16px rgba(184,157,114,0.35)",
                  }}
                >
                  {currentIdx + 1} / {total}
                </div>
              )}
            </div>
          ) : (
            /* ──── Fallback: original decorative design ──── */
            <div>
              <div
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.12)",
                  aspectRatio: "4/5",
                  background: "var(--beige)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, var(--blush) 0%, var(--beige) 40%, var(--rose) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    className="animate-float"
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "50%",
                      background: "radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.7), rgba(212,184,150,0.4) 50%, rgba(232,213,204,0.6))",
                      boxShadow: "inset -8px -8px 24px rgba(139,115,85,0.2), 0 16px 48px rgba(184,157,114,0.25)",
                      border: "1px solid rgba(255,255,255,0.6)",
                    }}
                  />
                  <div
                    style={{
                      width: "120px",
                      height: "60px",
                      borderRadius: "30px",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(212,184,150,0.3))",
                      boxShadow: "0 8px 24px rgba(184,157,114,0.2)",
                      border: "1px solid rgba(255,255,255,0.5)",
                    }}
                  />
                </div>
              </div>

              {/* Floating New/Arrivals tag */}
              <div
                className="hero-visual animate-slide-left delay-400"
                style={{
                  position: "absolute",
                  top: "2rem",
                  right: "-2rem",
                  background: "var(--charcoal)",
                  color: "var(--gold-light)",
                  padding: "1rem 1.25rem",
                  borderRadius: "4px",
                  textAlign: "center",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 300 }}>New</div>
                <div
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    opacity: 0.7,
                  }}
                >
                  Arrivals
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="hero-visual"
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--light-gray)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(180deg, var(--gold), transparent)",
            animation: "float 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        .hero-arrow-btn:hover {
          background: rgba(255,255,255,1) !important;
          transform: translateY(-50%) scale(1.1);
        }
      `}</style>
    </section>
  );
}
