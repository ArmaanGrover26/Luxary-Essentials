"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Package,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getCategoryLabel } from "@/config/categories";
import ProductCardImage from "@/components/ui/ProductCardImage";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface CarouselProduct {
  _id: string;
  name: string;
  description: string;
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
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          fill={i <= Math.round(rating || 5) ? "var(--gold)" : "none"}
          color={
            i <= Math.round(rating || 5) ? "var(--gold)" : "var(--beige)"
          }
        />
      ))}
    </span>
  );
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const hasDiscount = (p: CarouselProduct) => p.mrp != null && p.mrp > p.price;

// Number of cards visible per viewport width
function useVisibleCards(): number {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 480) setCount(1);
      else if (w < 768) setCount(2);
      else if (w < 1024) setCount(3);
      else setCount(4);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return count;
}

export default function NewArrivalsCarousel() {
  const router = useRouter();
  const [products, setProducts] = useState<CarouselProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const { addToCart, getItemCartQty, setCartNotification } = useCart();
  const visibleCards = useVisibleCards();

  useEffect(() => {
    let cancelled = false;
    async function fetchConfig() {
      try {
        const res = await fetch("/api/new-arrivals");
        const data = await res.json();
        if (!cancelled && data.success) {
          setIsEnabled(data.data.isEnabled);
          setProducts(data.data.products ?? []);
        }
      } catch {
        // silently fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCards);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  }, [maxIndex]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isEnabled || products.length <= visibleCards) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isEnabled, products.length, visibleCards, maxIndex]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  const handleAdd = (product: CarouselProduct) => {
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
      setTimeout(
        () =>
          setAddedIds((prev) => prev.filter((x) => x !== product._id)),
        1500
      );
    }
  };

  // Touch/Mouse drag handlers
  const onDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStart(clientX);
  };
  const onDragEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = dragStart - clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (loading || !isEnabled || products.length === 0) return null;

  const totalDots = maxIndex + 1;
  const cardWidthPct = 100 / visibleCards;

  return (
    <section
      style={{
        padding: "6rem 0",
        background: "var(--charcoal)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(ellipse, rgba(184,157,114,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              <Sparkles size={11} />
              Just Landed
            </div>
            <h2
              className="font-serif"
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 300,
                color: "var(--cream)",
                lineHeight: 1.1,
              }}
            >
              New Arrivals
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Arrow buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                aria-label="Previous"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background:
                    currentIndex === 0
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(184,157,114,0.2)",
                  color:
                    currentIndex === 0 ? "rgba(255,255,255,0.2)" : "var(--gold-light)",
                  cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex >= maxIndex}
                aria-label="Next"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.15)",
                  background:
                    currentIndex >= maxIndex
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(184,157,114,0.2)",
                  color:
                    currentIndex >= maxIndex
                      ? "rgba(255,255,255,0.2)"
                      : "var(--gold-light)",
                  cursor: currentIndex >= maxIndex ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Link
              href="/shop"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: "var(--gold-light)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(212,184,150,0.4)",
                paddingBottom: "2px",
                transition: "color 0.2s",
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Track */}
        <div
          style={{ overflow: "hidden", cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseUp={(e) => onDragEnd(e.clientX)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
              transform: `translateX(-${currentIndex * cardWidthPct}%)`,
              gap: "1.25rem",
              willChange: "transform",
            }}
          >
            {products.map((product) => {
              const disc = hasDiscount(product)
                ? Math.round(
                    ((product.mrp! - product.price) / product.mrp!) * 100
                  )
                : 0;
              return (
                <div
                  key={product._id}
                  className="new-arrival-card"
                  onClick={() => router.push(`/product/${product._id}`)}
                  style={{
                    minWidth: `calc(${cardWidthPct}% - ${(visibleCards - 1) * 1.25 / visibleCards}rem)`,
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    backdropFilter: "blur(8px)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  {/* Image */}
                  <Link
                    href={`/product/${product._id}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "1/1",
                        background: "rgba(255,255,255,0.06)",
                        overflow: "hidden",
                      }}
                    >
                      <ProductCardImage
                        images={product.images}
                        alt={product.name}
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />

                      {/* Favorite Button */}
                      <FavoriteButton productId={product._id} size="sm" style={{ top: "0.6rem", right: "0.6rem" }} />

                      {/* NEW badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          right: "2.85rem",
                          padding: "0.2rem 0.55rem",
                          background: "var(--gold)",
                          color: "var(--charcoal)",
                          fontSize: "0.58rem",
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          borderRadius: "4px",
                          pointerEvents: "none",
                        }}
                      >
                        New
                      </div>

                      {/* Discount badge */}
                      {disc > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.75rem",
                            left: "0.75rem",
                            padding: "0.2rem 0.55rem",
                            background: "#be123c",
                            color: "white",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            borderRadius: "4px",
                          }}
                        >
                          -{disc}%
                        </div>
                      )}

                      {/* Low stock */}
                      {product.stockStatus === "low_stock" && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: "0.75rem",
                            left: "0.75rem",
                            padding: "0.2rem 0.55rem",
                            background: "rgba(193,149,106,0.9)",
                            color: "white",
                            fontSize: "0.58rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            borderRadius: "4px",
                            fontWeight: 600,
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          Only a Few Left
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div
                    style={{
                      padding: "1.1rem",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      justifyContent: "space-between",
                      gap: "0.75rem",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.6rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          fontWeight: 600,
                        }}
                      >
                        {getCategoryLabel(product.category)}
                      </span>
                      <Link
                        href={`/product/${product._id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <h3
                          className="font-serif"
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 400,
                            color: "var(--cream)",
                            marginTop: "0.2rem",
                            marginBottom: "0.35rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {product.name}
                        </h3>
                      </Link>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <Stars rating={product.rating || 5} />
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          ({product.numReviews || 0})
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        paddingTop: "0.75rem",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {/* Price */}
                      <div style={{ marginBottom: "0.6rem" }}>
                        {hasDiscount(product) ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: "0.4rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              className="font-serif"
                              style={{
                                fontSize: "1.15rem",
                                fontWeight: 600,
                                color: "var(--cream)",
                              }}
                            >
                              {formatCurrency(product.price)}
                            </span>
                            <span
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.8rem",
                                color: "rgba(255,255,255,0.3)",
                                textDecoration: "line-through",
                              }}
                            >
                              {formatCurrency(product.mrp!)}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="font-serif"
                            style={{
                              fontSize: "1.15rem",
                              fontWeight: 600,
                              color: "var(--cream)",
                            }}
                          >
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAdd(product);
                        }}
                        disabled={
                          product.stockStatus === "out_of_stock" ||
                          (product.maxPurchasable ?? product.stock) <= 0 ||
                          getItemCartQty(product._id) >= (product.maxPurchasable ?? 10)
                        }
                        style={{
                          width: "100%",
                          fontSize: "0.72rem",
                          padding: "0.55rem 1rem",
                          borderRadius: "8px",
                          border: addedIds.includes(product._id)
                            ? "1px solid var(--gold)"
                            : "1px solid rgba(255,255,255,0.15)",
                          background: addedIds.includes(product._id)
                            ? "var(--gold)"
                            : getItemCartQty(product._id) >= (product.maxPurchasable ?? 10)
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(255,255,255,0.06)",
                          color: addedIds.includes(product._id)
                            ? "var(--charcoal)"
                            : "var(--cream)",
                          cursor:
                            product.stockStatus === "out_of_stock" ||
                            (product.maxPurchasable ?? product.stock) <= 0
                              ? "not-allowed"
                              : "pointer",
                          fontWeight: 500,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          opacity:
                            product.stockStatus === "out_of_stock" ||
                            (product.maxPurchasable ?? product.stock) <= 0
                              ? 0.4
                              : 1,
                          transition: "all 0.2s ease",
                          fontFamily: "'Jost', sans-serif",
                        }}
                      >
                        <ShoppingBag size={13} />
                        <span>
                          {product.stockStatus === "out_of_stock" ||
                          (product.maxPurchasable ?? product.stock) <= 0
                            ? "Out of Stock"
                            : addedIds.includes(product._id)
                            ? "Added ✓"
                            : getItemCartQty(product._id) >= (product.maxPurchasable ?? 10)
                            ? "Limit in Cart"
                            : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots */}
        {totalDots > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "2.5rem",
            }}
          >
            {Array.from({ length: totalDots }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === currentIndex ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  border: "none",
                  background:
                    i === currentIndex
                      ? "var(--gold)"
                      : "rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .new-arrival-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .new-arrival-card:hover .new-arrival-img {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
