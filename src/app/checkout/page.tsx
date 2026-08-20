"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type Step = "address" | "review" | "confirmed";

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
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const empty: Address = {
  firstName: "", lastName: "", email: "", phone: "",
  line1: "", line2: "", city: "", state: "", pincode: "", country: "India",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: "'Jost', sans-serif", fontSize: "0.65rem",
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: "var(--warm-gray)", display: "block", marginBottom: "0.3rem",
    }}>
      {children}
    </span>
  );
}

function StepBadge({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
        background: done ? "var(--gold)" : active ? "var(--charcoal)" : "transparent",
        border: `1px solid ${done || active ? "transparent" : "var(--beige)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.35s ease",
      }}>
        {done ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", fontWeight: 500, color: active ? "white" : "var(--light-gray)" }}>
            {num}
          </span>
        )}
      </div>
      <span style={{
        fontFamily: "'Jost', sans-serif", fontSize: "0.72rem",
        letterSpacing: "0.12em", textTransform: "uppercase",
        color: active ? "var(--charcoal)" : done ? "var(--gold)" : "var(--light-gray)",
        fontWeight: active ? 500 : 400, transition: "color 0.35s ease",
      }}>
        {label}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  const { items } = useCart();
  const [step, setStep] = useState<Step>("address");
  const [addr, setAddr] = useState<Address>(empty);
  const [errors, setErrors] = useState<Partial<Address>>({});
  const [orderId] = useState(() => `LE${Math.floor(100000 + Math.random() * 900000)}`);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const set = (k: keyof Address, v: string) => {
    setAddr((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<Address> = {};
    if (!addr.firstName.trim()) e.firstName = "Required";
    if (!addr.lastName.trim()) e.lastName = "Required";
    if (!addr.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) e.email = "Valid email required";
    if (!addr.phone.trim() || !/^[6-9]\d{9}$/.test(addr.phone.replace(/\s/g, ""))) e.phone = "Valid 10-digit mobile required";
    if (!addr.line1.trim()) e.line1 = "Required";
    if (!addr.city.trim()) e.city = "Required";
    if (!addr.state) e.state = "Required";
    if (!addr.pincode.trim() || !/^\d{6}$/.test(addr.pincode)) e.pincode = "6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1.5px solid ${err ? "#c0392b" : "var(--beige)"}`,
    padding: "0.7rem 0",
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.9rem",
    color: "var(--charcoal)",
    outline: "none",
    transition: "border-color 0.3s ease",
    borderRadius: 0,
  });

  const errStyle: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.65rem",
    color: "#c0392b",
    marginTop: "0.25rem",
    letterSpacing: "0.05em",
  };

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
          <p style={{ fontFamily: "'Jost', sans-serif", color: "var(--warm-gray)", marginBottom: "2rem" }}>
            Add products to your cart before checking out.
          </p>
          <Link href="/shop" className="btn-gold">Browse Products</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* ── Dark Header ── */}
      <section style={{ background: "var(--charcoal)", padding: "3.5rem 1.5rem 3rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span className="section-label" style={{ color: "var(--gold)" }}>Secure Checkout</span>
          <h1 className="font-serif" style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)", fontWeight: 300, color: "var(--ivory)", marginTop: "0.4rem", marginBottom: "2rem" }}>
            {step === "confirmed" ? "Order Confirmed" : "Complete Your Order"}
          </h1>

          {/* Step indicators */}
          {step !== "confirmed" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <StepBadge num={1} label="Address" active={step === "address"} done={step === "review"} />
              <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.15)" }} />
              <StepBadge num={2} label="Review" active={step === "review"} done={false} />
            </div>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ padding: "3rem 1.25rem 6rem" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>

          {/* ═══════ CONFIRMED ═══════ */}
          {step === "confirmed" && (
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
                Your order <strong style={{ color: "var(--charcoal)" }}>#{orderId}</strong> has been placed successfully.
              </p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--light-gray)", marginBottom: "2.5rem" }}>
                A confirmation will be sent to <strong>{addr.email}</strong>
              </p>

              <div style={{ background: "var(--white)", border: "1px solid var(--beige)", borderRadius: "8px", padding: "1.5rem", marginBottom: "2.5rem", textAlign: "left" }}>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.75rem" }}>
                  Delivering to
                </div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--charcoal)", lineHeight: 1.8 }}>
                  {addr.firstName} {addr.lastName}<br />
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.state} – {addr.pincode}<br />
                  {addr.country}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/shop" className="btn-gold">Continue Shopping</Link>
                <Link href="/" className="btn-outline">Back to Home</Link>
              </div>
            </div>
          )}

          {/* ═══════ ADDRESS + REVIEW ═══════ */}
          {step !== "confirmed" && (
            <div className="checkout-layout">

              {/* ── LEFT: form ── */}
              <div className="checkout-form-col">

                {/* ─── step 1: Address ─── */}
                {step === "address" && (
                  <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "2rem" }}>
                    <h2 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.25rem" }}>
                      Delivery Address
                    </h2>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--light-gray)", marginBottom: "2rem", letterSpacing: "0.04em" }}>
                      Enter the address where you'd like your order delivered.
                    </p>

                    {/* Name row */}
                    <div className="checkout-2col" style={{ marginBottom: "1.5rem" }}>
                      <div>
                        <FieldLabel>First Name *</FieldLabel>
                        <input
                          style={inputStyle(errors.firstName)}
                          placeholder="Priya"
                          value={addr.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                        />
                        {errors.firstName && <div style={errStyle}>{errors.firstName}</div>}
                      </div>
                      <div>
                        <FieldLabel>Last Name *</FieldLabel>
                        <input
                          style={inputStyle(errors.lastName)}
                          placeholder="Sharma"
                          value={addr.lastName}
                          onChange={(e) => set("lastName", e.target.value)}
                        />
                        {errors.lastName && <div style={errStyle}>{errors.lastName}</div>}
                      </div>
                    </div>

                    {/* Contact row */}
                    <div className="checkout-2col" style={{ marginBottom: "1.5rem" }}>
                      <div>
                        <FieldLabel>Email Address *</FieldLabel>
                        <input
                          style={inputStyle(errors.email)}
                          placeholder="priya@example.com"
                          type="email"
                          value={addr.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                        {errors.email && <div style={errStyle}>{errors.email}</div>}
                      </div>
                      <div>
                        <FieldLabel>Mobile Number *</FieldLabel>
                        <input
                          style={inputStyle(errors.phone)}
                          placeholder="9876543210"
                          type="tel"
                          maxLength={10}
                          value={addr.phone}
                          onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                        />
                        {errors.phone && <div style={errStyle}>{errors.phone}</div>}
                      </div>
                    </div>

                    {/* Address Lines */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <FieldLabel>House / Flat / Building *</FieldLabel>
                      <input
                        style={inputStyle(errors.line1)}
                        placeholder="Flat 4B, Rosewood Apartments"
                        value={addr.line1}
                        onChange={(e) => set("line1", e.target.value)}
                      />
                      {errors.line1 && <div style={errStyle}>{errors.line1}</div>}
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <FieldLabel>Street / Area / Landmark</FieldLabel>
                      <input
                        style={inputStyle()}
                        placeholder="Near Central Park, MG Road"
                        value={addr.line2}
                        onChange={(e) => set("line2", e.target.value)}
                      />
                    </div>

                    {/* City / State */}
                    <div className="checkout-2col" style={{ marginBottom: "1.5rem" }}>
                      <div>
                        <FieldLabel>City *</FieldLabel>
                        <input
                          style={inputStyle(errors.city)}
                          placeholder="Bengaluru"
                          value={addr.city}
                          onChange={(e) => set("city", e.target.value)}
                        />
                        {errors.city && <div style={errStyle}>{errors.city}</div>}
                      </div>
                      <div>
                        <FieldLabel>State *</FieldLabel>
                        <select
                          value={addr.state}
                          onChange={(e) => set("state", e.target.value)}
                          style={{
                            ...inputStyle(errors.state),
                            appearance: "none",
                            cursor: "pointer",
                            background: "transparent",
                            color: addr.state ? "var(--charcoal)" : "var(--light-gray)",
                          }}
                        >
                          <option value="" disabled>Select state</option>
                          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.state && <div style={errStyle}>{errors.state}</div>}
                      </div>
                    </div>

                    {/* Pincode / Country */}
                    <div className="checkout-2col" style={{ marginBottom: "2rem" }}>
                      <div>
                        <FieldLabel>Pincode *</FieldLabel>
                        <input
                          style={inputStyle(errors.pincode)}
                          placeholder="560001"
                          maxLength={6}
                          value={addr.pincode}
                          onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                        />
                        {errors.pincode && <div style={errStyle}>{errors.pincode}</div>}
                      </div>
                      <div>
                        <FieldLabel>Country</FieldLabel>
                        <input
                          style={{ ...inputStyle(), color: "var(--light-gray)" }}
                          value="India"
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Trust line */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)", letterSpacing: "0.06em" }}>
                        Your address is encrypted and never shared.
                      </span>
                    </div>

                    <button
                      onClick={() => { if (validate()) setStep("review"); }}
                      className="btn-gold"
                      style={{ width: "100%", justifyContent: "center", padding: "1rem", fontSize: "0.82rem" }}
                    >
                      Continue to Review
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* ─── step 2: Review ─── */}
                {step === "review" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    {/* Address summary card */}
                    <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "1.5rem 2rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                          <span className="font-serif" style={{ fontSize: "1rem", color: "var(--charcoal)" }}>Delivery Address</span>
                        </div>
                        <button
                          onClick={() => setStep("address")}
                          style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--gold)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "3px" }}
                        >
                          Edit
                        </button>
                      </div>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--charcoal)", lineHeight: 1.9 }}>
                        <strong>{addr.firstName} {addr.lastName}</strong> &nbsp;·&nbsp; {addr.phone}<br />
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                        {addr.city}, {addr.state} – {addr.pincode}<br />
                        {addr.email}
                      </div>
                    </div>

                    {/* Items review */}
                    <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "1.5rem 2rem" }}>
                      <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1rem" }}>
                        Order Items
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                        {items.map((item) => (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: `${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.7), ${item.color}88)`, border: "1px solid rgba(255,255,255,0.5)" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="font-serif" style={{ fontSize: "0.9rem", color: "var(--charcoal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)" }}>Qty: {item.qty}</div>
                            </div>
                            <div className="font-serif" style={{ fontSize: "0.95rem", color: "var(--charcoal)", flexShrink: 0 }}>₹{(item.price * item.qty).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment note */}
                    <div style={{ background: "var(--ivory)", borderRadius: "8px", border: "1px solid var(--beige)", padding: "1.25rem 1.5rem", display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", fontWeight: 500, color: "var(--charcoal)", marginBottom: "0.25rem", letterSpacing: "0.06em" }}>
                          Payment at next step
                        </div>
                        <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", color: "var(--light-gray)", lineHeight: 1.6 }}>
                          You'll securely complete your payment via UPI, Card, or Razorpay after confirming your order.
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setStep("address")}
                        className="btn-outline"
                        style={{ flex: "1 1 120px", justifyContent: "center", padding: "0.9rem", fontSize: "0.78rem" }}
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => setStep("confirmed")}
                        className="btn-gold"
                        style={{ flex: "2 1 200px", justifyContent: "center", padding: "0.9rem", fontSize: "0.82rem" }}
                      >
                        Place Order · ₹{total.toLocaleString()}
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Order Summary ── */}
              <div className="checkout-summary-col">
                <div style={{ background: "var(--white)", borderRadius: "10px", border: "1px solid var(--beige)", padding: "1.75rem", position: "sticky", top: "100px" }}>
                  <h2 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "1.5rem" }}>
                    Order Summary
                  </h2>

                  {/* Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "1.25rem" }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "5px", background: `${item.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                          <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: `radial-gradient(ellipse at 35% 35%, rgba(255,255,255,0.7), ${item.color}88)` }} />
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
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: shipping === 0 ? "#4caf50" : "var(--charcoal)" }}>
                        {shipping === 0 ? "Free ✓" : `₹${shipping}`}
                      </span>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--beige)", margin: "1rem 0 1.25rem" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <span className="font-serif" style={{ fontSize: "1.1rem", color: "var(--charcoal)" }}>Total</span>
                    <span className="font-serif" style={{ fontSize: "1.2rem", color: "var(--charcoal)" }}>₹{total.toLocaleString()}</span>
                  </div>

                  {/* Trust badges */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {[
                      { icon: "🔒", text: "SSL encrypted & secure" },
                      { icon: "🚚", text: shipping === 0 ? "Free delivery on this order" : `Delivery for ₹${shipping}` },
                      { icon: "↩️", text: "Easy 7-day returns" },
                    ].map((b) => (
                      <div key={b.text} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ fontSize: "0.85rem" }}>{b.icon}</span>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", color: "var(--warm-gray)", letterSpacing: "0.04em" }}>{b.text}</span>
                      </div>
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
