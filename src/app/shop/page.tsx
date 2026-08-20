"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Heart, Star, Package } from "lucide-react";

interface DBProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "resin" | "candles" | "raw-materials" | "gifts";
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
}

const tabs = [
  { label: "All Products", value: "" },
  { label: "Resin Art", value: "resin" },
  { label: "Hand-poured Candles", value: "candles" },
  { label: "Raw Materials", value: "raw-materials" },
  { label: "Luxury Gifts", value: "gifts" },
];

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

export default function ShopPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [wished, setWished] = useState<string[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("limit", "50");
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

  const toggleWish = (id: string) => {
    setWished((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (p: DBProduct) => {
    addToCart({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      image: p.images[0] || "",
    });
    setAddedIds((prev) => [...prev, p._id]);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((x) => x !== p._id)),
      1500
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
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
            padding: "0 1.5rem",
            display: "flex",
            gap: 0,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveCategory(tab.value)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.78rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "1.1rem 1.5rem",
                background: "none",
                border: "none",
                borderBottom:
                  activeCategory === tab.value
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
                color:
                  activeCategory === tab.value
                    ? "var(--charcoal)"
                    : "var(--warm-gray)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                fontWeight: activeCategory === tab.value ? 600 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid Section */}
      <section style={{ padding: "3.5rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
          <p
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1.75rem",
              }}
            >
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1.75rem",
              }}
            >
              {products.map((p) => (
                <div
                  key={p._id}
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
                    {p.images && p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--light-gray)",
                        }}
                      >
                        <Package size={36} />
                      </div>
                    )}

                    {/* Stock badge */}
                    {p.stock <= 5 && p.stock > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.75rem",
                          left: "0.75rem",
                          padding: "0.25rem 0.6rem",
                          background: "#c1956a",
                          color: "white",
                          fontSize: "0.6rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          borderRadius: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Low Stock ({p.stock})
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWish(p._id)}
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.9)",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={14}
                        fill={wished.includes(p._id) ? "var(--gold)" : "none"}
                        color={
                          wished.includes(p._id)
                            ? "var(--gold)"
                            : "var(--charcoal)"
                        }
                      />
                    </button>
                  </div>

                  {/* Card Content */}
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
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.65rem",
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                          fontWeight: 600,
                        }}
                      >
                        {p.category.replace("-", " ")}
                      </span>
                      <h3
                        className="font-serif"
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 500,
                          color: "var(--charcoal)",
                          marginTop: "0.2rem",
                          marginBottom: "0.4rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {p.name}
                      </h3>
                      <p
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.78rem",
                          color: "var(--warm-gray)",
                          lineHeight: 1.5,
                          marginBottom: "0.75rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {p.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <Stars rating={p.rating || 5} />
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--light-gray)",
                          }}
                        >
                          ({p.numReviews || 0})
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--beige)",
                      }}
                    >
                      <span
                        className="font-serif"
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 600,
                          color: "var(--charcoal)",
                        }}
                      >
                        {formatCurrency(p.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(p)}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.55rem 1.1rem",
                          borderRadius: "8px",
                          border: "none",
                          background: addedIds.includes(p._id)
                            ? "var(--gold)"
                            : "var(--charcoal)",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 500,
                          letterSpacing: "0.05em",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "background 0.3s ease",
                        }}
                      >
                        <ShoppingBag size={14} />
                        <span>
                          {addedIds.includes(p._id) ? "Added ✓" : "Add to Cart"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
