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

interface ProductItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "resin" | "candles" | "raw-materials" | "gifts";
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  createdAt: string;
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
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

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "resin" as "resin" | "candles" | "raw-materials" | "gifts",
    imagesText: "",
    stock: "",
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
      if (search) query.set("search", search);
      if (category) query.set("category", category);

      const res = await fetch(`/api/products?${query.toString()}`);
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
  }, [page, search, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      openAddModal();
    }
  }, [searchParams]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "resin",
      imagesText: "",
      stock: "10",
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
      category: product.category,
      imagesText: product.images.join("\n"),
      stock: product.stock.toString(),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const imagesList = formData.imagesText
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (imagesList.length === 0) {
      setFormError("At least one product image URL is required.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      images: imagesList,
      stock: Number(formData.stock),
    };

    try {
      setIsSubmitting(true);
      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
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
            <option value="resin">Resin Art</option>
            <option value="candles">Hand-poured Candles</option>
            <option value="raw-materials">Raw Materials</option>
            <option value="gifts">Luxury Gifts</option>
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
                  <th style={{ padding: "0.75rem 1.25rem" }}>Price</th>
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
                        fontWeight: 600, textTransform: "capitalize", background: "#f5f0e8",
                        color: "#8b7355", border: "1px solid rgba(184,157,114,0.3)",
                      }}>
                        {prod.category.replace("-", " ")}
                      </span>
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", fontWeight: 600, color: "#2c2c2c" }}>
                      {formatCurrency(prod.price)}
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem", color: "#2c2c2c", fontWeight: 500 }}>
                      {prod.stock} units
                    </td>

                    <td style={{ padding: "0.9rem 1.25rem" }}>
                      {prod.stock > 5 ? (
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
                          Low Stock
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
            background: "#ffffff", width: "100%", maxWidth: "600px",
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

              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6560", marginBottom: "4px" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Gold Resin Tray"
                  style={{
                    width: "100%", padding: "0.6rem 0.9rem", background: "#faf7f2",
                    border: "1px solid #ede5d8", borderRadius: "10px", fontSize: "0.85rem",
                    color: "#2c2c2c", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6560", marginBottom: "4px" }}>
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="1299"
                    style={{
                      width: "100%", padding: "0.6rem 0.9rem", background: "#faf7f2",
                      border: "1px solid #ede5d8", borderRadius: "10px", fontSize: "0.85rem",
                      color: "#2c2c2c", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6560", marginBottom: "4px" }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as "resin" | "candles" | "raw-materials" | "gifts",
                      })
                    }
                    style={{
                      width: "100%", padding: "0.6rem 0.9rem", background: "#faf7f2",
                      border: "1px solid #ede5d8", borderRadius: "10px", fontSize: "0.85rem",
                      color: "#2c2c2c", outline: "none", boxSizing: "border-box", cursor: "pointer",
                    }}
                  >
                    <option value="resin">Resin Art</option>
                    <option value="candles">Candles</option>
                    <option value="raw-materials">Raw Materials</option>
                    <option value="gifts">Luxury Gifts</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6560", marginBottom: "4px" }}>
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="15"
                    style={{
                      width: "100%", padding: "0.6rem 0.9rem", background: "#faf7f2",
                      border: "1px solid #ede5d8", borderRadius: "10px", fontSize: "0.85rem",
                      color: "#2c2c2c", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6560", marginBottom: "4px" }}>
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted with high-grade epoxy resin and metallic leaf pigments..."
                  style={{
                    width: "100%", padding: "0.6rem 0.9rem", background: "#faf7f2",
                    border: "1px solid #ede5d8", borderRadius: "10px", fontSize: "0.85rem",
                    color: "#2c2c2c", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6560", marginBottom: "4px" }}>
                  Image URLs (One per line or comma separated) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.imagesText}
                  onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  style={{
                    width: "100%", padding: "0.6rem 0.9rem", background: "#faf7f2",
                    border: "1px solid #ede5d8", borderRadius: "10px", fontSize: "0.8rem",
                    color: "#2c2c2c", outline: "none", boxSizing: "border-box", fontFamily: "monospace",
                  }}
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
