"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  productId?: {
    _id: string;
    name: string;
    images?: string[];
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentId?: string;
  razorpayOrderId?: string;
  createdAt: string;
  shippingAddress?: {
    name: string;
    city: string;
    pincode: string;
  };
}

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  processing: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  shipped: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  delivered: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  cancelled: { bg: "#fff1f2", color: "#be123c", border: "#fecdd3" },
};

const STATUS_STEPS = ["processing", "shipped", "delivered"];

export default function OrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !token) return;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/orders?limit=20", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (authLoading) {
    return <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Jost', sans-serif", color: "var(--warm-gray)" }}>Loading...</div>
    </div>;
  }

  if (!user) return null;

  return (
    <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
      {/* Page Header */}
      <section style={{ background: "var(--charcoal)", padding: "4rem 1.5rem 3rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold)" }}>
            Your Account
          </span>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 300, color: "var(--ivory)", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            My Orders
          </h1>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>
            Hello, {user.name.split(" ")[0]} — here are all your past orders.
          </p>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding: "3rem 1.25rem 6rem" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>

          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--warm-gray)", fontFamily: "'Jost', sans-serif" }}>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem 1.5rem" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--white)", border: "1px solid var(--beige)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.75rem", fontWeight: 400, color: "var(--charcoal)", marginBottom: "0.75rem" }}>
                No orders yet
              </h2>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", color: "var(--warm-gray)", marginBottom: "2rem" }}>
                Explore our collection and place your first order!
              </p>
              <Link href="/shop" className="btn-gold">Browse Products</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map((order) => {
                const isExpanded = expandedId === order._id;
                const sc = STATUS_COLORS[order.orderStatus] || STATUS_COLORS.processing;
                const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);

                return (
                  <div key={order._id} style={{ background: "var(--white)", borderRadius: "12px", border: "1px solid var(--beige)", overflow: "hidden" }}>
                    {/* Order Header Row */}
                    <div
                      style={{ padding: "1.25rem 1.5rem", cursor: "pointer", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}
                      onClick={() => setExpandedId(isExpanded ? null : order._id)}
                    >
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center" }}>
                        {/* Order ID */}
                        <div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--warm-gray)" }}>Order</div>
                          <div style={{ fontFamily: "monospace", fontSize: "0.88rem", fontWeight: 700, color: "var(--charcoal)" }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--warm-gray)" }}>Placed</div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--charcoal)" }}>{formatDate(order.createdAt)}</div>
                        </div>

                        {/* Items count */}
                        <div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--warm-gray)" }}>Items</div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.85rem", color: "var(--charcoal)" }}>{order.items?.length ?? 0}</div>
                        </div>

                        {/* Total */}
                        <div>
                          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--warm-gray)" }}>Total</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontWeight: 600, color: "var(--charcoal)" }}>{formatCurrency(order.totalAmount)}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        {/* Payment badge */}
                        <span style={{
                          padding: "0.22rem 0.65rem",
                          borderRadius: "20px",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: order.paymentStatus === "paid" ? "#ecfdf5" : order.paymentStatus === "failed" ? "#fff1f2" : "#fffbeb",
                          color: order.paymentStatus === "paid" ? "#047857" : order.paymentStatus === "failed" ? "#be123c" : "#b45309",
                          border: order.paymentStatus === "paid" ? "1px solid #a7f3d0" : order.paymentStatus === "failed" ? "1px solid #fecdd3" : "1px solid #fde68a",
                        }}>
                          {order.paymentStatus === "paid"
                            ? (!order.razorpayOrderId && !order.paymentId ? "✓ Paid (COD)" : "✓ Paid")
                            : (!order.razorpayOrderId && !order.paymentId ? "COD • Pending" : "Payment Pending")}
                        </span>

                        {/* Status badge */}
                        <span style={{ padding: "0.22rem 0.65rem", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {order.orderStatus}
                        </span>

                        {/* Expand chevron */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5" style={{ transition: "transform 0.25s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div style={{ borderTop: "1px solid var(--beige)", padding: "1.25rem 1.5rem", background: "var(--cream)" }}>

                        {/* Progress stepper (only if not cancelled) */}
                        {order.orderStatus !== "cancelled" && (
                          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", gap: 0 }}>
                            {STATUS_STEPS.map((step, i) => {
                              const done = i <= stepIdx;
                              return (
                                <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : 0 }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? "var(--gold)" : "var(--beige)", border: `2px solid ${done ? "var(--gold)" : "var(--beige)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                                    </div>
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: done ? "var(--gold)" : "var(--light-gray)", whiteSpace: "nowrap" }}>{step}</span>
                                  </div>
                                  {i < STATUS_STEPS.length - 1 && (
                                    <div style={{ flex: 1, height: "2px", background: i < stepIdx ? "var(--gold)" : "var(--beige)", margin: "0 4px", marginBottom: "20px" }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Items list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.875rem", background: "var(--white)", padding: "0.875rem 1rem", borderRadius: "8px", border: "1px solid var(--beige)" }}>
                              <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: "var(--ivory)", border: "1px solid var(--beige)", overflow: "hidden", position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {item.productId?.images?.[0] ? (
                                  <Image src={item.productId.images[0]} alt={item.productId.name || "Product"} fill sizes="44px" style={{ objectFit: "cover" }} />
                                ) : (
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--light-gray)" strokeWidth="1.5">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                                  </svg>
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.88rem", fontWeight: 500, color: "var(--charcoal)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.productId?.name || "Product"}
                                </div>
                                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.75rem", color: "var(--warm-gray)" }}>
                                  Qty: {item.quantity} × {formatCurrency(item.price)}
                                </div>
                              </div>
                              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontWeight: 600, color: "var(--charcoal)", flexShrink: 0 }}>
                                {formatCurrency(item.quantity * item.price)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Payment Status Card */}
                        <div style={{
                          marginTop: "1.25rem",
                          padding: "0.875rem 1.15rem",
                          borderRadius: "10px",
                          background: order.paymentStatus === "paid" ? "#f0fdf4" : "#fffbeb",
                          border: `1px solid ${order.paymentStatus === "paid" ? "#bbf7d0" : "#fef08a"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                        }}>
                          <div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: order.paymentStatus === "paid" ? "#166534" : "#92400e" }}>
                              {(!order.razorpayOrderId && !order.paymentId) ? "Cash on Delivery" : "Online Payment"}
                            </div>
                            <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.82rem", color: order.paymentStatus === "paid" ? "#15803d" : "#78350f", marginTop: "2px" }}>
                              {order.paymentStatus === "paid"
                                ? ((!order.razorpayOrderId && !order.paymentId)
                                    ? "✓ Cash payment received and confirmed by store."
                                    : "✓ Paid online via Razorpay.")
                                : "⏳ Payment Pending: Admin will call you on your mobile no. and collect payment before shipping your order."}
                            </div>
                          </div>
                          <span style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "20px",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: order.paymentStatus === "paid" ? "#dcfce7" : "#fef9c3",
                            color: order.paymentStatus === "paid" ? "#15803d" : "#854d0e",
                            border: `1px solid ${order.paymentStatus === "paid" ? "#86efac" : "#fde047"}`,
                          }}>
                            {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                        </div>

                        {/* Total row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--beige)" }}>
                          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.78rem", color: "var(--warm-gray)" }}>
                            Method: <strong style={{ color: "var(--charcoal)" }}>{(!order.razorpayOrderId && !order.paymentId) ? "Cash on Delivery" : "Razorpay Online"}</strong>
                          </span>
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", fontWeight: 600, color: "var(--charcoal)" }}>
                            Total: {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
