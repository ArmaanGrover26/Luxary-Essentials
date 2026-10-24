"use client";

import { useEffect, useState, useCallback, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Star, Package, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { ORDERED_CATEGORIES, getCategoryLabel } from "@/config/categories";
import ProductCardImage from "@/components/ui/ProductCardImage";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface DBProduct {
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

interface ActiveFestival {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerText?: string;
  badgeText?: string;
  isActive: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          fill={i <= Math.round(rating || 5) ? "var(--gold)" : "none"}
          color={i <= Math.round(rating || 5) ? "var(--gold)" : "var(--beige)"}
        />
      ))}
    </span>
  );
}

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeFestival, setActiveFestival] = useState<ActiveFestival | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const { addToCart, getItemCartQty, setCartNotification } = useCart();

  // Load active festival (if any)
  useEffect(() => {
    async function fetchActiveFestival() {
      try {
        const res = await fetch("/api/festivals/active");
        const data = await res.json();
        if (data.success && data.data && data.data.isActive) {
          setActiveFestival(data.data);
        } else {
          setActiveFestival(null);
        }
      } catch (err) {
        console.error("Failed to load active festival", err);
        setActiveFestival(null);
      }
    }
    fetchActiveFestival();
  }, []);

  // Sync category with URL search parameters (?category= or ?cat=)
  useEffect(() => {
    const cat = searchParams.get("category") || searchParams.get("cat");
    if (cat) {
      if (
        cat === "festival-special" ||
        cat.startsWith("festival") ||
        (activeFestival && cat === activeFestival.slug)
      ) {
        setActiveCategory("festival-special");
      } else {
        setActiveCategory(cat);
      }
    }
  }, [searchParams, activeFestival]);

  // Dynamic categories state initialized with static list for instant render
  const [dynamicCategories, setDynamicCategories] = useState<{ label: string; value: string }[]>(
    ORDERED_CATEGORIES.map((c) => ({ label: c.label, value: c.value }))
  );

  // Fetch dynamic categories from database
  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDynamicCategories(
            data.data.map((c: { name: string; slug: string }) => ({
              label: c.name,
              value: c.slug,
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to load dynamic categories", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Category horizontal scroll controls
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, dynamicCategories]);

  const handleScroll = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const amount = direction === "left" ? -280 : 280;
      tabsRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (tabsRef.current && e.deltaY !== 0) {
      tabsRef.current.scrollLeft += e.deltaY;
    }
  };

  // Construct dynamic category tabs (integrates active festival tab if active)
  const tabs = useMemo(() => {
    const list: { label: string; value: string; isFestival?: boolean; badge?: string }[] = [
      { label: "All Products", value: "" },
    ];

    if (activeFestival && activeFestival.isActive) {
      list.push({
        label: `✨ ${activeFestival.name}`,
        value: "festival-special",
        isFestival: true,
        badge: activeFestival.badgeText || "Festival Special",
      });
    }

    dynamicCategories.forEach((c) => {
      list.push({ label: c.label, value: c.value, isFestival: false });
    });

    return list;
  }, [activeFestival, dynamicCategories]);

  // Fetch products based on active category
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("limit", "100");
      query.set("sort", "createdAt");
      query.set("order", "desc");
      if (activeCategory) query.set("category", activeCategory);

      const res = await fetch(`/api/products?${query.toString()}`);
      const data = await res.json();
      if (data.success && data.data?.products) {
        setProducts(data.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load shop products", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (p: DBProduct) => {
    const currentInCart = getItemCartQty(p._id);
    const maxAllowed = typeof p.maxPurchasable === "number"
      ? p.maxPurchasable
      : (p.inStock === false ? 0 : 10);

    if (maxAllowed <= 0 || currentInCart >= maxAllowed) {
      setCartNotification("You've reached the available quantity for this item.");
      return;
    }

    const result = addToCart(
      {
        id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        image: p.images[0] || "",
        maxPurchasable: p.maxPurchasable,
        inStock: p.inStock,
        stockStatus: p.stockStatus,
      },
      1
    );

    if (result.success) {
      setAddedIds((prev) => [...prev, p._id]);
      setTimeout(
        () => setAddedIds((prev) => prev.filter((x) => x !== p._id)),
        1500
      );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const hasDiscount = (p: DBProduct) =>
    p.mrp != null && p.mrp > p.price;

  const discountPct = (p: DBProduct) => {
    if (!hasDiscount(p)) return 0;
    return Math.round(((p.mrp! - p.price) / p.mrp!) * 100);
  };

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Page Header */}
      <section
        style={{
          background: "var(--charcoal)",
          padding: "4.5rem 1.5rem 3.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>
            Curated Collection
          </span>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              fontWeight: 300,
              color: "var(--ivory)",
              marginTop: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Shop Luxury Essentials
          </h1>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.95rem",
              color: "rgba(245,240,232,0.7)",
              lineHeight: 1.8,
              maxWidth: "520px",
              margin: "0 auto 1.5rem",
            }}
          >
            Explore handcrafted resin creations, artisanal candles, and premium raw materials.
          </p>
          <hr
            className="gold-divider"
            style={{ width: "60px", margin: "0 auto" }}
          />
        </div>
      </section>

      {/* Category Tabs */}
      <div
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--beige)",
          position: "sticky",
          top: "72px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              aria-label="Scroll left"
              style={{
                position: "absolute",
                left: "8px",
                zIndex: 12,
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid var(--beige)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--charcoal)",
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            ref={tabsRef}
            onWheel={handleWheel}
            className="shop-category-tabs-scroll"
            style={{
              flex: 1,
              maxWidth: "1320px",
              padding: "0 1.5rem",
              display: "flex",
              gap: 0,
              overflowX: "auto",
            }}
          >
          {tabs.map((tab) => {
            const isCurrent = activeCategory === tab.value;
            const isFest = tab.isFestival;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: isFest ? "0.6rem 1.15rem" : "1.1rem 1.25rem",
                  margin: isFest ? "auto 0.4rem" : "0",
                  borderRadius: isFest ? "20px" : "0",
                  background: isFest
                    ? isCurrent
                      ? "var(--charcoal)"
                      : "rgba(184, 157, 114, 0.15)"
                    : "none",
                  border: isFest
                    ? `1px solid ${isCurrent ? "var(--gold)" : "rgba(184, 157, 114, 0.4)"}`
                    : "none",
                  borderBottom: !isFest
                    ? isCurrent
                      ? "2px solid var(--gold)"
                      : "2px solid transparent"
                    : isCurrent
                      ? "1px solid var(--gold)"
                      : "1px solid rgba(184, 157, 114, 0.4)",
                  color: isFest
                    ? isCurrent
                      ? "var(--gold)"
                      : "var(--charcoal)"
                    : isCurrent
                      ? "var(--charcoal)"
                      : "var(--warm-gray)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  fontWeight: isCurrent || isFest ? 600 : 400,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
          </div>

          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              aria-label="Scroll right"
              style={{
                position: "absolute",
                right: "8px",
                zIndex: 12,
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                border: "1px solid var(--beige)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--charcoal)",
              }}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Product Grid Section */}
      <section className="shop-products-section" style={{ padding: "3.5rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          {/* Active Festival Special Highlight Banner */}
          {activeCategory === "festival-special" && activeFestival && (
            <div
              style={{
                background: "linear-gradient(135deg, #1f1f1f 0%, #2c2c2c 100%)",
                border: "1px solid var(--gold)",
                borderRadius: "14px",
                padding: "1.75rem 1.5rem",
                marginBottom: "2rem",
                color: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Sparkles size={16} color="var(--gold)" />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    fontWeight: 700,
                  }}
                >
                  {activeFestival.badgeText || "Festival Specials Collection"}
                </span>
              </div>
              <h2
                className="font-serif"
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)",
                  fontWeight: 400,
                  color: "var(--ivory)",
                  margin: "0 0 0.5rem",
                  letterSpacing: "0.02em",
                }}
              >
                {activeFestival.name}
              </h2>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.88rem",
                  color: "rgba(245,240,232,0.85)",
                  maxWidth: "700px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {activeFestival.bannerText ||
                  activeFestival.description ||
                  "Explore handcrafted festive creations, limited-edition sets, and curated gift essentials."}
              </p>
            </div>
          )}
          <p
            className="shop-count-text"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.8rem",
              color: "var(--warm-gray)",
              letterSpacing: "0.06em",
              marginBottom: "2rem",
            }}
          >
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>

          {loading ? (
            <div className="shop-product-grid">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="product-card-skeleton"
                  style={{
                    height: "360px",
                    background: "var(--white)",
                    borderRadius: "12px",
                    border: "1px solid var(--beige)",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="shop-product-grid">
              {products.map((p) => {
                const disc = discountPct(p);
                return (
                  <div
                    key={p._id}
                    className="product-card"
                    onClick={() => router.push(`/product/${p._id}`)}
                    style={{
                      background: "var(--white)",
                      borderRadius: "12px",
                      border: "1px solid var(--beige)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.3s ease",
                      boxShadow: "var(--shadow-card)",
                      cursor: "pointer",
                    }}
                  >
                    {/* Image Container */}
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "1/1",
                        background: "var(--ivory)",
                        overflow: "hidden",
                      }}
                    >
                      <Link
                        href={`/product/${p._id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
                      >
                        <ProductCardImage
                          images={p.images}
                          alt={p.name}
                          sizes="(max-width: 560px) 50vw, (max-width: 768px) 50vw, 300px"
                        />
                      </Link>

                      {/* Discount badge */}
                      {disc > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.6rem",
                            left: "0.6rem",
                            padding: "0.2rem 0.5rem",
                            background: "#be123c",
                            color: "white",
                            fontSize: "0.6rem",
                            letterSpacing: "0.06em",
                            fontWeight: 700,
                            borderRadius: "4px",
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        >
                          -{disc}%
                        </div>
                      )}

                      {/* Low Stock badge */}
                      {p.stockStatus === "low_stock" && (
                        <div
                          style={{
                            position: "absolute",
                            top: disc > 0 ? "2.1rem" : "0.6rem",
                            left: "0.6rem",
                            padding: "0.2rem 0.5rem",
                            background: "#c1956a",
                            color: "white",
                            fontSize: "0.6rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            borderRadius: "4px",
                            fontWeight: 600,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        >
                          Only a Few Left
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <FavoriteButton productId={p._id} size="sm" />
                    </div>

                    {/* Card Content */}
                    <div
                      className="product-card-body"
                      style={{
                        padding: "0.9rem",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span
                          className="product-card-category"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.6rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--gold)",
                            fontWeight: 600,
                          }}
                        >
                          {getCategoryLabel(p.category)}
                        </span>
                        <Link
                          href={`/product/${p._id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <h3
                            className="font-serif product-card-title"
                            style={{
                              fontSize: "1rem",
                              fontWeight: 500,
                              color: "var(--charcoal)",
                              marginTop: "0.15rem",
                              marginBottom: "0.3rem",
                              lineHeight: 1.25,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {p.name}
                          </h3>
                        </Link>
                        <p
                          className="product-card-desc"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.75rem",
                            color: "var(--warm-gray)",
                            lineHeight: 1.5,
                            marginBottom: "0.5rem",
                          }}
                        >
                          {p.description}
                        </p>
                        <div
                          className="product-card-rating"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <Stars rating={p.rating || 5} />
                          <span
                            style={{
                              fontSize: "0.65rem",
                              color: "var(--light-gray)",
                            }}
                          >
                            ({p.numReviews || 0})
                          </span>
                        </div>
                      </div>

                      <div
                        className="product-card-footer"
                        style={{
                          paddingTop: "0.6rem",
                          borderTop: "1px solid var(--beige)",
                        }}
                      >
                        {/* Price section */}
                        <div
                          className="product-card-price"
                          style={{
                            marginBottom: "0.6rem",
                          }}
                        >
                          {hasDiscount(p) ? (
                            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem", flexWrap: "wrap" }}>
                              <span
                                className="font-serif"
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 600,
                                  color: "var(--charcoal)",
                                }}
                              >
                                {formatCurrency(p.price)}
                              </span>
                              <span
                                style={{
                                  fontFamily: "'Jost', sans-serif",
                                  fontSize: "0.75rem",
                                  color: "var(--light-gray)",
                                  textDecoration: "line-through",
                                }}
                              >
                                {formatCurrency(p.mrp!)}
                              </span>
                            </div>
                          ) : (
                            <span
                              className="font-serif"
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                color: "var(--charcoal)",
                              }}
                            >
                              {formatCurrency(p.price)}
                            </span>
                          )}
                        </div>

                        {/* Out of stock or limit reached indicator */}
                        {p.stockStatus === "out_of_stock" || (p.maxPurchasable ?? p.stock) <= 0 ? (
                          <div
                            className="product-card-btn"
                            style={{
                              width: "100%",
                              padding: "0.45rem",
                              borderRadius: "8px",
                              border: "1px solid #fecdd3",
                              background: "#fff1f2",
                              color: "#be123c",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              textAlign: "center",
                              letterSpacing: "0.06em",
                            }}
                          >
                            Out of Stock
                          </div>
                        ) : (
                          <button
                            className="product-card-btn"
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(p);
                            }}
                            style={{
                              width: "100%",
                              fontSize: "0.72rem",
                              padding: "0.5rem",
                              borderRadius: "8px",
                              border: "none",
                              background: addedIds.includes(p._id)
                                ? "var(--gold)"
                                : getItemCartQty(p._id) >= (p.maxPurchasable ?? 10)
                                ? "rgba(44, 44, 44, 0.7)"
                                : "var(--charcoal)",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: 500,
                              letterSpacing: "0.05em",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px",
                              transition: "background 0.3s ease",
                            }}
                          >
                            <ShoppingBag size={13} />
                            <span>
                              {addedIds.includes(p._id)
                                ? "Added ✓"
                                : getItemCartQty(p._id) >= (p.maxPurchasable ?? 10)
                                ? "Limit in Cart"
                                : "Add to Cart"}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 1.5rem",
                background: "var(--white)",
                borderRadius: "16px",
                border: "1px solid var(--beige)",
              }}
            >
              <Package
                size={48}
                style={{ color: "var(--gold)", marginBottom: "1rem" }}
              />
              <h2
                className="font-serif"
                style={{
                  fontSize: "1.5rem",
                  color: "var(--charcoal)",
                  marginBottom: "0.5rem",
                }}
              >
                No Products Available Yet
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--warm-gray)",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                Products added via the Admin Portal will automatically appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--cream)" }} />}>
      <ShopPageContent />
    </Suspense>
  );
}

