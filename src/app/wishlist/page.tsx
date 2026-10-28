"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Trash2, ArrowRight, Package, Star, Sparkles, AlertCircle } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getCategoryLabel } from "@/config/categories";
import ProductCardImage from "@/components/ui/ProductCardImage";

interface WishlistProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  mrp?: number | null;
  category: string;
  images: string[];
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  inStock?: boolean;
  maxPurchasable?: number;
  rating?: number;
  numReviews?: number;
}

interface WishlistItem {
  _id: string;
  product: WishlistProduct;
  addedAt: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

export default function WishlistPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { wishlistIds, removeFromWishlist, wishlistCount, loading: wishlistLoading } = useWishlist();
  const { addToCart, getItemCartQty, setCartNotification } = useCart();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Fetch full live product data for wishlist items
  const loadWishlistData = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/wishlist";
      const headers: Record<string, string> = {};

      if (user) {
        if (token) headers["Authorization"] = `Bearer ${token}`;
      } else {
        // Guest mode: check wishlistIds or localStorage fallback
        let targetIds = wishlistIds;
        if (targetIds.length === 0 && typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("le_guest_wishlist");
            if (raw) targetIds = JSON.parse(raw);
          } catch {}
        }

        if (targetIds.length === 0) {
          if (wishlistLoading) return; // Wait for context initialization
          setItems([]);
          setLoading(false);
          return;
        }
        url = `/api/wishlist?ids=${encodeURIComponent(targetIds.join(","))}`;
      }

      const res = await fetch(url, { credentials: "include", headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.data?.items)) {
        setItems(data.data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load wishlist items", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, wishlistIds, wishlistLoading]);

  useEffect(() => {
    loadWishlistData();
  }, [loadWishlistData]);

  // Remove handler with immediate local state update
  const handleRemove = async (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product._id !== productId));
    await removeFromWishlist(productId);
  };

  // Add to cart with inventory enforcement
  const handleAddToCart = (product: WishlistProduct) => {
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
        image: product.images?.[0] || "",
        maxPurchasable: product.maxPurchasable,
        inStock: product.inStock,
        stockStatus: product.stockStatus,
      },
      1
    );

    if (res.success) {
      setAddedIds((prev) => [...prev, product._id]);
      setTimeout(
        () => setAddedIds((prev) => prev.filter((id) => id !== product._id)),
        1600
      );
    }
  };

  return (
    <div style={{ background: "var(--cream)", minHeight: "85vh", padding: "2.5rem 1.5rem 5rem" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* Breadcrumb navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.75rem",
            color: "var(--warm-gray)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Link href="/" style={{ color: "var(--charcoal)", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: "var(--gold)", fontWeight: 500 }}>Wishlist</span>
        </nav>

        {/* Page Title & Count Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2.5rem",
            paddingBottom: "1.25rem",
            borderBottom: "1px solid var(--beige)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
                marginBottom: "0.4rem",
              }}
            >
              Curated Collection
            </div>
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 400,
                color: "var(--charcoal)",
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              My Saved Essentials
            </h1>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.85rem",
                color: "var(--warm-gray)",
                marginTop: "0.4rem",
                marginBottom: 0,
              }}
            >
              Treasures you love, ready for whenever you decide to bring them home.
            </p>
          </div>

          {!loading && items.length > 0 && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.45rem 0.9rem",
                background: "var(--white)",
                border: "1px solid var(--beige)",
                borderRadius: "30px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.75rem",
                color: "var(--charcoal)",
              }}
            >
              <Heart size={14} fill="#be123c" color="#be123c" />
              <span>
                <strong>{items.length}</strong> {items.length === 1 ? "item" : "items"} saved
              </span>
            </div>
          )}
        </div>

        {/* Loading State Skeleton */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.75rem",
            }}
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  background: "var(--white)",
                  borderRadius: "14px",
                  border: "1px solid var(--beige)",
                  overflow: "hidden",
                }}
              >
                <div style={{ aspectRatio: "1/1", background: "var(--ivory)", opacity: 0.6 }} />
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ height: "12px", width: "40%", background: "var(--ivory)", borderRadius: "4px" }} />
                  <div style={{ height: "18px", width: "80%", background: "var(--ivory)", borderRadius: "4px" }} />
                  <div style={{ height: "16px", width: "50%", background: "var(--ivory)", borderRadius: "4px" }} />
                  <div style={{ height: "38px", width: "100%", background: "var(--ivory)", borderRadius: "8px", marginTop: "8px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              background: "var(--white)",
              borderRadius: "20px",
              border: "1px solid var(--beige)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
              maxWidth: "600px",
              margin: "2rem auto",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(190, 18, 60, 0.08)",
                color: "#be123c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <Heart size={32} strokeWidth={1.5} />
            </div>

            <h2
              className="font-serif"
              style={{
                fontSize: "1.85rem",
                fontWeight: 400,
                color: "var(--charcoal)",
                marginBottom: "0.75rem",
              }}
            >
              Your Wishlist is Empty
            </h2>

            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.9rem",
                color: "var(--warm-gray)",
                lineHeight: 1.6,
                maxWidth: "420px",
                margin: "0 auto 2rem",
              }}
            >
              Explore our handcrafted resin art, scented botanical candles, and raw craft materials to save your favorite essentials.
            </p>

            <Link
              href="/shop"
              className="btn-gold"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.85rem 2rem",
                textDecoration: "none",
              }}
            >
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Wishlist Items Grid */}
        {!loading && items.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {items.map(({ product }) => {
              const disc =
                product.mrp && product.mrp > product.price
                  ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                  : 0;

              const isOutOfStock = product.stockStatus === "out_of_stock" || product.inStock === false;
              const isFewLeft = product.stockStatus === "low_stock";
              const inCartQty = getItemCartQty(product._id);
              const maxAllowed = typeof product.maxPurchasable === "number" ? product.maxPurchasable : (isOutOfStock ? 0 : 10);
              const limitReached = inCartQty >= maxAllowed && maxAllowed > 0;
              const isAdded = addedIds.includes(product._id);

              return (
                <div
                  key={product._id}
                  style={{
                    background: "var(--white)",
                    borderRadius: "16px",
                    border: "1px solid var(--beige)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    position: "relative",
                  }}
                >
                  {/* Image Container with Badges */}
                  <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--ivory)", overflow: "hidden" }}>
                    <Link
                      href={`/product/${product._id}`}
                      style={{ display: "block", width: "100%", height: "100%", textDecoration: "none" }}
                    >
                      <ProductCardImage
                        images={product.images || []}
                        alt={product.name}
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    </Link>

                    {/* Discount Badge */}
                    {disc > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          padding: "0.22rem 0.55rem",
                          background: "#be123c",
                          color: "#ffffff",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          borderRadius: "4px",
                          letterSpacing: "0.05em",
                          pointerEvents: "none",
                        }}
                      >
                        -{disc}%
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div style={{ position: "absolute", bottom: "0.75rem", left: "0.75rem", pointerEvents: "none" }}>
                      {isOutOfStock ? (
                        <span
                          style={{
                            padding: "0.22rem 0.6rem",
                            borderRadius: "20px",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            background: "rgba(255, 241, 242, 0.95)",
                            color: "#be123c",
                            border: "1px solid #fecdd3",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          Out of Stock
                        </span>
                      ) : isFewLeft ? (
                        <span
                          style={{
                            padding: "0.22rem 0.6rem",
                            borderRadius: "20px",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            background: "rgba(255, 251, 235, 0.95)",
                            color: "#b45309",
                            border: "1px solid #fde68a",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          Only a Few Left
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "0.22rem 0.6rem",
                            borderRadius: "20px",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            background: "rgba(236, 253, 245, 0.95)",
                            color: "#047857",
                            border: "1px solid #a7f3d0",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Remove from Wishlist action button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      title="Remove from favorites"
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(255, 255, 255, 0.92)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#be123c",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Card Content & Details */}
                  <div
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      {/* Category */}
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.65rem",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          fontWeight: 600,
                        }}
                      >
                        {getCategoryLabel(product.category)}
                      </span>

                      {/* Title */}
                      <Link
                        href={`/product/${product._id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <h3
                          className="font-serif"
                          style={{
                            fontSize: "1.15rem",
                            fontWeight: 500,
                            color: "var(--charcoal)",
                            margin: "0.3rem 0 0.5rem",
                            lineHeight: 1.3,
                          }}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "1.25rem" }}>
                        <span
                          className="font-serif"
                          style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--charcoal)" }}
                        >
                          {fmt(product.price)}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: "0.8rem",
                              color: "var(--warm-gray)",
                              textDecoration: "line-through",
                            }}
                          >
                            {fmt(product.mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action: Add to Cart button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock || limitReached}
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem",
                          borderRadius: "10px",
                          border: "none",
                          background: isOutOfStock
                            ? "#ede5d8"
                            : limitReached
                            ? "#8b7355"
                            : isAdded
                            ? "#047857"
                            : "var(--gold)",
                          color: isOutOfStock ? "#a09990" : "#ffffff",
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.8rem",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          cursor: isOutOfStock || limitReached ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ShoppingBag size={15} />
                        <span>
                          {isOutOfStock
                            ? "Out of Stock"
                            : limitReached
                            ? "Limit Reached in Cart"
                            : isAdded
                            ? "Added to Cart ✓"
                            : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
