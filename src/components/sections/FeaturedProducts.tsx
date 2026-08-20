"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Star, Package, ArrowRight } from "lucide-react";

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

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const res = await fetch("/api/products?limit=4");
        const data = await res.json();
        if (data.success && data.data?.products) {
          setProducts(data.data.products);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleAdd = (product: DBProduct) => {
    addToCart({
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.images[0] || "",
    });
    setAddedIds((prev) => [...prev, product._id]);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((x) => x !== product._id)),
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
    <section style={{ padding: "6rem 1.5rem", background: "var(--cream)" }}>
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        {/* Section Header */}
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
            <span className="section-label">Curated Masterpieces</span>
            <h2
              className="section-title"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
            >
              Featured Creations
            </h2>
          </div>
          <Link
            href="/shop"
            className="btn-outline"
            style={{ fontSize: "0.75rem", padding: "0.75rem 1.5rem" }}
          >
            <span>Explore All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(260px, 1fr))",
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
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  background: "var(--white)",
                  borderRadius: "12px",
                  border: "1px solid var(--beige)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Visual */}
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    background: "var(--ivory)",
                    overflow: "hidden",
                  }}
                >
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
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
                </div>

                {/* Details */}
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
                      {product.category.replace("-", " ")}
                    </span>
                    <h3
                      className="font-serif"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 500,
                        color: "var(--charcoal)",
                        marginTop: "0.2rem",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {product.name}
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
                      {product.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginBottom: "0.875rem",
                      }}
                    >
                      <Stars rating={product.rating || 5} />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--light-gray)",
                        }}
                      >
                        ({product.numReviews || 0})
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
                      {formatCurrency(product.price)}
                    </span>
                    <button
                      onClick={() => handleAdd(product)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.55rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        background: addedIds.includes(product._id)
                          ? "var(--gold)"
                          : "var(--charcoal)",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <ShoppingBag size={14} />
                      <span>
                        {addedIds.includes(product._id) ? "Added ✓" : "Add to Cart"}
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
              padding: "4rem 1.5rem",
              background: "var(--white)",
              borderRadius: "16px",
              border: "1px solid var(--beige)",
            }}
          >
            <Package
              size={40}
              style={{ color: "var(--gold)", marginBottom: "0.75rem" }}
            />
            <h3
              className="font-serif"
              style={{ fontSize: "1.3rem", color: "var(--charcoal)" }}
            >
              No Featured Products Available
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--warm-gray)" }}>
              Add products in the Admin Portal to feature them on the homepage.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
