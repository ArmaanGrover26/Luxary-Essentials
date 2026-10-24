"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Layers,
} from "lucide-react";

interface RecentOrder {
  _id: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  userId?: {
    name: string;
    email: string;
  };
}

interface StatsData {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  ordersByStatus: {
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: RecentOrder[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || "Failed to load dashboard statistics");
      }
    } catch {
      setError("An error occurred while fetching stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "processing":
        return { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" };
      case "shipped":
        return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
      case "delivered":
        return { background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" };
      case "cancelled":
        return { background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" };
      default:
        return { background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header Banner */}
      <div style={{
        background: "#ffffff",
        padding: "1.5rem 1.75rem",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "2rem",
            fontWeight: 500,
            color: "#2c2c2c",
            margin: 0,
            lineHeight: 1.2,
          }}>
            Dashboard Overview
          </h1>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.875rem",
            color: "#6b6560",
            marginTop: "0.25rem",
            margin: 0,
          }}>
            Monitor sales, inventory levels, orders, and registered customers.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            onClick={fetchStats}
            disabled={loading}
            style={{
              padding: "0.6rem 1rem",
              background: "#f5f0e8",
              color: "#2c2c2c",
              borderRadius: "10px",
              border: "1px solid #ede5d8",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/new-arrivals"
            style={{
              padding: "0.6rem 1.15rem",
              background: "#f5f0e8",
              color: "#2c2c2c",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid #ede5d8",
            }}
          >
            <Layers size={15} color="#b89d72" />
            <span>New Arrivals</span>
          </Link>
          <Link
            href="/admin/festivals"
            style={{
              padding: "0.6rem 1.15rem",
              background: "#2c2c2c",
              color: "#ffffff",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={15} color="#d4b896" />
            <span>Festival Specials</span>
          </Link>
          <Link
            href="/admin/products?action=new"
            style={{
              padding: "0.6rem 1.25rem",
              background: "#b89d72",
              color: "#ffffff",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(184,157,114,0.3)",
            }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "1rem 1.25rem",
          background: "#fff1f2",
          border: "1px solid #fecdd3",
          borderRadius: "12px",
          color: "#be123c",
          fontSize: "0.875rem",
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: "120px",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #ede5d8",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "1.25rem",
          }}>
            {/* Total Revenue */}
            <div style={{
              background: "#ffffff",
              padding: "1.25rem 1.5rem",
              borderRadius: "16px",
              border: "1px solid #ede5d8",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#a09990",
                  display: "block",
                }}>
                  Total Revenue
                </span>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.85rem",
                  fontWeight: 600,
                  color: "#2c2c2c",
                  marginTop: "0.25rem",
                  whiteSpace: "nowrap",
                }}>
                  {formatCurrency(stats?.totalRevenue ?? 0)}
                </div>
                <div style={{
                  fontSize: "0.72rem",
                  color: "#059669",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "0.25rem",
                }}>
                  <TrendingUp size={13} />
                  <span>From paid orders</span>
                </div>
              </div>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#fffbeb",
                color: "#b89d72",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(184,157,114,0.3)",
                flexShrink: 0,
              }}>
                <DollarSign size={22} />
              </div>
            </div>

            {/* Total Orders */}
            <div style={{
              background: "#ffffff",
              padding: "1.25rem 1.5rem",
              borderRadius: "16px",
              border: "1px solid #ede5d8",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#a09990",
                  display: "block",
                }}>
                  Total Orders
                </span>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.85rem",
                  fontWeight: 600,
                  color: "#2c2c2c",
                  marginTop: "0.25rem",
                }}>
                  {stats?.totalOrders ?? 0}
                </div>
                <Link
                  href="/admin/orders"
                  style={{
                    fontSize: "0.72rem",
                    color: "#b89d72",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginTop: "0.25rem",
                    display: "inline-block",
                  }}
                >
                  View all orders →
                </Link>
              </div>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #bfdbfe",
                flexShrink: 0,
              }}>
                <ShoppingBag size={22} />
              </div>
            </div>

            {/* Total Products */}
            <div style={{
              background: "#ffffff",
              padding: "1.25rem 1.5rem",
              borderRadius: "16px",
              border: "1px solid #ede5d8",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#a09990",
                  display: "block",
                }}>
                  Total Products
                </span>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.85rem",
                  fontWeight: 600,
                  color: "#2c2c2c",
                  marginTop: "0.25rem",
                }}>
                  {stats?.totalProducts ?? 0}
                </div>
                <Link
                  href="/admin/products"
                  style={{
                    fontSize: "0.72rem",
                    color: "#b89d72",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginTop: "0.25rem",
                    display: "inline-block",
                  }}
                >
                  Manage inventory →
                </Link>
              </div>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#faf5ff",
                color: "#9333ea",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e9d5ff",
                flexShrink: 0,
              }}>
                <Package size={22} />
              </div>
            </div>

            {/* Registered Users */}
            <div style={{
              background: "#ffffff",
              padding: "1.25rem 1.5rem",
              borderRadius: "16px",
              border: "1px solid #ede5d8",
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <span style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#a09990",
                  display: "block",
                }}>
                  Registered Users
                </span>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.85rem",
                  fontWeight: 600,
                  color: "#2c2c2c",
                  marginTop: "0.25rem",
                }}>
                  {stats?.totalUsers ?? 0}
                </div>
                <Link
                  href="/admin/users"
                  style={{
                    fontSize: "0.72rem",
                    color: "#b89d72",
                    fontWeight: 500,
                    textDecoration: "none",
                    marginTop: "0.25rem",
                    display: "inline-block",
                  }}
                >
                  View user list →
                </Link>
              </div>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#ecfdf5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #a7f3d0",
                flexShrink: 0,
              }}>
                <Users size={22} />
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.35rem",
              fontWeight: 500,
              color: "#2c2c2c",
              marginBottom: "0.75rem",
            }}>
              Order Status Breakdown
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
            }}>
              <div style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: "14px",
                border: "1px solid #fde68a",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#fffbeb", color: "#b45309",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#92400e" }}>
                    {stats?.ordersByStatus?.processing ?? 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: 500 }}>Processing</div>
                </div>
              </div>

              <div style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: "14px",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#eff6ff", color: "#1d4ed8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>
                    {stats?.ordersByStatus?.shipped ?? 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 500 }}>Shipped</div>
                </div>
              </div>

              <div style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: "14px",
                border: "1px solid #a7f3d0",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#ecfdf5", color: "#047857",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#065f46" }}>
                    {stats?.ordersByStatus?.delivered ?? 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#047857", fontWeight: 500 }}>Delivered</div>
                </div>
              </div>

              <div style={{
                background: "#ffffff",
                padding: "1rem 1.25rem",
                borderRadius: "14px",
                border: "1px solid #fecdd3",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#fff1f2", color: "#be123c",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <XCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#9f1239" }}>
                    {stats?.ordersByStatus?.cancelled ?? 0}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#be123c", fontWeight: 500 }}>Cancelled</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #ede5d8",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid #ede5d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.35rem",
                  fontWeight: 500,
                  color: "#2c2c2c",
                  margin: 0,
                }}>
                  Recent Orders
                </h2>
                <p style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.78rem",
                  color: "#6b6560",
                  marginTop: "2px",
                  margin: 0,
                }}>
                  Latest order activity from your customers
                </p>
              </div>
              <Link
                href="/admin/orders"
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#b89d72",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>View All Orders</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#faf7f2", borderBottom: "1px solid #ede5d8", color: "#a09990", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      <th style={{ padding: "0.75rem 1.25rem" }}>Order ID</th>
                      <th style={{ padding: "0.75rem 1.25rem" }}>Customer</th>
                      <th style={{ padding: "0.75rem 1.25rem" }}>Amount</th>
                      <th style={{ padding: "0.75rem 1.25rem" }}>Payment</th>
                      <th style={{ padding: "0.75rem 1.25rem" }}>Status</th>
                      <th style={{ padding: "0.75rem 1.25rem" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => {
                      const badgeStyle = getStatusBadgeClass(order.orderStatus);
                      return (
                        <tr key={order._id} style={{ borderBottom: "1px solid #ede5d8" }}>
                          <td style={{ padding: "0.9rem 1.25rem", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c" }}>
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem" }}>
                            <div style={{ fontWeight: 500, color: "#2c2c2c" }}>{order.userId?.name ?? "Guest Customer"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6b6560" }}>{order.userId?.email ?? "N/A"}</div>
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem", fontWeight: 600, color: "#2c2c2c" }}>
                            {formatCurrency(order.totalAmount)}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem" }}>
                            <span style={{
                              padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                              background: order.paymentStatus === "paid" ? "#ecfdf5" : "#fff1f2",
                              color: order.paymentStatus === "paid" ? "#047857" : "#be123c",
                              border: order.paymentStatus === "paid" ? "1px solid #a7f3d0" : "1px solid #fecdd3",
                            }}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem" }}>
                            <span style={{
                              padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                              ...badgeStyle,
                            }}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem", fontSize: "0.78rem", color: "#6b6560" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
                No orders recorded yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
