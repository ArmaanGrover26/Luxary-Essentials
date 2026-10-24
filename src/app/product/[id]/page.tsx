"use client";

import { use, useEffect, useState, useCallback, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  ShoppingBag,
  Star,
  Package,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Heart,
  Truck,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getCategoryLabel } from "@/config/categories";
import ProductCardImage from "@/components/ui/ProductCardImage";

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
  createdAt?: string;
  updatedAt?: string;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating || 5);
  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rounded ? "var(--gold)" : "none"}
          color={i <= rounded ? "var(--gold)" : "var(--beige)"}
        />
      ))}
    </span>
  );
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"specs" | "delivery" | "care">("specs");
  const { addToCart, getItemCartQty, setCartNotification } = useCart();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();
  const isWishlisted = product ? checkIsWishlisted(product._id) : false;

  // Load product detail
  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      try {
        setLoading(true);
        const encodedId = encodeURIComponent(id.trim());
        const res = await fetch(`/api/products/${encodedId}`);
        const data = await res.json();
        if (cancelled) return;

        if (data.success && data.data) {
          setProduct(data.data);
          setActiveImg(0);
          setQty(1);

          // Fetch related products in the same category
          if (data.data.category) {
            fetch(
              `/api/products?category=${encodeURIComponent(
                data.data.category
              )}&limit=5`
            )
              .then((r) => r.json())
              .then((relData) => {
                if (cancelled) return;
                if (relData.success && relData.data?.products) {
                  const filtered = relData.data.products
                    .filter((p: DBProduct) => p._id !== data.data._id)
                    .slice(0, 4);
                  setRelatedProducts(filtered);
                }
              })
              .catch(() => {});
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product detail", err);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Keyboard navigation for image gallery
  const images = product?.images && product.images.length > 0 ? product.images : [];
  const totalImages = images.length;

  const nextImage = useCallback(() => {
    if (totalImages <= 1) return;
    setActiveImg((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevImage = useCallback(() => {
    if (totalImages <= 1) return;
    setActiveImg((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === "Escape") setIsLightboxOpen(false);
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, nextImage, prevImage]);

  const cartQty = product ? getItemCartQty(product._id) : 0;
  const effectiveMax = product
    ? (typeof product.maxPurchasable === "number"
        ? product.maxPurchasable
        : (product.inStock === false ? 0 : 10))
    : 0;
  const isOutOfStock = !product || product.stockStatus === "out_of_stock" || effectiveMax <= 0;
  const remainingAddable = Math.max(0, effectiveMax - cartQty);

  const handleAddToCart = () => {
    if (!product || isOutOfStock || remainingAddable <= 0) {
      setCartNotification("You've reached the available quantity for this item.");
      return;
    }
    const result = addToCart(
      {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        image: images[0] || "",
        maxPurchasable: product.maxPurchasable,
        inStock: product.inStock,
        stockStatus: product.stockStatus,
      },
      qty
    );
    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
    }
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock || remainingAddable <= 0) {
      setCartNotification("You've reached the available quantity for this item.");
      return;
    }
    handleAddToCart();
    router.push("/checkout");
  };

  const hasDiscount =
    product?.mrp != null && product.mrp > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product!.mrp! - product!.price) / product!.mrp!) * 100)
    : 0;

  // Loading skeleton state
  if (loading) {
    return (
      <div style={{ background: "var(--cream)", minHeight: "100vh", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div
            style={{
              height: "24px",
              width: "260px",
              background: "var(--white)",
              borderRadius: "4px",
              marginBottom: "2.5rem",
              animation: "pulse 1.5s infinite",
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "3.5rem",
            }}
          >
            <div>
              <div
                style={{
                  aspectRatio: "1/1",
                  background: "var(--white)",
                  borderRadius: "16px",
                  border: "1px solid var(--beige)",
                  marginBottom: "1rem",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{
                      width: "70px",
                      height: "70px",
                      background: "var(--white)",
                      borderRadius: "10px",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  height: "20px",
                  width: "120px",
                  background: "var(--white)",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  height: "44px",
                  width: "80%",
                  background: "var(--white)",
                  borderRadius: "6px",
                  marginBottom: "1.25rem",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  height: "28px",
                  width: "160px",
                  background: "var(--white)",
                  borderRadius: "4px",
                  marginBottom: "1.5rem",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  height: "80px",
                  width: "100%",
                  background: "var(--white)",
                  borderRadius: "8px",
                  marginBottom: "2rem",
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  height: "48px",
                  width: "220px",
                  background: "var(--white)",
                  borderRadius: "10px",
                  animation: "pulse 1.5s infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div
        style={{
          background: "var(--cream)",
          minHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "var(--white)",
            border: "1px solid var(--beige)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <Package size={38} style={{ color: "var(--gold)" }} />
        </div>
        <h1
          className="font-serif"
          style={{
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            color: "var(--charcoal)",
            fontWeight: 400,
            marginBottom: "0.5rem",
          }}
        >
          Product Not Found
        </h1>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            color: "var(--warm-gray)",
            fontSize: "0.95rem",
            maxWidth: "460px",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          The product you are looking for does not exist, has an outdated link,
          or has been updated by the store admin.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/shop" className="btn-gold" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span>Explore All Products</span>
            <ArrowRight size={15} />
          </Link>
          <Link href="/" className="btn-outline" style={{ display: "inline-flex", alignItems: "center" }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentImageSrc = images[activeImg];
  const isCurrentImageFailed = !currentImageSrc || failedImages[currentImageSrc];

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Breadcrumb Navigation */}
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
          <Link href="/" style={{ color: "var(--warm-gray)", textDecoration: "none" }}>
            Home
          </Link>
          <span style={{ margin: "0 0.5rem", color: "var(--beige)" }}>/</span>
          <Link href="/shop" style={{ color: "var(--warm-gray)", textDecoration: "none" }}>
            Shop
          </Link>
          <span style={{ margin: "0 0.5rem", color: "var(--beige)" }}>/</span>
          <Link
            href={`/shop?cat=${product.category}`}
            style={{ color: "var(--warm-gray)", textDecoration: "none" }}
          >
            {getCategoryLabel(product.category)}
          </Link>
          <span style={{ margin: "0 0.5rem", color: "var(--beige)" }}>/</span>
          <span style={{ color: "var(--charcoal)", fontWeight: 500 }}>{product.name}</span>
        </div>
      </div>

      {/* Main Product Section */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3.5rem 1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3.5rem",
            alignItems: "flex-start",
          }}
        >
          {/* ──── LEFT: Responsive Image Gallery ──── */}
          <div>
            {/* Main Image Display */}
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
              {!isCurrentImageFailed ? (
                <Image
                  src={currentImageSrc}
                  alt={`${product.name} - image ${activeImg + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{ objectFit: "cover", transition: "opacity 0.25s ease" }}
                  priority={activeImg === 0}
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [currentImageSrc]: true }));
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--light-gray)",
                    background: "var(--ivory)",
                    padding: "2rem",
                    textAlign: "center",
                  }}
                >
                  <Package size={52} style={{ color: "var(--gold)", marginBottom: "0.75rem", opacity: 0.7 }} />
                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--warm-gray)" }}>
                    Luxury Essentials Artisanal Creation
                  </span>
                </div>
              )}

              {/* Discount badge */}
              {discountPct > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    padding: "0.35rem 0.75rem",
                    background: "#be123c",
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "6px",
                    letterSpacing: "0.04em",
                    zIndex: 2,
                    boxShadow: "0 2px 8px rgba(190, 18, 60, 0.3)",
                  }}
                >
                  -{discountPct}% OFF
                </div>
              )}

              {/* Photo Counter */}
              {totalImages > 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "1rem",
                    right: "1rem",
                    padding: "0.3rem 0.65rem",
                    background: "rgba(0,0,0,0.65)",
                    backdropFilter: "blur(4px)",
                    color: "white",
                    fontSize: "0.72rem",
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 600,
                    borderRadius: "20px",
                    zIndex: 2,
                    letterSpacing: "0.06em",
                  }}
                >
                  {activeImg + 1} / {totalImages}
                </div>
              )}

              {/* Lightbox / Zoom Button */}
              {!isCurrentImageFailed && (
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="View full screen image"
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(6px)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
                    zIndex: 2,
                    transition: "transform 0.2s ease",
                  }}
                >
                  <Maximize2 size={16} color="var(--charcoal)" />
                </button>
              )}

              {/* Previous & Next Main Image Arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    aria-label="Previous product image"
                    style={{
                      position: "absolute",
                      left: "0.85rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(6px)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                      zIndex: 3,
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <ChevronLeft size={20} color="var(--charcoal)" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    aria-label="Next product image"
                    style={{
                      position: "absolute",
                      right: "0.85rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(6px)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                      zIndex: 3,
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <ChevronRight size={20} color="var(--charcoal)" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip: displays EVERY image uploaded by admin */}
            {totalImages > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  overflowX: "auto",
                  paddingBottom: "0.5rem",
                  scrollbarWidth: "thin",
                }}
              >
                {images.map((img, i) => {
                  const isThumbFailed = failedImages[img];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={`View photo ${i + 1} of ${product.name}`}
                      style={{
                        minWidth: "72px",
                        width: "72px",
                        height: "72px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border:
                          activeImg === i
                            ? "2.5px solid var(--gold)"
                            : "1px solid var(--beige)",
                        cursor: "pointer",
                        position: "relative",
                        background: "var(--white)",
                        padding: 0,
                        flexShrink: 0,
                        boxShadow:
                          activeImg === i
                            ? "0 0 10px rgba(193, 149, 106, 0.4)"
                            : "none",
                        transform: activeImg === i ? "scale(1.04)" : "scale(1)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {!isThumbFailed ? (
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${i + 1}`}
                          fill
                          sizes="72px"
                          style={{ objectFit: "cover" }}
                          onError={() => {
                            setFailedImages((prev) => ({ ...prev, [img]: true }));
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--ivory)",
                          }}
                        >
                          <Package size={20} style={{ color: "var(--light-gray)" }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ──── RIGHT: Complete Product Details ──── */}
          <div>
            {/* Category tag */}
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
                display: "block",
                marginBottom: "0.4rem",
              }}
            >
              {getCategoryLabel(product.category)}
            </span>

            {/* Product Title */}
            <h1
              className="font-serif"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                fontWeight: 500,
                color: "var(--charcoal)",
                lineHeight: 1.15,
                marginBottom: "0.75rem",
              }}
            >
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <Stars rating={product.rating || 5} size={15} />
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--gold-dark)",
                  fontWeight: 600,
                }}
              >
                {product.rating || 5.0}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--light-gray)" }}>
                ({product.numReviews || 0} customer reviews)
              </span>
            </div>

            {/* Pricing Section */}
            <div style={{ marginBottom: "1.5rem" }}>
              {hasDiscount ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.85rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "2.3rem",
                        fontWeight: 600,
                        color: "var(--charcoal)",
                      }}
                    >
                      {formatCurrency(product.price)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "1.15rem",
                        color: "var(--light-gray)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatCurrency(product.mrp!)}
                    </span>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        background: "#fff1f2",
                        color: "#be123c",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        borderRadius: "4px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      SAVE {formatCurrency(product.mrp! - product.price)} ({discountPct}% OFF)
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.75rem",
                      color: "var(--light-gray)",
                      marginTop: "0.3rem",
                    }}
                  >
                    Inclusive of all applicable taxes
                  </div>
                </div>
              ) : (
                <div>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.3rem",
                      fontWeight: 600,
                      color: "var(--charcoal)",
                    }}
                  >
                    {formatCurrency(product.price)}
                  </span>
                  <div
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.75rem",
                      color: "var(--light-gray)",
                      marginTop: "0.3rem",
                    }}
                  >
                    Inclusive of all applicable taxes
                  </div>
                </div>
              )}
            </div>

            <hr className="gold-divider" style={{ marginBottom: "1.5rem" }} />

            {/* Customer-facing Stock Status */}
            <div
              style={{
                marginBottom: "1.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.8rem",
                borderRadius: "20px",
                background:
                  product.stockStatus === "in_stock"
                    ? "#ecfdf5"
                    : product.stockStatus === "low_stock"
                    ? "#fffbeb"
                    : "#fef2f2",
                border: `1px solid ${
                  product.stockStatus === "in_stock"
                    ? "#a7f3d0"
                    : product.stockStatus === "low_stock"
                    ? "#fde68a"
                    : "#fecaca"
                }`,
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background:
                    product.stockStatus === "in_stock"
                      ? "#059669"
                      : product.stockStatus === "low_stock"
                      ? "#d97706"
                      : "#dc2626",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color:
                    product.stockStatus === "in_stock"
                      ? "#065f46"
                      : product.stockStatus === "low_stock"
                      ? "#92400e"
                      : "#991b1b",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {product.stockStatus === "in_stock"
                  ? "In Stock — Ready to Dispatch"
                  : product.stockStatus === "low_stock"
                  ? "Only a Few Left — Order Soon"
                  : "Currently Out of Stock"}
              </span>
            </div>

            {/* Cart context status note if user already has units in cart */}
            {cartQty > 0 && !isOutOfStock && (
              <div
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.78rem",
                  color: remainingAddable === 0 ? "#b45309" : "var(--warm-gray)",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>ℹ️</span>
                <span>
                  {remainingAddable === 0
                    ? `You have reached the maximum purchase limit for this item in your cart.`
                    : `You have ${cartQty} in your cart. You can add up to ${remainingAddable} more.`}
                </span>
              </div>
            )}

            {/* Description */}
            <div
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.95rem",
                color: "var(--warm-gray)",
                lineHeight: 1.8,
                marginBottom: "2rem",
                whiteSpace: "pre-line",
              }}
            >
              {product.description}
            </div>

            {/* Quantity Selector & Action Buttons */}
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
                  opacity: isOutOfStock || remainingAddable <= 0 ? 0.5 : 1,
                }}
              >
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1 || isOutOfStock || remainingAddable <= 0}
                  aria-label="Decrease quantity"
                  style={{
                    width: "38px",
                    height: "38px",
                    border: "none",
                    background: "none",
                    cursor: qty <= 1 || isOutOfStock || remainingAddable <= 0 ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    color: "var(--charcoal)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: qty <= 1 ? 0.4 : 1,
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={remainingAddable || 1}
                  value={isOutOfStock ? 0 : qty}
                  disabled={isOutOfStock || remainingAddable <= 0}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    if (isNaN(parsed)) return;
                    if (parsed > remainingAddable) {
                      setCartNotification("You've reached the available quantity for this item.");
                      setQty(remainingAddable);
                    } else {
                      setQty(Math.max(1, parsed));
                    }
                  }}
                  style={{
                    width: "48px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--charcoal)",
                    fontFamily: "'Jost', sans-serif",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (qty >= remainingAddable) {
                      setCartNotification("You've reached the available quantity for this item.");
                    } else {
                      setQty(qty + 1);
                    }
                  }}
                  disabled={qty >= remainingAddable || isOutOfStock}
                  aria-label="Increase quantity"
                  style={{
                    width: "38px",
                    height: "38px",
                    border: "none",
                    background: "none",
                    cursor: qty >= remainingAddable || isOutOfStock ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    color: "var(--charcoal)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: qty >= remainingAddable || isOutOfStock ? 0.4 : 1,
                  }}
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || remainingAddable <= 0}
                style={{
                  padding: "0.9rem 2.2rem",
                  borderRadius: "10px",
                  border: "none",
                  background: addedToCart
                    ? "var(--gold)"
                    : isOutOfStock || remainingAddable <= 0
                    ? "#e5e7eb"
                    : "var(--charcoal)",
                  color: isOutOfStock || remainingAddable <= 0 ? "#9ca3af" : "white",
                  cursor: isOutOfStock || remainingAddable <= 0 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.25s ease",
                  boxShadow: isOutOfStock || remainingAddable <= 0 ? "none" : "0 4px 14px rgba(0,0,0,0.12)",
                }}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle size={18} /> Added to Cart
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : remainingAddable <= 0 && cartQty > 0 ? (
                  "Limit Reached in Cart"
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>

              {/* Buy Now Button */}
              {!isOutOfStock && remainingAddable > 0 && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn-gold"
                  style={{
                    padding: "0.9rem 1.8rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Buy Now
                </button>
              )}

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => product && toggleWishlist(product._id)}
                aria-label={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                aria-pressed={isWishlisted}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  border: isWishlisted ? "1px solid rgba(190, 18, 60, 0.3)" : "1px solid var(--beige)",
                  background: isWishlisted ? "#fff1f2" : "var(--white)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isWishlisted ? "#be123c" : "var(--charcoal)",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  flexShrink: 0,
                }}
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? "#be123c" : "none"}
                  color={isWishlisted ? "#be123c" : "var(--charcoal)"}
                  strokeWidth={1.75}
                />
              </button>
            </div>

            {/* Store Guarantees / Service Highlights */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                padding: "1.25rem",
                background: "var(--white)",
                borderRadius: "12px",
                border: "1px solid var(--beige)",
                marginBottom: "2.5rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <Package size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--charcoal)" }}>
                    Cash on Delivery
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)" }}>
                    Available across India
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <Truck size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--charcoal)" }}>
                    Safe Delivery
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)" }}>
                    Dispatched in 24–48 hours
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <Sparkles size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--charcoal)" }}>
                    Handcrafted Luxury
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)" }}>
                    Non-toxic, premium materials
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <ShieldCheck size={20} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "var(--charcoal)" }}>
                    Secure Orders
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)" }}>
                    Verified order tracking
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed Specifications & Policies */}
            <div
              style={{
                background: "var(--white)",
                borderRadius: "14px",
                border: "1px solid var(--beige)",
                overflow: "hidden",
              }}
            >
              {/* Tab Navigation */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid var(--beige)",
                  background: "var(--ivory)",
                }}
              >
                {[
                  { id: "specs", label: "Product Specifications" },
                  { id: "delivery", label: "Delivery & Terms" },
                  { id: "care", label: "Care & Handling" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as "specs" | "delivery" | "care")}
                    style={{
                      flex: 1,
                      padding: "0.85rem 1rem",
                      border: "none",
                      background: activeTab === t.id ? "var(--white)" : "transparent",
                      borderBottom:
                        activeTab === t.id
                          ? "2px solid var(--gold)"
                          : "2px solid transparent",
                      color: activeTab === t.id ? "var(--charcoal)" : "var(--warm-gray)",
                      fontWeight: activeTab === t.id ? 600 : 500,
                      fontFamily: "'Jost', sans-serif",
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div style={{ padding: "1.5rem" }}>
                {activeTab === "specs" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--beige)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Category</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--charcoal)" }}>{getCategoryLabel(product.category)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--beige)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Availability</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", fontWeight: 600, color: product.stock > 0 ? "#059669" : "#dc2626" }}>
                        {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--beige)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Product Identifier</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--charcoal)" }}>{product._id}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--beige)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Customer Rating</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)" }}>{product.rating || 5.0} ★ ({product.numReviews || 0} reviews)</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Total Images</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)" }}>{totalImages} verified photo{totalImages !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )}

                {activeTab === "delivery" && (
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--warm-gray)", lineHeight: 1.7 }}>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <strong>Cash on Delivery (COD):</strong> Available on this product. Our team coordinates directly with your contact phone to confirm delivery details.
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <strong>Packaging & Transit:</strong> Every product is packed in multi-layered protective wrap to ensure safe, damage-free transit to your doorstep.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>All Sales are Final:</strong> Due to the handcrafted, custom artisanal nature of our creations, orders are inspected thoroughly before dispatch.
                    </p>
                  </div>
                )}

                {activeTab === "care" && (
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--warm-gray)", lineHeight: 1.7 }}>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <strong>Cleaning:</strong> Clean gently with a microfiber cloth dampened with mild soapy water. Avoid abrasive scrubbers or sharp objects.
                    </p>
                    <p style={{ marginBottom: "0.75rem" }}>
                      <strong>Heat & Sunlight:</strong> Avoid placing resin pieces under direct prolonged extreme sunlight or near open flames.
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Storage:</strong> Store molds and raw materials in a cool, dry place away from dust.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ──── RELATED PRODUCTS SECTION ──── */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "5rem", paddingTop: "3rem", borderTop: "1px solid var(--beige)" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  More from this collection
                </span>
                <h2 className="font-serif" style={{ fontSize: "2rem", color: "var(--charcoal)", marginTop: "0.2rem" }}>
                  Related Creations
                </h2>
              </div>
              <Link href={`/shop?cat=${product.category}`} className="btn-outline" style={{ fontSize: "0.75rem", padding: "0.6rem 1.25rem" }}>
                <span>View All {getCategoryLabel(product.category)}</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="shop-product-grid">
              {relatedProducts.map((rel) => {
                const relDisc =
                  rel.mrp != null && rel.mrp > rel.price
                    ? Math.round(((rel.mrp - rel.price) / rel.mrp) * 100)
                    : 0;

                return (
                  <div
                    key={rel._id}
                    className="product-card"
                    onClick={() => router.push(`/product/${rel._id}`)}
                    style={{
                      background: "var(--white)",
                      borderRadius: "12px",
                      border: "1px solid var(--beige)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "var(--shadow-card)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--ivory)", overflow: "hidden" }}>
                      <Link
                        href={`/product/${rel._id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "block", width: "100%", height: "100%", position: "relative" }}
                      >
                        <ProductCardImage
                          images={rel.images}
                          alt={rel.name}
                          sizes="(max-width: 768px) 50vw, 280px"
                        />
                      </Link>
                      {relDisc > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.6rem",
                            left: "0.6rem",
                            padding: "0.2rem 0.5rem",
                            background: "#be123c",
                            color: "white",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            borderRadius: "4px",
                            pointerEvents: "none",
                          }}
                        >
                          -{relDisc}%
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
                      <div>
                        <span
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: "0.62rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            color: "var(--gold)",
                            fontWeight: 600,
                          }}
                        >
                          {getCategoryLabel(rel.category)}
                        </span>
                        <Link
                          href={`/product/${rel._id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <h3
                            className="font-serif product-card-title"
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 500,
                              color: "var(--charcoal)",
                              marginTop: "0.2rem",
                              marginBottom: "0.35rem",
                            }}
                          >
                            {rel.name}
                          </h3>
                        </Link>
                      </div>

                      <div style={{ paddingTop: "0.65rem", borderTop: "1px solid var(--beige)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="font-serif" style={{ fontSize: "1.15rem", fontWeight: 600, color: "var(--charcoal)" }}>
                          {formatCurrency(rel.price)}
                        </span>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--gold)", fontWeight: 600 }}>
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ──── FULL-SCREEN LIGHTBOX MODAL ──── */}
      {isLightboxOpen && !isCurrentImageFailed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Lightbox"
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.92)",
            backdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
            aria-label="Close Lightbox"
            style={{
              position: "absolute",
              top: "1.5rem",
              right: "1.5rem",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              transition: "background 0.2s ease",
            }}
          >
            <X size={22} />
          </button>

          {/* Lightbox Image Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "88vw",
              maxHeight: "75vh",
              width: "800px",
              height: "600px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={currentImageSrc}
              alt={`${product.name} - large preview`}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
              priority
            />

            {/* Prev/Next inside Lightbox */}
            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                  style={{
                    position: "absolute",
                    left: "-1.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                  style={{
                    position: "absolute",
                    right: "-1.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnail Strip */}
          {totalImages > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "flex",
                gap: "0.6rem",
                marginTop: "1.5rem",
                maxWidth: "90vw",
                overflowX: "auto",
                padding: "0.5rem",
              }}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border:
                      activeImg === i
                        ? "2px solid var(--gold)"
                        : "1px solid rgba(255,255,255,0.3)",
                    background: "black",
                    cursor: "pointer",
                    position: "relative",
                    padding: 0,
                    opacity: activeImg === i ? 1 : 0.6,
                    transform: activeImg === i ? "scale(1.08)" : "scale(1)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${i + 1}`}
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.8rem",
              marginTop: "0.75rem",
            }}
          >
            {product.name} ({activeImg + 1} of {totalImages}) • Press Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
