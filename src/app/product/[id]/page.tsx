"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Star, Package, CheckCircle } from "lucide-react";
import { getCategoryLabel } from "@/config/categories";

interface DBProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number | null;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill={i <= Math.round(rating || 5) ? "var(--gold)" : "none"}
          color={i <= Math.round(rating || 5) ? "var(--gold)" : "var(--beige)"}
        />
      ))}
    </span>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product detail", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: product.images[0] || "",
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const hasDiscount =
    product?.mrp != null && product.mrp > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product!.mrp! - product!.price) / product!.mrp!) * 100)
    : 0;

  if (loading) {
    return (
      <div
        style={{
          background: "var(--cream)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--warm-gray)",
          fontSize: "0.9rem",
        }}
      >
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          background: "var(--cream)",
          minHeight: "100vh",
          padding: "5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <Package
          size={48}
          style={{ color: "var(--gold)", marginBottom: "1rem" }}
        />
        <h1 className="font-serif" style={{ fontSize: "2rem", color: "var(--charcoal)" }}>
          Product Not Found
        </h1>
        <p style={{ color: "var(--warm-gray)", marginTop: "0.5rem", marginBottom: "2rem" }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/shop" className="btn-gold">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div
        style={{
          background: "var(--white)",
          borderBottom: "1px solid var(--beige)",
          padding: "1rem 2rem",
        }}
      >
        <div
          style={{ maxWidth: "1320px", margin: "0 auto" }}
          className="breadcrumb"
        >
          <Link href="/">Home</Link>
          {" / "}
          <Link href="/shop">Shop</Link>
          {" / "}
          <span>{product.name}</span>
        </div>
      </div>

      {/* Product Content */}
      <div
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 2rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3.5rem",
            alignItems: "flex-start",
          }}
        >
          {/* Left: Images */}
          <div>
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                background: "var(--white)",
                border: "1px solid var(--beige)",
                aspectRatio: "1/1",
                position: "relative",
                marginBottom: "1rem",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {product.images && product.images[activeImg] ? (
                <Image
                  src={product.images[activeImg]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
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
                  <Package size={48} />
                </div>
              )}

              {/* Discount badge */}
              {discountPct > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    padding: "0.3rem 0.75rem",
                    background: "#be123c",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                    letterSpacing: "0.04em",
                  }}
                >
                  -{discountPct}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      border:
                        activeImg === i
                          ? "2px solid var(--gold)"
                          : "1px solid var(--beige)",
                      cursor: "pointer",
                      position: "relative",
                      background: "var(--white)",
                      padding: 0,
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumb ${i + 1}`}
                      fill
                      sizes="70px"
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              {getCategoryLabel(product.category)}
            </span>

            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                fontWeight: 500,
                color: "var(--charcoal)",
                lineHeight: 1.15,
                marginBottom: "0.75rem",
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <Stars rating={product.rating || 5} />
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--gold-dark)",
                  fontWeight: 600,
                }}
              >
                {product.rating || 5.0}
              </span>
              <span
                style={{ fontSize: "0.78rem", color: "var(--light-gray)" }}
              >
                ({product.numReviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: "1.5rem" }}>
              {hasDiscount ? (
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "2.2rem",
                        fontWeight: 600,
                        color: "var(--charcoal)",
                      }}
                    >
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "1.1rem",
                        color: "var(--light-gray)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatCurrency(product.mrp!)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.8rem",
                      color: "#be123c",
                      fontWeight: 600,
                      marginTop: "0.25rem",
                    }}
                  >
                    You save {formatCurrency(product.mrp! - product.price)} ({discountPct}% off)
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "2.2rem",
                    fontWeight: 600,
                    color: "var(--charcoal)",
                  }}
                >
                  {formatCurrency(product.price)}
                </div>
              )}
            </div>

            <hr
              className="gold-divider"
              style={{ marginBottom: "1.5rem" }}
            />

            {/* Description */}
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.92rem",
                color: "var(--warm-gray)",
                lineHeight: 1.8,
                marginBottom: "2rem",
              }}
            >
              {product.description}
            </p>

            {/* Stock status */}
            <div
              style={{
                marginBottom: "1.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: product.stock > 0 ? "#059669" : "#dc2626",
                }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: product.stock > 0 ? "#059669" : "#dc2626",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {product.stock > 5
                  ? "In Stock"
                  : product.stock > 0
                  ? `Only a Few Left (${product.stock} remaining)`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Qty & Add to cart */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "2rem",
              }}
            >
              {/* Qty Selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid var(--beige)",
                  borderRadius: "10px",
                  background: "var(--white)",
                  padding: "0.25rem",
                }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    color: "var(--charcoal)",
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    width: "36px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--charcoal)",
                  }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                    color: "var(--charcoal)",
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                style={{
                  padding: "0.85rem 2rem",
                  borderRadius: "10px",
                  border: "none",
                  background: addedToCart ? "var(--gold)" : "var(--charcoal)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "background 0.3s ease",
                  opacity: product.stock <= 0 ? 0.5 : 1,
                }}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle size={16} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
