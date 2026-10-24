"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Tags,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    order: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories?all=true", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        showToast(data.error || "Failed to load categories", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to server", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.order || 0), -1);
    setFormData({
      name: "",
      slug: "",
      description: "",
      order: maxOrder + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      order: cat.order ?? 0,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  // Auto generate slug as user types name (if creating or if slug matches old auto slug)
  const handleNameChange = (val: string) => {
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingCategory ? autoSlug : prev.slug,
    }));
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      setSaving(true);
      const url = editingCategory
        ? `/api/categories/${editingCategory._id}`
        : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim(),
          order: Number(formData.order) || 0,
          isActive: formData.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to save category", "error");
        return;
      }

      showToast(
        editingCategory
          ? `Category "${formData.name}" updated successfully`
          : `Category "${formData.name}" created successfully`
      );
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast("Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      const nextActive = !cat.isActive;
      // Optimistic update
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, isActive: nextActive } : c))
      );

      const res = await fetch(`/api/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback
        setCategories((prev) =>
          prev.map((c) => (c._id === cat._id ? { ...c, isActive: cat.isActive } : c))
        );
        showToast(data.error || "Failed to update status", "error");
      } else {
        showToast(`Category "${cat.name}" is now ${nextActive ? "Active" : "Hidden"}`);
      }
    } catch (err) {
      console.error(err);
      fetchCategories();
      showToast("Failed to toggle status", "error");
    }
  };

  // Delete category
  const handleDelete = async (catId: string) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/categories/${catId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to delete category", "error");
      } else {
        showToast(data.data?.message || "Category deleted successfully");
        setDeleteConfirmId(null);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete category", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (filterStatus === "active") return cat.isActive;
        if (filterStatus === "inactive") return !cat.isActive;
        return true;
      })
      .filter((cat) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.slug.toLowerCase().includes(q) ||
          (cat.description && cat.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories, filterStatus, search]);

  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const inactive = total - active;
    const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
    return { total, active, inactive, totalProducts };
  }, [categories]);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "4rem" }}>
      {/* Toast Alert */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: toast.type === "success" ? "#1e3a2b" : "#451a1a",
            color: "#ffffff",
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            border: `1px solid ${toast.type === "success" ? "#2d5a3f" : "#7f1d1d"}`,
            fontSize: "0.88rem",
            fontFamily: "'Jost', sans-serif",
            animation: "fadeIn 0.25s ease",
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} color="#4ade80" /> : <AlertCircle size={18} color="#f87171" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "2rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid #ede5d8",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Tags size={22} color="#b89d72" />
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                fontWeight: 600,
                color: "#2c2c2c",
                margin: 0,
              }}
            >
              Category Management
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#7a7268" }}>
            Add, edit, reorder, and control product categories displayed in shop filters and product listings.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={fetchCategories}
            title="Refresh"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.65rem 1rem",
              background: "#ffffff",
              border: "1px solid #ede5d8",
              borderRadius: "8px",
              color: "#5c554e",
              fontSize: "0.82rem",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <Link
            href="/shop"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.65rem 1rem",
              background: "#ffffff",
              border: "1px solid #ede5d8",
              borderRadius: "8px",
              color: "#5c554e",
              fontSize: "0.82rem",
              textDecoration: "none",
            }}
          >
            <ExternalLink size={14} />
            <span>View Shop</span>
          </Link>

          <button
            onClick={handleOpenAdd}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.68rem 1.35rem",
              background: "linear-gradient(135deg, #b89d72, #967d54)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.86rem",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(184,157,114,0.3)",
            }}
          >
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #ede5d8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8278", fontWeight: 600 }}>Total Categories</span>
            <Layers size={18} color="#b89d72" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "#2c2c2c", fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.total}
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #ede5d8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8278", fontWeight: 600 }}>Active on Store</span>
            <Eye size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "#16a34a", fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.active}
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #ede5d8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8278", fontWeight: 600 }}>Hidden / Inactive</span>
            <EyeOff size={18} color="#9ca3af" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "#6b7280", fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.inactive}
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "10px", border: "1px solid #ede5d8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8278", fontWeight: 600 }}>Total Catalog Items</span>
            <Package size={18} color="#b89d72" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 600, color: "#2c2c2c", fontFamily: "'Cormorant Garamond', serif" }}>
            {stats.totalProducts}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          background: "#ffffff",
          padding: "1rem 1.25rem",
          borderRadius: "10px",
          border: "1px solid #ede5d8",
          marginBottom: "1.5rem",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "260px", flex: "1 1 300px" }}>
          <Search size={16} color="#9c958c" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search category name, slug or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.8rem 0.6rem 2.25rem",
              borderRadius: "8px",
              border: "1px solid #ede5d8",
              fontSize: "0.85rem",
              outline: "none",
              color: "#2c2c2c",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", background: "#f8f5f0", padding: "4px", borderRadius: "8px" }}>
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "6px",
                border: "none",
                background: filterStatus === tab ? "#ffffff" : "transparent",
                color: filterStatus === tab ? "#2c2c2c" : "#7a7268",
                fontWeight: filterStatus === tab ? 600 : 400,
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: filterStatus === tab ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Category List / Table */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #ede5d8",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#7a7268" }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} color="#b89d72" />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
            <Tags size={36} color="#d4c9ba" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ margin: "0 0 6px", fontSize: "1.1rem", color: "#2c2c2c" }}>No categories found</h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#7a7268" }}>
              {search ? "No categories match your search query." : "Get started by adding your first category."}
            </p>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: "0.55rem 1.15rem",
                background: "#b89d72",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.82rem",
                cursor: "pointer",
              }}
            >
              Add New Category
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "#faf7f2", borderBottom: "1px solid #ede5d8", color: "#7a7268", fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  <th style={{ padding: "0.85rem 1rem", width: "80px" }}>Order</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Category Name</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Slug / URL</th>
                  <th style={{ padding: "0.85rem 1rem" }}>Description</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Products</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "0.85rem 1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat, index) => (
                  <tr
                    key={cat._id}
                    style={{
                      borderBottom: "1px solid #ede5d8",
                      transition: "background 0.15s ease",
                      background: cat.isActive ? "#ffffff" : "#fbf9f6",
                    }}
                  >
                    {/* Order */}
                    <td style={{ padding: "0.9rem 1rem", color: "#8a8278", fontWeight: 600 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          background: "#f4eee6",
                          fontSize: "0.8rem",
                          color: "#5c554e",
                        }}
                      >
                        {cat.order ?? index}
                      </span>
                    </td>

                    {/* Name */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <div style={{ fontWeight: 600, color: "#2c2c2c", fontSize: "0.92rem" }}>
                        {cat.name}
                      </div>
                    </td>

                    {/* Slug */}
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <code
                        style={{
                          fontFamily: "monospace",
                          background: "#f4eee6",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          fontSize: "0.78rem",
                          color: "#8b7355",
                        }}
                      >
                        {cat.slug}
                      </code>
                    </td>

                    {/* Description */}
                    <td style={{ padding: "0.9rem 1rem", color: "#6b6560", maxWidth: "260px" }}>
                      <span
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cat.description || <em style={{ color: "#a09990" }}>No description</em>}
                      </span>
                    </td>

                    {/* Product count */}
                    <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                      <Link
                        href={`/shop?cat=${cat.slug}`}
                        target="_blank"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background: (cat.productCount || 0) > 0 ? "rgba(184,157,114,0.15)" : "#f3f4f6",
                          color: (cat.productCount || 0) > 0 ? "#8b7355" : "#9ca3af",
                          fontWeight: 500,
                          fontSize: "0.76rem",
                          textDecoration: "none",
                        }}
                        title="View products in shop"
                      >
                        <Package size={12} />
                        <span>{cat.productCount || 0}</span>
                      </Link>
                    </td>

                    {/* Status toggle */}
                    <td style={{ padding: "0.9rem 1rem", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleActive(cat)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          border: `1px solid ${cat.isActive ? "#86efac" : "#e5e7eb"}`,
                          background: cat.isActive ? "#f0fdf4" : "#f9fafb",
                          color: cat.isActive ? "#166534" : "#6b7280",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {cat.isActive ? <Eye size={12} color="#16a34a" /> : <EyeOff size={12} color="#9ca3af" />}
                        <span>{cat.isActive ? "Active" : "Hidden"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.9rem 1rem", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                          style={{
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #ede5d8",
                            background: "#ffffff",
                            color: "#5c554e",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(cat._id)}
                          title="Delete Category"
                          style={{
                            padding: "6px 8px",
                            borderRadius: "6px",
                            border: "1px solid #fee2e2",
                            background: "#fff5f5",
                            color: "#dc2626",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "520px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
              border: "1px solid #ede5d8",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #ede5d8",
                background: "#faf7f2",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "#2c2c2c",
                  margin: 0,
                }}
              >
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#7a7268" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c", marginBottom: "6px" }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resin Art Pigments, Silicon Moulds..."
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #ede5d8",
                    fontSize: "0.88rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c" }}>
                    URL Slug
                  </label>
                  <span style={{ fontSize: "0.72rem", color: "#8a8278" }}>auto-generated from name</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. resin-art-pigments"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #ede5d8",
                    fontSize: "0.88rem",
                    fontFamily: "monospace",
                    background: "#fbf9f6",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {editingCategory && (
                  <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#b89d72" }}>
                    * Renaming the slug will automatically update all existing products in this category.
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "1.1rem" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c", marginBottom: "6px" }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of products in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #ede5d8",
                    fontSize: "0.85rem",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "'Jost', sans-serif",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c", marginBottom: "6px" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #ede5d8",
                      fontSize: "0.88rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "#8a8278", marginTop: "2px", display: "block" }}>
                    Lower numbers appear first
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#2c2c2c", marginBottom: "6px" }}>
                    Storefront Visibility
                  </label>
                  <div
                    onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #ede5d8",
                      background: formData.isActive ? "#f0fdf4" : "#fbf9f6",
                      cursor: "pointer",
                      height: "38px",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={() => {}}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.82rem", fontWeight: 500, color: formData.isActive ? "#166534" : "#6b7280" }}>
                      {formData.isActive ? "Active (Visible)" : "Hidden"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #ede5d8", paddingTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid #ede5d8",
                    background: "#ffffff",
                    color: "#5c554e",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "0.65rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #b89d72, #967d54)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(184,157,114,0.3)",
                  }}
                >
                  {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "440px",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid #fee2e2",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dc2626",
                }}
              >
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "1.1rem", color: "#1f2937" }}>Delete Category?</h3>
                <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>This action cannot be undone</span>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.5, margin: "0 0 1.5rem" }}>
              Are you sure you want to delete this category? If there are products assigned to it, deletion will be blocked to protect your catalog.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "0.55rem 1.15rem",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
