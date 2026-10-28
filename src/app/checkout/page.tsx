"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

type Step = "address" | "payment" | "confirmed";
type PaymentMethod = "cod" | "online" | null;

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

const empty: Address = {
  firstName: "", lastName: "", phone: "",
  line1: "", line2: "", city: "", state: "", pincode: "",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--warm-gray)", display: "block", marginBottom: "0.35rem" }}>
      {children}
    </span>
  );
}

function StepDot({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
        background: done ? "var(--gold)" : active ? "var(--charcoal)" : "transparent",
        border: `1px solid ${done || active ? "transparent" : "rgba(255,255,255,0.2)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s",
      }}>
        {done ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        ) : (
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: active ? "white" : "rgba(255,255,255,0.4)" }}>{num}</span>
        )}
      </div>
      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: active ? "white" : done ? "var(--gold)" : "rgba(255,255,255,0.35)", fontWeight: active ? 500 : 400 }}>
        {label}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, clearCart, revalidateCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("address");
  const [addr, setAddr] = useState<Address>(empty);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; total: number } | null>(null);
  const [showOnlineMsg, setShowOnlineMsg] = useState(false);

  // Pre-validate inventory on checkout load
  useEffect(() => {
    revalidateCart();
  }, [revalidateCart]);

  // Pre-fill name from user if available
  useEffect(() => {
    if (user && !addr.firstName) {
      const parts = user.name.split(" ");
      setAddr((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
      }));
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !token) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, token, router]);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal;

  const set = (k: keyof Address, v: string) => {
    setAddr((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<Address> = {};
    if (!addr.firstName.trim()) e.firstName = "Required";
    if (!addr.lastName.trim()) e.lastName = "Required";
    if (!addr.phone.trim() || !/^[6-9]\d{9}$/.test(addr.phone.replace(/\s/g, ""))) e.phone = "Valid 10-digit mobile required";
    if (!addr.line1.trim()) e.line1 = "Required";
    if (!addr.city.trim()) e.city = "Required";
    if (!addr.state) e.state = "Required";
    if (!addr.pincode.trim() || !/^\d{6}$/.test(addr.pincode)) e.pincode = "6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", boxSizing: "border-box",
    background: "var(--cream)", border: `1px solid ${err ? "#fecdd3" : "var(--beige)"}`,
    borderRadius: "8px", padding: "0.7rem 0.9rem",
    fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--charcoal)",
    outline: "none", transition: "border-color 0.2s",
  });

  const errStyle: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", color: "#be123c", marginTop: "0.2rem",
  };

  const handlePlaceCOD = async () => {
    if (!token) return;
    setPlacing(true);
    setPlaceError("");
    try {
      const payload = {
        items: items.map((item) => ({
          productId: String(item.id),
          quantity: item.qty,
          price: item.price,
        })),
        paymentMethod: "cod",
        shippingAddress: {
          name: `${addr.firstName} ${addr.lastName}`.trim(),
          phone: addr.phone,
          address: addr.line1 + (addr.line2 ? `, ${addr.line2}` : ""),
          city: addr.city,
          pincode: addr.pincode,
        },
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        setConfirmedOrder({ id: data.data._id, total });
        setStep("confirmed");
      } else {
        setPlaceError(data.error || "Failed to place order. Please try again.");
      }
    } catch {
      setPlaceError("Network error. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // Empty cart guard (not after confirmation)
  if (items.length === 0 && step !== "confirmed") {
    return (
      <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
        <section style={{ background: "var(--charcoal)", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <span className="section-label" style={{ color: "var(--gold)" }}>Checkout</span>
            <h1 className="font-serif" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 300, color: "var(--ivory)", marginTop: "0.5rem" }}>
              Your cart is empty
            </h1>
          </div>
        </section>
        <div style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
          <p style={{ fontFamily: "'Jost', sans-serif", color: "var(--warm-gray)", marginBottom: "2rem" }}>Add products to your cart before checking out.</p>
          <Link href="/shop" className="btn-gold">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* Dark Header */}
      <section style={{ background: "var(--charcoal)", padding: "3.5rem 1.5rem 3rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>Secure Checkout</span>
          <h1 className="font-serif" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 300, color: "var(--ivory)", marginTop: "0.4rem", marginBottom: "2rem" }}>
            {step === "confirmed" ? "Order Confirmed" : "Complete Your Order"}
          </h1>

          {step !== "confirmed" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <StepDot num={1} label="Address" active={step === "address"} done={step === "payment"} />
              <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.15)" }} />
              <StepDot num={2} label="Payment" active={step === "payment"} done={false} />
            </div>
          )}
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "3rem 1.25rem 6rem" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>

          {/* ─── CONFIRMED ─── */}
          {step === "confirmed" && confirmedOrder && (
            <div style={{ textAlign: "center", maxWidth: "520px", margin: "0 auto", padding: "3rem 1.5rem" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--gold), var(--gold-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 2rem", boxShadow: "0 12px 36px rgba(184,157,114,0.3)",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-serif" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 300, color: "var(--charcoal)", marginBottom: "0.75rem" }}>
                Thank you, {addr.firstName}!
              </h2>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", color: "var(--warm-gray)", lineHeight: 1.8, marginBottom: "0.5rem" }}>
                Your order <strong style={{ color: "var(--charcoal)", fontFamily: "monospace" }}>#{confirmedOrder.id.slice(-6).toUpperCase()}</strong> has been placed successfully.
              </p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--light-gray)", marginBottom: "1.25rem" }}>
                Payment: <strong>Cash on Delivery</strong> · Total: <strong>₹{confirmedOrder.total.toLocaleString()}</strong>
              </p>

              {/* Call notice banner */}
              <div style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                textAlign: "left",
              }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Payment Pending
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "#b45309", marginTop: "2px", lineHeight: 1.5 }}>
                    Admin will call you on your mobile no. and collect payment before shipping your order.
                  </div>
                </div>
              </div>

              {/* Email confirmation notice banner */}
              <div style={{
                background: "#ffffff",
                border: "1px solid var(--beige)",
                borderRadius: "12px",
                padding: "1.25rem 1.5rem",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                textAlign: "left",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(184, 157, 114, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px"
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", fontWeight: 600, color: "var(--charcoal)", marginBottom: "0.25rem" }}>
                    Order Placed Successfully!
                  </div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)", margin: 0, lineHeight: 1.6 }}>
                    Please check your registered email for order details and updates. <strong style={{ color: "#b45309" }}>Kindly check your spam/junk folder as well</strong> in case it landed there.
                  </p>
                </div>
              </div>

              <div style={{ background: "var(--white)", border: "1px solid var(--beige)", borderRadius: "8px", padding: "1.5rem", marginBottom: "2.5rem", textAlign: "left" }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.75rem" }}>Delivering to</div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--charcoal)", lineHeight: 1.8 }}>
                  {addr.firstName} {addr.lastName}<br />
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.state} – {addr.pincode}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/orders" className="btn-gold">View My Orders</Link>
                <Link href="/shop" className="btn-outline">Continue Shopping</Link>
              </div>
            </div>
          )}

          {/* ─── ADDRESS + PAYMENT ─── */}
          {step !== "confirmed" && (
            <div className="checkout-layout">

              {/* LEFT column */}
              <div className="checkout-form-col">

                {/* ── Step 1: Address ── */}
                {step === "address" && (
                  <div style={{ background: "var(--white)", borderRadius: "12px", border: "1px solid var(--beige)", padding: "2rem" }}>
                    <h2 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.25rem" }}>Delivery Address</h2>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--light-gray)", marginBottom: "1.75rem" }}>
                      Enter the address where you&apos;d like your order delivered.
                    </p>

                    {/* Name row */}
                    <div className="checkout-2col" style={{ marginBottom: "1.25rem" }}>
                      <div>
                        <FieldLabel>First Name *</FieldLabel>
                        <input style={inputStyle(errors.firstName)} placeholder="Priya" value={addr.firstName} onChange={(e) => set("firstName", e.target.value)} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = errors.firstName ? "#fecdd3" : "var(--beige)")} />
                        {errors.firstName && <div style={errStyle}>{errors.firstName}</div>}
                      </div>
                      <div>
                        <FieldLabel>Last Name *</FieldLabel>
                        <input style={inputStyle(errors.lastName)} placeholder="Sharma" value={addr.lastName} onChange={(e) => set("lastName", e.target.value)} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = errors.lastName ? "#fecdd3" : "var(--beige)")} />
                        {errors.lastName && <div style={errStyle}>{errors.lastName}</div>}
                      </div>
                    </div>

                    {/* Phone */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <FieldLabel>Mobile Number *</FieldLabel>
                      <input style={inputStyle(errors.phone)} placeholder="9876543210" type="tel" maxLength={10} value={addr.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#fecdd3" : "var(--beige)")} />
                      {errors.phone && <div style={errStyle}>{errors.phone}</div>}
                    </div>

                    {/* Address Lines */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <FieldLabel>House / Flat / Building *</FieldLabel>
                      <input style={inputStyle(errors.line1)} placeholder="Flat 4B, Rosewood Apartments" value={addr.line1} onChange={(e) => set("line1", e.target.value)} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = errors.line1 ? "#fecdd3" : "var(--beige)")} />
                      {errors.line1 && <div style={errStyle}>{errors.line1}</div>}
                    </div>
                    <div style={{ marginBottom: "1.25rem" }}>
                      <FieldLabel>Street / Area / Landmark</FieldLabel>
                      <input style={inputStyle()} placeholder="Near Central Park, MG Road" value={addr.line2} onChange={(e) => set("line2", e.target.value)} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = "var(--beige)")} />
                    </div>

                    {/* City / State */}
                    <div className="checkout-2col" style={{ marginBottom: "1.25rem" }}>
                      <div>
                        <FieldLabel>City *</FieldLabel>
                        <input style={inputStyle(errors.city)} placeholder="Bengaluru" value={addr.city} onChange={(e) => set("city", e.target.value)} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = errors.city ? "#fecdd3" : "var(--beige)")} />
                        {errors.city && <div style={errStyle}>{errors.city}</div>}
                      </div>
                      <div>
                        <FieldLabel>State *</FieldLabel>
                        <select value={addr.state} onChange={(e) => set("state", e.target.value)} style={{ ...inputStyle(errors.state), appearance: "none", cursor: "pointer", color: addr.state ? "var(--charcoal)" : "var(--light-gray)" }}>
                          <option value="" disabled>Select state</option>
                          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.state && <div style={errStyle}>{errors.state}</div>}
                      </div>
                    </div>

                    {/* Pincode */}
                    <div style={{ marginBottom: "1.75rem" }}>
                      <FieldLabel>Pincode *</FieldLabel>
                      <input style={inputStyle(errors.pincode)} placeholder="560001" maxLength={6} value={addr.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} onFocus={(e) => (e.target.style.borderColor = "var(--gold)")} onBlur={(e) => (e.target.style.borderColor = errors.pincode ? "#fecdd3" : "var(--beige)")} />
                      {errors.pincode && <div style={errStyle}>{errors.pincode}</div>}
                    </div>

                    <button
                      onClick={() => { if (validate()) setStep("payment"); }}
                      className="btn-gold"
                      style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "0.82rem" }}
                    >
                      Continue to Payment
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}

                {/* ── Step 2: Payment ── */}
                {step === "payment" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {/* Address summary */}
                    <div style={{ background: "var(--white)", borderRadius: "12px", border: "1px solid var(--beige)", padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span className="font-serif" style={{ fontSize: "0.95rem", color: "var(--charcoal)" }}>Delivery Address</span>
                        </div>
                        <button onClick={() => setStep("address")} style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--gold)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "3px" }}>Edit</button>
                      </div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--charcoal)", lineHeight: 1.9 }}>
                        <strong>{addr.firstName} {addr.lastName}</strong> · {addr.phone}<br />
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                        {addr.city}, {addr.state} – {addr.pincode}
                      </div>
                    </div>

                    {/* Payment method selection */}
                    <div style={{ background: "var(--white)", borderRadius: "12px", border: "1px solid var(--beige)", padding: "1.5rem" }}>
                      <h3 className="font-serif" style={{ fontSize: "1.1rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1.25rem" }}>
                        Choose Payment Method
                      </h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* COD option */}
                        <button
                          onClick={() => { setPaymentMethod("cod"); setShowOnlineMsg(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: "1rem",
                            padding: "1.1rem 1.25rem", borderRadius: "10px", cursor: "pointer",
                            border: `2px solid ${paymentMethod === "cod" ? "var(--gold)" : "var(--beige)"}`,
                            background: paymentMethod === "cod" ? "rgba(184,157,114,0.06)" : "var(--cream)",
                            textAlign: "left", transition: "all 0.2s",
                          }}
                        >
                          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--ivory)", border: "1px solid var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M3 9l2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/>
                              <line x1="12" y1="3" x2="12" y2="9"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "var(--charcoal)" }}>Cash on Delivery</div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--warm-gray)", marginTop: "2px" }}>Pay when your order arrives</div>
                          </div>
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${paymentMethod === "cod" ? "var(--gold)" : "var(--beige)"}`, background: paymentMethod === "cod" ? "var(--gold)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {paymentMethod === "cod" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white" }} />}
                          </div>
                        </button>

                        {/* Online option */}
                        <button
                          onClick={() => { setPaymentMethod("online"); setShowOnlineMsg(true); }}
                          style={{
                            display: "flex", alignItems: "center", gap: "1rem",
                            padding: "1.1rem 1.25rem", borderRadius: "10px", cursor: "pointer",
                            border: `2px solid ${paymentMethod === "online" ? "#1d4ed8" : "var(--beige)"}`,
                            background: paymentMethod === "online" ? "rgba(29,78,216,0.04)" : "var(--cream)",
                            textAlign: "left", transition: "all 0.2s",
                          }}
                        >
                          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--ivory)", border: "1px solid var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.5">
                              <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "var(--charcoal)" }}>
                              Pay Online
                              <span style={{ marginLeft: "8px", fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", fontWeight: 600, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.06em" }}>COMING SOON</span>
                            </div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--warm-gray)", marginTop: "2px" }}>UPI, Cards, Net Banking via Razorpay</div>
                          </div>
                          <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${paymentMethod === "online" ? "#1d4ed8" : "var(--beige)"}`, background: paymentMethod === "online" ? "#1d4ed8" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {paymentMethod === "online" && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white" }} />}
                          </div>
                        </button>
                      </div>

                      {/* Online coming soon message */}
                      {showOnlineMsg && (
                        <div style={{ marginTop: "1rem", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "1.25rem 1.5rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          <div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#1e40af", marginBottom: "0.3rem" }}>
                              We&apos;re working on this!
                            </div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.8rem", color: "#3b82f6", lineHeight: 1.6 }}>
                              Online payment will be available soon. Please select <strong>Cash on Delivery</strong> to place your order right now.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error with return to cart link */}
                    {placeError && (
                      <div style={{ background: "#fff5f5", border: "1px solid #fecdd3", borderRadius: "8px", padding: "1rem", fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "#be123c", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div>{placeError}</div>
                        <div>
                          <Link href="/cart" style={{ color: "var(--gold)", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                            ← Return to Cart to adjust quantities
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setStep("address")}
                        className="btn-outline"
                        style={{ flex: "1 1 120px", justifyContent: "center", padding: "0.9rem", fontSize: "0.78rem" }}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={handlePlaceCOD}
                        disabled={paymentMethod !== "cod" || placing}
                        className="btn-gold"
                        style={{
                          flex: "2 1 200px", justifyContent: "center", padding: "0.9rem", fontSize: "0.82rem",
                          opacity: paymentMethod !== "cod" || placing ? 0.5 : 1,
                          cursor: paymentMethod !== "cod" || placing ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", gap: "0.5rem",
                        }}
                      >
                        {placing ? (
                          <>
                            <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                            Placing Order...
                          </>
                        ) : (
                          <>
                            Confirm COD Order · ₹{total.toLocaleString()}
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                          </>
                        )}
                      </button>
                    </div>

                    {paymentMethod !== "cod" && paymentMethod !== null && (
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--warm-gray)", textAlign: "center" }}>
                        Select Cash on Delivery to place your order.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT: Order Summary */}
              <div className="checkout-summary-col">
                <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "1.75rem", position: "sticky", top: "100px" }}>
                  <h2 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1.5rem" }}>
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: "var(--ivory)", border: "1px solid var(--beige)", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="44px" style={{ objectFit: "cover" }} />
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="m21 15-5-5L5 21"/><circle cx="8.5" cy="8.5" r="1.5"/>
                            </svg>
                          )}
                          <span style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--charcoal)", color: "white", fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>{item.qty}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--charcoal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.68rem", color: "var(--light-gray)" }}>{item.category}</div>
                        </div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)", flexShrink: 0 }}>₹{(item.price * item.qty).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--beige)", margin: "1.25rem 0" }} />

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Subtotal</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--charcoal)" }}>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>Shipping</span>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: "var(--warm-gray)" }}>TBD</span>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--beige)", margin: "1rem 0 1.25rem" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <span className="font-serif" style={{ fontSize: "1.1rem", color: "var(--charcoal)" }}>Total</span>
                    <span className="font-serif" style={{ fontSize: "1.2rem", color: "var(--charcoal)" }}>₹{total.toLocaleString()}</span>
                  </div>

                  {/* Trust badges */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {[
                      { icon: "🔒", text: "SSL encrypted & secure" },
                      { icon: "📦", text: "Cash on Delivery available" },
                      { icon: "🤝", text: "All sales are final" },
                    ].map((b) => (
                      <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "0.85rem" }}>{b.icon}</span>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--warm-gray)" }}>{b.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}
