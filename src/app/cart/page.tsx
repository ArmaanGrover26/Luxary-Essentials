"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, AlertTriangle, ArrowRight, Check } from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQty,
    setExactQty,
    removeItem,
    revalidateCart,
    cartNotification,
    setCartNotification,
    isRevalidating,
  } = useCart();
  const { user, loading: authLoading } = useAuth();

  // Revalidate live inventory when visiting the cart
  useEffect(() => {
    revalidateCart();
  }, [revalidateCart]);

  const hasOutOfStock = items.some(
    (i) => i.inStock === false || (typeof i.maxPurchasable === "number" && i.maxPurchasable <= 0) || i.qty <= 0
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal;

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Page Header */}
      <section
        style={{
          background: "var(--charcoal)",
          padding: "4rem 1.5rem 3rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>
            Your Selection
          </span>
          <h1
            className="font-serif"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 300,
              color: "var(--ivory)",
              marginTop: "0.5rem",
            }}
          >
            Shopping Cart
          </h1>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "3rem 1.25rem 6rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Notification banner if quantity was adjusted or limit reached */}
          {cartNotification && (
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "10px",
                padding: "1rem 1.25rem",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#92400e",
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.85rem",
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, color: "#d97706" }} />
              <div style={{ flex: 1 }}>{cartNotification}</div>
              <button
                type="button"
                onClick={() => setCartNotification(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#b45309",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {items.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
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
                  margin: "0 auto 2rem",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--light-gray)"
                  strokeWidth="1.5"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h2
                className="font-serif"
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 400,
                  color: "var(--charcoal)",
                  marginBottom: "0.75rem",
                }}
              >
                Your cart is empty
              </h2>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.88rem",
                  color: "var(--warm-gray)",
                  marginBottom: "2rem",
                }}
              >
                Explore our collection of craft supplies and custom products.
              </p>
              <Link href="/shop" className="btn-gold">
                Browse Products
              </Link>
            </div>
          ) : (
            /* Cart layout */
            <div className="cart-page-layout">
              {/* Left: Items */}
              <div className="cart-items-col">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h2
                    className="font-serif"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 400,
                      color: "var(--charcoal)",
                      margin: 0,
                    }}
                  >
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </h2>
                  {isRevalidating && (
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.75rem",
                        color: "var(--warm-gray)",
                      }}
                    >
                      Checking real-time stock...
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {items.map((item) => {
                    const maxAllowed =
                      typeof item.maxPurchasable === "number"
                        ? item.maxPurchasable
                        : item.inStock === false
                        ? 0
                        : 10;
                    const isItemOutOfStock =
                      item.inStock === false || maxAllowed <= 0 || item.qty <= 0;
                    const isAtLimit = item.qty >= maxAllowed;

                    return (
                      <div
                        key={item.id}
                        className="cart-item-card"
                        style={{
                          background: isItemOutOfStock ? "#fff8f8" : "var(--white)",
                          border: isItemOutOfStock
                            ? "1px solid #fecaca"
                            : "1px solid var(--beige)",
                          borderRadius: "10px",
                          padding: "1rem",
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        {/* Product image */}
                        <div
                          style={{
                            width: "76px",
                            height: "76px",
                            borderRadius: "8px",
                            flexShrink: 0,
                            background: "var(--ivory)",
                            border: "1px solid var(--beige)",
                            overflow: "hidden",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="76px"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--light-gray)"
                              strokeWidth="1.5"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="m21 15-5-5L5 21" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                            </svg>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "0.2rem",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.62rem",
                                letterSpacing: "0.15em",
                                textTransform: "uppercase",
                                color: "var(--gold)",
                                fontWeight: 600,
                              }}
                            >
                              {item.category}
                            </span>

                            {/* Customer-friendly stock badge without exact numbers */}
                            {isItemOutOfStock ? (
                              <span
                                style={{
                                  fontSize: "0.62rem",
                                  fontWeight: 700,
                                  background: "#fee2e2",
                                  color: "#b91c1c",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                Out of Stock
                              </span>
                            ) : item.stockStatus === "low_stock" ? (
                              <span
                                style={{
                                  fontSize: "0.62rem",
                                  fontWeight: 600,
                                  background: "#fef3c7",
                                  color: "#92400e",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                Only a Few Left
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.62rem",
                                  fontWeight: 600,
                                  background: "#ecfdf5",
                                  color: "#047857",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                In Stock
                              </span>
                            )}
                          </div>

                          <div
                            className="font-serif"
                            style={{
                              fontSize: "1rem",
                              fontWeight: 500,
                              color: "var(--charcoal)",
                              marginBottom: "0.2rem",
                              lineHeight: 1.3,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <Link
                              href={`/product/${item.id}`}
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              {item.name}
                            </Link>
                          </div>

                          <div
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: "0.78rem",
                              color: "var(--light-gray)",
                              marginBottom: "0.5rem",
                            }}
                          >
                            ₹{item.price.toLocaleString()} each
                          </div>

                          {/* Controls */}
                          {isItemOutOfStock ? (
                            <div
                              style={{
                                fontFamily: "'Jost', sans-serif",
                                fontSize: "0.78rem",
                                color: "#b91c1c",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <AlertTriangle size={14} />
                              <span>This item is no longer available. Please remove it.</span>
                            </div>
                          ) : (
                            <div className="cart-item-controls" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  border: "1px solid var(--beige)",
                                  borderRadius: "6px",
                                  background: "var(--cream)",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, -1)}
                                  disabled={item.qty <= 1}
                                  className="qty-btn"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    border: "none",
                                    background: "none",
                                    cursor: item.qty <= 1 ? "not-allowed" : "pointer",
                                    opacity: item.qty <= 1 ? 0.4 : 1,
                                    fontSize: "1.1rem",
                                  }}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={maxAllowed}
                                  value={item.qty}
                                  onChange={(e) => setExactQty(item.id, Number(e.target.value))}
                                  style={{
                                    fontFamily: "'Jost', sans-serif",
                                    fontSize: "0.85rem",
                                    color: "var(--charcoal)",
                                    width: "36px",
                                    textAlign: "center",
                                    border: "none",
                                    background: "transparent",
                                    outline: "none",
                                    fontWeight: 600,
                                  }}
                                  aria-label="Quantity"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isAtLimit) {
                                      setCartNotification("You've reached the available quantity for this item.");
                                    } else {
                                      updateQty(item.id, 1);
                                    }
                                  }}
                                  disabled={isAtLimit}
                                  className="qty-btn"
                                  style={{
                                    width: "30px",
                                    height: "30px",
                                    border: "none",
                                    background: "none",
                                    cursor: isAtLimit ? "not-allowed" : "pointer",
                                    opacity: isAtLimit ? 0.35 : 1,
                                    fontSize: "1.1rem",
                                  }}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <div
                                className="font-serif"
                                style={{
                                  fontSize: "1.05rem",
                                  fontWeight: 500,
                                  color: "var(--charcoal)",
                                }}
                              >
                                ₹{(item.price * item.qty).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--light-gray)",
                            padding: "6px",
                            alignSelf: "flex-start",
                            flexShrink: 0,
                            borderRadius: "6px",
                            transition: "color 0.2s",
                          }}
                          aria-label={`Remove ${item.name}`}
                          title="Remove item"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/shop"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "0.78rem",
                    color: "var(--gold)",
                    textDecoration: "none",
                    letterSpacing: "0.1em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>

              {/* Right: Order Summary */}
              <div className="cart-summary-col">
                <div
                  style={{
                    background: "var(--white)",
                    borderRadius: "8px",
                    border: "1px solid var(--beige)",
                    padding: "1.75rem",
                  }}
                >
                  <h2
                    className="font-serif"
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 400,
                      color: "var(--charcoal)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Order Summary
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.875rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.83rem",
                          color: "var(--warm-gray)",
                        }}
                      >
                        Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                      </span>
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.83rem",
                          color: "var(--charcoal)",
                          fontWeight: 600,
                        }}
                      >
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.83rem",
                          color: "var(--warm-gray)",
                        }}
                      >
                        Shipping
                      </span>
                      <span
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.83rem",
                          color: "var(--warm-gray)",
                        }}
                      >
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid var(--beige)",
                      marginBottom: "1.25rem",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <span
                      className="font-serif"
                      style={{ fontSize: "1.1rem", color: "var(--charcoal)" }}
                    >
                      Total
                    </span>
                    <span
                      className="font-serif"
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        color: "var(--charcoal)",
                      }}
                    >
                      ₹{total.toLocaleString()}
                    </span>
                  </div>

                  {/* Out of stock warning banner */}
                  {hasOutOfStock && (
                    <div
                      style={{
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        borderRadius: "8px",
                        padding: "0.75rem 0.9rem",
                        color: "#be123c",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.78rem",
                        marginBottom: "1.25rem",
                        lineHeight: 1.4,
                      }}
                    >
                      ⚠️ Some items in your cart are out of stock. Please remove them before checking out.
                    </div>
                  )}

                  {/* Auth gate & Proceed to Checkout */}
                  {authLoading ? (
                    <div
                      style={{
                        width: "100%",
                        padding: "1rem",
                        textAlign: "center",
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.8rem",
                        color: "var(--warm-gray)",
                      }}
                    >
                      Loading...
                    </div>
                  ) : hasOutOfStock ? (
                    <button
                      type="button"
                      disabled
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        fontSize: "0.82rem",
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        background: "#e5e7eb",
                        color: "#9ca3af",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "not-allowed",
                        fontFamily: "'Jost', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      Resolve Out of Stock Items
                    </button>
                  ) : user ? (
                    <Link
                      href="/checkout"
                      className="btn-gold"
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        fontSize: "0.82rem",
                        padding: "1rem",
                        display: "flex",
                      }}
                    >
                      Proceed to Checkout
                      <ArrowRight size={15} style={{ marginLeft: "6px" }} />
                    </Link>
                  ) : (
                    <div>
                      <Link
                        href="/login?redirect=/checkout"
                        className="btn-gold"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          fontSize: "0.82rem",
                          padding: "1rem",
                          display: "flex",
                        }}
                      >
                        Login to Proceed
                        <ArrowRight size={15} style={{ marginLeft: "6px" }} />
                      </Link>
                      <p
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.72rem",
                          color: "var(--warm-gray)",
                          textAlign: "center",
                          marginTop: "0.75rem",
                          lineHeight: 1.5,
                        }}
                      >
                        Please login or{" "}
                        <Link
                          href="/register?redirect=/checkout"
                          style={{ color: "var(--gold)", textDecoration: "none" }}
                        >
                          create an account
                        </Link>{" "}
                        to proceed with your order.
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      justifyContent: "center",
                      marginTop: "1.25rem",
                    }}
                  >
                    {["UPI", "Cards", "COD"].map((m) => (
                      <span
                        key={m}
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: "0.68rem",
                          color: "var(--light-gray)",
                          letterSpacing: "0.08em",
                          background: "var(--cream)",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "3px",
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
