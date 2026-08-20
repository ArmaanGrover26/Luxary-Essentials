"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MapPin,
  CreditCard,
  User,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface OrderItem {
  productId?: {
    _id: string;
    name: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface AdminOrder {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentStatus: "pending" | "paid" | "failed";
  paymentId?: string;
  razorpayOrderId?: string;
  orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Modal detail view
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("limit", "10");
      if (statusFilter) query.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        let fetchedOrders: AdminOrder[] = data.data.orders;

        if (search.trim()) {
          const q = search.toLowerCase().trim();
          fetchedOrders = fetchedOrders.filter(
            (o) =>
              o._id.toLowerCase().includes(q) ||
              o.userId?.name?.toLowerCase().includes(q) ||
              o.userId?.email?.toLowerCase().includes(q)
          );
        }

        setOrders(fetchedOrders);
        setTotal(data.data.total);
        setPages(data.data.pages);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, orderStatus: data.data.orderStatus } : o
          )
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: data.data.orderStatus });
        }
      } else {
        alert(data.error || "Failed to update order status");
      }
    } catch {
      alert("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statusTabs = [
    { label: "All Orders", value: "" },
    { label: "Processing", value: "processing", icon: Clock },
    { label: "Shipped", value: "shipped", icon: Truck },
    { label: "Delivered", value: "delivered", icon: CheckCircle2 },
    { label: "Cancelled", value: "cancelled", icon: XCircle },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
      <div style={{
        background: "#ffffff",
        padding: "1.5rem 1.75rem",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2rem",
          fontWeight: 500,
          color: "#2c2c2c",
          margin: 0,
          lineHeight: 1.2,
        }}>
          Orders & Fulfillment
        </h1>
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: "0.875rem",
          color: "#6b6560",
          marginTop: "0.25rem",
          margin: 0,
        }}>
          Review placed customer orders, inspect shipping details, and update fulfillment milestones.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div style={{
        background: "#ffffff",
        padding: "1rem 1.25rem",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}>
        {/* Filter Tabs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid #ede5d8",
        }}>
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  border: "none",
                  background: isActive ? "#b89d72" : "transparent",
                  color: isActive ? "#ffffff" : "#6b6560",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.icon && <tab.icon size={13} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(250,247,242,0.8)",
          border: "1px solid #ede5d8",
          borderRadius: "12px",
          padding: "0.55rem 0.9rem",
          width: "100%",
          maxWidth: "360px",
        }}>
          <Search size={17} style={{ color: "#6b6560", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by Order ID, Name, Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              startTransition(() => {
                setPage(1);
              });
            }}
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "0.85rem",
              color: "#2c2c2c",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
            Loading order history...
          </div>
        ) : orders.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#faf7f2", borderBottom: "1px solid #ede5d8", color: "#a09990", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Order ID</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Customer</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Items</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Total Amount</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Payment</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Order Status</th>
                  <th style={{ padding: "0.75rem 1.25rem", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #ede5d8" }}>
                    <td style={{ padding: "0.9rem 1.25rem", fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c" }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ fontWeight: 600, color: "#2c2c2c" }}>
                        {order.shippingAddress?.name || order.userId?.name || "Customer"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6b6560" }}>
                        {order.userId?.email || order.shippingAddress?.phone}
                      </div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", color: "#6b6560" }}>
                      {order.items?.length ?? 0} item(s)
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", fontWeight: 600, color: "#2c2c2c" }}>
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span style={{
                        padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                        background: order.paymentStatus === "paid" ? "#ecfdf5" : order.paymentStatus === "failed" ? "#fff1f2" : "#fffbeb",
                        color: order.paymentStatus === "paid" ? "#047857" : order.paymentStatus === "failed" ? "#be123c" : "#b45309",
                        border: order.paymentStatus === "paid" ? "1px solid #a7f3d0" : order.paymentStatus === "failed" ? "1px solid #fecdd3" : "1px solid #fde68a",
                      }}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <select
                        value={order.orderStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          padding: "0.35rem 0.75rem", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600,
                          background: order.orderStatus === "processing" ? "#fffbeb" : order.orderStatus === "shipped" ? "#eff6ff" : order.orderStatus === "delivered" ? "#ecfdf5" : "#fff1f2",
                          color: order.orderStatus === "processing" ? "#b45309" : order.orderStatus === "shipped" ? "#1d4ed8" : order.orderStatus === "delivered" ? "#047857" : "#be123c",
                          border: order.orderStatus === "processing" ? "1px solid #fde68a" : order.orderStatus === "shipped" ? "1px solid #bfdbfe" : order.orderStatus === "delivered" ? "1px solid #a7f3d0" : "1px solid #fecdd3",
                          outline: "none", cursor: "pointer",
                        }}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: "6px", border: "1px solid #ede5d8", background: "#ffffff",
                          borderRadius: "8px", color: "#6b6560", cursor: "pointer", display: "inline-flex",
                        }}
                        title="View order details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
            No orders match the selected filters.
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div style={{
            padding: "0.9rem 1.25rem", borderTop: "1px solid #ede5d8", background: "#faf7f2",
            display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#6b6560",
          }}>
            <div>
              Showing page <strong style={{ color: "#2c2c2c" }}>{page}</strong> of <strong style={{ color: "#2c2c2c" }}>{pages}</strong> ({total} orders)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: "4px 8px", border: "1px solid #ede5d8", background: "#ffffff",
                  borderRadius: "6px", cursor: "pointer", opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: "4px 8px", border: "1px solid #ede5d8", background: "#ffffff",
                  borderRadius: "6px", cursor: "pointer", opacity: page >= pages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#ffffff", width: "100%", maxWidth: "720px",
            borderRadius: "16px", border: "1px solid #ede5d8",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: "90vh",
          }}>
            {/* Header */}
            <div style={{
              padding: "1.25rem 1.5rem", borderBottom: "1px solid #ede5d8",
              background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "#2c2c2c", margin: 0 }}>
                  Order Details #{selectedOrder._id.slice(-6).toUpperCase()}
                </h2>
                <div style={{ fontSize: "0.75rem", color: "#6b6560", marginTop: "2px" }}>
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6b6560" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
              {/* Order Status bar */}
              <div style={{
                background: "#faf7f2", padding: "1rem 1.25rem", borderRadius: "12px",
                border: "1px solid #ede5d8", display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a09990" }}>
                    Current Order Status
                  </span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "#2c2c2c", textTransform: "capitalize", marginTop: "2px" }}>
                    {selectedOrder.orderStatus}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#6b6560", fontWeight: 500 }}>Update Status:</span>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                    style={{
                      padding: "0.4rem 0.75rem", background: "#ffffff", border: "1px solid #ede5d8",
                      borderRadius: "10px", fontSize: "0.85rem", fontWeight: 600, color: "#2c2c2c", cursor: "pointer",
                    }}
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer & Shipping grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Customer Details */}
                <div style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #ede5d8", background: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", color: "#2c2c2c", paddingBottom: "8px", borderBottom: "1px solid #ede5d8", marginBottom: "8px" }}>
                    <User size={15} style={{ color: "#b89d72" }} />
                    <span>Customer Information</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6b6560", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div><strong style={{ color: "#2c2c2c" }}>Name:</strong> {selectedOrder.shippingAddress?.name || selectedOrder.userId?.name}</div>
                    <div><strong style={{ color: "#2c2c2c" }}>Email:</strong> {selectedOrder.userId?.email || "N/A"}</div>
                    <div><strong style={{ color: "#2c2c2c" }}>Phone:</strong> {selectedOrder.shippingAddress?.phone}</div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #ede5d8", background: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", color: "#2c2c2c", paddingBottom: "8px", borderBottom: "1px solid #ede5d8", marginBottom: "8px" }}>
                    <MapPin size={15} style={{ color: "#b89d72" }} />
                    <span>Shipping Address</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6b6560", lineHeight: 1.5 }}>
                    {selectedOrder.shippingAddress?.address},<br />
                    {selectedOrder.shippingAddress?.city} - {selectedOrder.shippingAddress?.pincode}
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div style={{ padding: "1rem", borderRadius: "12px", border: "1px solid #ede5d8", background: "#ffffff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #ede5d8", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 600, fontSize: "0.85rem", color: "#2c2c2c" }}>
                    <CreditCard size={15} style={{ color: "#b89d72" }} />
                    <span>Payment Verification</span>
                  </div>
                  <span style={{
                    padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase",
                    background: selectedOrder.paymentStatus === "paid" ? "#ecfdf5" : "#fffbeb",
                    color: selectedOrder.paymentStatus === "paid" ? "#047857" : "#b45309",
                  }}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "0.78rem", color: "#6b6560" }}>
                  <div><strong style={{ color: "#2c2c2c" }}>Razorpay Order ID:</strong> {selectedOrder.razorpayOrderId || "N/A"}</div>
                  <div><strong style={{ color: "#2c2c2c" }}>Payment Ref ID:</strong> {selectedOrder.paymentId || "N/A"}</div>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div style={{ border: "1px solid #ede5d8", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "0.6rem 1rem", background: "#faf7f2", fontWeight: 600, fontSize: "0.75rem", color: "#2c2c2c", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #ede5d8" }}>
                  Order Items Breakdown
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} style={{ padding: "0.9rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: index < selectedOrder.items.length - 1 ? "1px solid #ede5d8" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#f5f0e8", border: "1px solid #ede5d8", overflow: "hidden", position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.productId?.images?.[0] ? (
                            <Image src={item.productId.images[0]} alt={item.productId.name || "Product"} fill sizes="42px" style={{ objectFit: "cover" }} />
                          ) : (
                            <ShoppingBag size={16} style={{ color: "#6b6560" }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#2c2c2c" }}>{item.productId?.name || "Product"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b6560" }}>Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#2c2c2c" }}>
                        {formatCurrency(item.quantity * item.price)}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0.9rem 1rem", background: "#faf7f2", borderTop: "1px solid #ede5d8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 600, color: "#2c2c2c" }}>
                    Total Order Value:
                  </span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 700, color: "#8b7355" }}>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
