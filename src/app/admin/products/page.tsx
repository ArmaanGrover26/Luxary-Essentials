"use client";

import { useEffect, useState, useCallback, useTransition, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import CloudinaryImageUploader from "@/components/CloudinaryImageUploader";
import { ORDERED_CATEGORIES, getCategoryLabel, type CategoryConfig } from "@/config/categories";
import { useAuth } from "@/context/AuthContext";

interface ProductItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  mrp?: number | null;
  category: string;
  images: string[];
  stock: number;
  lowStockThreshold?: number;
  rating: number;
  numReviews: number;
  createdAt: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.9rem",
  background: "#faf7f2",
  border: "1px solid #ede5d8",
  borderRadius: "10px",
  fontSize: "0.85rem",
  color: "#2c2c2c",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  color: "#6b6560",
  marginBottom: "4px",
};

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Dynamic categories state loaded from database
  const [dynamicCategories, setDynamicCategories] = useState<{ value: string; label: string }[]>(
    ORDERED_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))
  );

  useEffect(() => {
    let isMounted = true;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDynamicCategories(
            data.data.map((c: { name: string; slug: string }) => ({
              value: c.slug,
              label: c.name,
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to load categories in admin products", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    category: ORDERED_CATEGORIES[0]?.value || "resin-art-pigments",
    images: [] as string[],
    stock: "",
    lowStockThreshold: "5",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("limit", "10");
      query.set("sort", "createdAt");
      query.set("order", "desc");
      if (search) query.set("search", search);
      if (category) query.set("category", category);

      const headers: Record<string, string> = {};
      const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("le_token") : null);
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/products?${query.toString()}`, { headers });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setTotal(data.data.total);
        setPages(data.data.pages);
      }
    } catch (err) {
      console.error("Error fetching products", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openAddModal();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      mrp: "",
      category: ORDERED_CATEGORIES[0].value,
      images: [],
      stock: "10",
      lowStockThreshold: "5",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      mrp: product.mrp != null ? product.mrp.toString() : "",
      category: product.category,
      images: product.images || [],
      stock: product.stock.toString(),
      lowStockThreshold: (product.lowStockThreshold ?? 5).toString(),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.images.length === 0) {
      setFormError("Please upload at least one product image.");
      return;
    }

    const priceNum = Number(formData.price);
    const mrpNum = formData.mrp.trim() !== "" ? Number(formData.mrp) : null;

    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Please enter a valid selling price.");
      return;
    }
    if (mrpNum !== null && isNaN(mrpNum)) {
      setFormError("Please enter a valid MRP.");
      return;
    }
    if (mrpNum !== null && mrpNum < 0) {
      setFormError("MRP cannot be negative.");
      return;
    }
    if (mrpNum !== null && priceNum > mrpNum) {
      setFormError("Selling price cannot exceed MRP.");
      return;
    }

    const stockNum = Number(formData.stock);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      setFormError("Stock quantity must be a non-negative whole number (integer).");
      return;
    }

    const thresholdNum = formData.lowStockThreshold ? Number(formData.lowStockThreshold) : 5;
    if (isNaN(thresholdNum) || thresholdNum < 1 || !Number.isInteger(thresholdNum)) {
      setFormError("Low stock threshold must be a whole number of at least 1.");
      return;
    }

    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: priceNum,
      category: formData.category,
      images: formData.images,
      stock: stockNum,
      lowStockThreshold: thresholdNum,
    };
    if (mrpNum !== null) {
      payload.mrp = mrpNum;
    }

    try {
      setIsSubmitting(true);
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("le_token") : null);
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setFormError(data.error || "Operation failed");
      }
    } catch {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("le_token") : null);
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        fetchProducts();
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch {
      alert("Error deleting product");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Header */}
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
            Product Management
          </h1>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "0.875rem",
            color: "#6b6560",
            marginTop: "0.25rem",
            margin: 0,
          }}>
            Add new luxury items, update stock levels, and organize categories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            padding: "0.65rem 1.25rem",
            background: "#b89d72",
            color: "#ffffff",
            borderRadius: "10px",
            border: "none",
            fontSize: "0.85rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(184,157,114,0.3)",
          }}
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{
        background: "#ffffff",
        padding: "1rem 1.25rem",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
      }}>
        {/* Search Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(250,247,242,0.8)",
          border: "1px solid #ede5d8",
          borderRadius: "12px",
          padding: "0.55rem 0.9rem",
          flex: "1 1 260px",
          maxWidth: "360px",
        }}>
          <Search size={17} style={{ color: "#6b6560", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search products..."
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

        {/* Category filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={16} style={{ color: "#6b6560" }} />
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.55rem 1rem",
              background: "rgba(250,247,242,0.8)",
              border: "1px solid #ede5d8",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#2c2c2c",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Categories</option>
            {dynamicCategories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #ede5d8",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
      }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
            Loading products catalog...
          </div>
        ) : products.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#faf7f2", borderBottom: "1px solid #ede5d8", color: "#a09990", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Product</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Category</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Price / MRP</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Stock</th>
                  <th style={{ padding: "0.75rem 1.25rem" }}>Status</th>
                  <th style={{ padding: "0.75rem 1.25rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} style={{ borderBottom: "1px solid #ede5d8" }}>
                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "44px", height: "44px", borderRadius: "10px",
                          background: "#f5f0e8", border: "1px solid #ede5d8",
                          overflow: "hidden", position: "relative", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {prod.images && prod.images[0] ? (
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              sizes="44px"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <Package size={18} style={{ color: "#a09990" }} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#2c2c2c" }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#6b6560", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {prod.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <span style={{
                        padding: "0.25rem 0.65rem", borderRadius: "8px", fontSize: "0.72rem",
                        fontWeight: 600, background: "#f5f0e8",
                        color: "#8b7355", border: "1px solid rgba(184,157,114,0.3)",
                        whiteSpace: "nowrap",
                      }}>
                        {getCategoryLabel(prod.category)}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      <div style={{ fontWeight: 600, color: "#2c2c2c" }}>
                        {formatCurrency(prod.price)}
                      </div>
                      {prod.mrp != null && prod.mrp > prod.price && (
                        <div style={{ fontSize: "0.72rem", color: "#a09990", textDecoration: "line-through" }}>
                          {formatCurrency(prod.mrp)}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", color: "#2c2c2c", fontWeight: 500 }}>
                      <div>{prod.stock} units</div>
                      <div style={{ fontSize: "0.7rem", color: "#a09990", marginTop: "2px" }}>
                        Low alert ≤ {prod.lowStockThreshold ?? 5}
                      </div>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      {prod.stock > (prod.lowStockThreshold ?? 5) ? (
                        <span style={{
                          padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600,
                          background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0",
                        }}>
                          In Stock
                        </span>
                      ) : prod.stock > 0 ? (
                        <span style={{
                          padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600,
                          background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a",
                        }}>
                          Few Left (≤{prod.lowStockThreshold ?? 5})
                        </span>
                      ) : (
                        <span style={{
                          padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600,
                          background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3",
                        }}>
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          onClick={() => openEditModal(prod)}
                          style={{
                            padding: "6px", border: "1px solid #ede5d8", background: "#ffffff",
                            borderRadius: "8px", color: "#6b6560", cursor: "pointer", display: "flex",
                          }}
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(prod._id)}
                          style={{
                            padding: "6px", border: "1px solid #fecdd3", background: "#fff1f2",
                            borderRadius: "8px", color: "#be123c", cursor: "pointer", display: "flex",
                          }}
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>
            No products found matching your search criteria.
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div style={{
            padding: "0.9rem 1.25rem", borderTop: "1px solid #ede5d8", background: "#faf7f2",
            display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#6b6560",
          }}>
            <div>
              Showing page <strong style={{ color: "#2c2c2c" }}>{page}</strong> of <strong style={{ color: "#2c2c2c" }}>{pages}</strong> ({total} items)
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#ffffff", width: "100%", maxWidth: "640px",
            borderRadius: "16px", border: "1px solid #ede5d8",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)", overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: "90vh",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "1.25rem 1.5rem", borderBottom: "1px solid #ede5d8",
              background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", color: "#2c2c2c", margin: 0 }}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6b6560" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
              {formError && (
                <div style={{ padding: "0.75rem 1rem", background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", borderRadius: "10px", fontSize: "0.8rem" }}>
                  {formError}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Gold Resin Tray"
                  style={inputStyle}
                />
              </div>

              {/* Price row: MRP + Selling Price */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>MRP (₹) <span style={{ color: "#a09990", fontWeight: 400 }}>(optional)</span></label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="1999"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Our Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1299"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Price hint */}
              {formData.mrp && formData.price && Number(formData.mrp) > Number(formData.price) && (
                <div style={{
                  padding: "0.5rem 0.75rem",
                  background: "#f0fdf4",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  color: "#047857",
                }}>
                  ✓ Discount: {Math.round(((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100)}% off MRP
                </div>
              )}

              {/* Inventory Management: Stock + Low-Stock Threshold */}
              <div style={{
                padding: "1rem",
                background: "#fcfbf9",
                border: "1px solid #ede5d8",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Inventory & Stock Controls
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "#a09990" }}>
                    Exact counts hidden from customers
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>Available Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="15"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: "0.7rem", color: "#a09990", marginTop: "3px" }}>
                      Total sellable units (integer ≥ 0).
                    </p>
                  </div>

                  <div>
                    <label style={labelStyle}>Low-Stock Alert Threshold *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      placeholder="5"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: "0.7rem", color: "#a09990", marginTop: "3px" }}>
                      Triggers &ldquo;Only a Few Left&rdquo; badge (default 5).
                    </p>
                  </div>
                </div>
              </div>



              {/* Category */}
              <div>
                <label style={labelStyle}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {dynamicCategories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted with high-grade epoxy resin and metallic leaf pigments..."
                  style={{ ...inputStyle, fontFamily: "inherit", resize: "vertical" }}
                />
              </div>

              {/* Images */}
              <div>
                <label style={{ ...labelStyle, marginBottom: "8px" }}>Product Photos *</label>
                <CloudinaryImageUploader
                  images={formData.images}
                  onChange={(urls) => setFormData((prev) => ({ ...prev, images: urls }))}
                  maxImages={6}
                />
              </div>

              {/* Modal Footer Buttons */}
              <div style={{ paddingTop: "1rem", borderTop: "1px solid #ede5d8", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "0.6rem 1.2rem", border: "1px solid #ede5d8", background: "#ffffff",
                    borderRadius: "10px", fontSize: "0.85rem", fontWeight: 500, color: "#2c2c2c", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.6rem 1.5rem", border: "none", background: "#b89d72",
                    borderRadius: "10px", fontSize: "0.85rem", fontWeight: 500, color: "#ffffff", cursor: "pointer",
                  }}
                >
                  {isSubmitting ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div style={{
            background: "#ffffff", width: "100%", maxWidth: "400px",
            borderRadius: "16px", border: "1px solid #ede5d8",
            padding: "1.5rem", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%", background: "#fff1f2",
              color: "#be123c", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
            }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", color: "#2c2c2c", margin: 0 }}>
              Delete Product?
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#6b6560", marginTop: "0.4rem", marginBottom: "1.25rem" }}>
              Are you sure you want to permanently remove this product from your inventory?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "0.5rem 1.25rem", border: "1px solid #ede5d8", background: "#ffffff",
                  borderRadius: "10px", fontSize: "0.85rem", fontWeight: 500, color: "#2c2c2c", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  padding: "0.5rem 1.25rem", border: "none", background: "#be123c",
                  borderRadius: "10px", fontSize: "0.85rem", fontWeight: 500, color: "#ffffff", cursor: "pointer",
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center", color: "#6b6560", fontSize: "0.875rem" }}>Loading products...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
