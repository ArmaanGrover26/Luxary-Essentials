"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const { user, loading: authLoading } = useAuth();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal;

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* Page Header */}
      <section style={{ background: "var(--charcoal)", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>Your Selection</span>
          <h1 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 300, color: "var(--ivory)", marginTop: "0.5rem" }}>
            Shopping Cart
          </h1>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "3rem 1.25rem 6rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {items.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "var(--white)", border: "1px solid var(--beige)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 2rem",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h2 className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.75rem" }}>
                Your cart is empty
              </h2>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--warm-gray)", marginBottom: "2rem" }}>
                Explore our collection of craft supplies and custom products.
              </p>
              <Link href="/shop" className="btn-gold">Browse Products</Link>
            </div>

          ) : (
            /* Cart layout */
            <div className="cart-page-layout">

              {/* Left: Items */}
              <div className="cart-items-col">
                <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1rem" }}>
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {items.map((item) => (
                    <div key={item.id} className="cart-item-card">

                      {/* Product image */}
                      <div style={{
                        width: "72px", height: "72px", borderRadius: "8px", flexShrink: 0,
                        background: "var(--ivory)", border: "1px solid var(--beige)",
                        overflow: "hidden", position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="72px"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m21 15-5-5L5 21"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.15rem" }}>
                          {item.category}
                        </div>
                        <div className="font-serif" style={{ fontSize: "0.95rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.2rem", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name}
                        </div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--light-gray)" }}>
                          ₹{item.price.toLocaleString()} each
                        </div>

                        {/* Qty + total */}
                        <div className="cart-item-controls">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <button onClick={() => updateQty(item.id, -1)} className="qty-btn" style={{ width: "30px", height: "30px" }}>−</button>
                            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--charcoal)", minWidth: "20px", textAlign: "center" }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="qty-btn" style={{ width: "30px", height: "30px" }}>+</button>
                          </div>
                          <div className="font-serif" style={{ fontSize: "1rem", fontWeight: 400, color: "var(--charcoal)" }}>
                            ₹{(item.price * item.qty).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--light-gray)", padding: "4px", alignSelf: "flex-start", flexShrink: 0 }}
                        aria-label="Remove"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <Link href="/shop" style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--gold)", textDecoration: "none", letterSpacing: "0.1em", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "1.5rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  Continue Shopping
                </Link>
              </div>

              {/* Right: Order Summary */}
              <div className="cart-summary-col">
                <div style={{ background: "var(--white)", borderRadius: "8px", border: "1px solid var(--beige)", padding: "1.75rem" }}>
                  <h2 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1.5rem" }}>
                    Order Summary
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--warm-gray)" }}>
                        Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})
                      </span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--charcoal)" }}>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--warm-gray)" }}>Shipping</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.83rem", color: "var(--warm-gray)" }}>Calculated at checkout</span>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--beige)", marginBottom: "1.25rem" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <span className="font-serif" style={{ fontSize: "1.1rem", color: "var(--charcoal)" }}>Total</span>
                    <span className="font-serif" style={{ fontSize: "1.2rem", color: "var(--charcoal)" }}>₹{total.toLocaleString()}</span>
                  </div>

                  {/* Auth gate */}
                  {authLoading ? (
                    <div style={{ width: "100%", padding: "1rem", textAlign: "center", fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "var(--warm-gray)" }}>
                      Loading...
                    </div>
                  ) : user ? (
                    <Link
                      href="/checkout"
                      className="btn-gold"
                      style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem", padding: "1rem", display: "flex" }}
                    >
                      Proceed to Checkout
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  ) : (
                    <div>
                      <Link
                        href="/login?redirect=/checkout"
                        className="btn-gold"
                        style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem", padding: "1rem", display: "flex" }}
                      >
                        Login to Proceed
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      </Link>
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--warm-gray)", textAlign: "center", marginTop: "0.75rem", lineHeight: 1.5 }}>
                        Please login or{" "}
                        <Link href="/register?redirect=/checkout" style={{ color: "var(--gold)", textDecoration: "none" }}>create an account</Link>
                        {" "}to proceed with your order.
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem" }}>
                    {["UPI", "Cards", "COD"].map((m) => (
                      <span key={m} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.68rem", color: "var(--light-gray)", letterSpacing: "0.08em", background: "var(--cream)", padding: "0.25rem 0.6rem", borderRadius: "3px" }}>{m}</span>
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
