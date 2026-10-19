"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Package,
  AlertTriangle,
  X,
  Eye,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { ORDERED_CATEGORIES, getCategoryLabel } from "@/config/categories";

interface ProductItem {
  _id: string;
  name: string;
  price: number;
  mrp?: number | null;
  category: string;
  images: string[];
  stock: number;
}

interface FestivalCategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  bannerText?: string;
  badgeText?: string;
  isActive: boolean;
  products: ProductItem[];
  createdAt: string;
  updatedAt: string;
}

const PRESET_FESTIVALS = [
  {
    name: "Diwali Special",
    badge: "Diwali Special",
    banner: "Celebrate the Festival of Lights with Handcrafted Resin Essentials & Festive Candles 🪔✨",
    desc: "Curated handcrafted gifts, diya moulds, resin platters, and festive candle creations for Diwali.",
  },
  {
    name: "Holi Special",
    badge: "Holi Special",
    banner: "Vibrant Colours & Festive Artistry for Holi Celebrations 🎨🌸",
    desc: "Specially selected pigments, colour trays, and handcrafted celebratory gifts.",
  },
  {
    name: "Rakhi Special",
    badge: "Rakhi Special",
    banner: "Celebrate the Bond of Love with Handcrafted Keepsakes & Gifts 🎀✨",
    desc: "Artisanal resin frames, custom keepsakes, and luxury gifting essentials for Raksha Bandhan.",
  },
  {
    name: "Christmas Special",
    badge: "Christmas Special",
    banner: "Handcrafted Holiday Magic & Winter Warmth for Christmas 🎄❄️",
    desc: "Artisanal scented candles, festive ornaments, and premium gifting hampers.",
  },
  {
    name: "New Year Special",
    badge: "New Year Special",
    banner: "Ring in the New Year with Timeless Elegance & Artistry 🥂✨",
    desc: "Handcrafted resin clocks, bespoke decor, and luxury gifting creations.",
  },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.65rem 0.9rem",
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
  marginBottom: "5px",
};

export default function AdminFestivalsPage() {
  const [festivals, setFestivals] = useState<FestivalCategoryItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState<FestivalCategoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formBadge, setFormBadge] = useState("Festival Special");
  const [formBanner, setFormBanner] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Product selector filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  const showToast = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Fetch all festivals
  const fetchFestivals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/festivals");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFestivals(data.data);
      } else {
        setFestivals([]);
      }
    } catch (err) {
      console.error("Failed to fetch festivals", err);
      showToast("error", "Failed to load festival categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all products for selector
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=100&sort=createdAt&order=desc");
      const data = await res.json();
      if (data.success && data.data?.products) {
        setAllProducts(data.data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  }, []);

  useEffect(() => {
    fetchFestivals();
    fetchProducts();
  }, [fetchFestivals, fetchProducts]);

  const activeFestival = useMemo(() => {
    return festivals.find((f) => f.isActive) || null;
  }, [festivals]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingFestival(null);
    setFormName("");
    setFormBadge("Festival Special");
    setFormBanner("");
    setFormDesc("");
    setFormIsActive(festivals.length === 0); // Active by default if it's the first one
    setSelectedProductIds([]);
    setProductSearch("");
    setProductCategoryFilter("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (fest: FestivalCategoryItem) => {
    setEditingFestival(fest);
    setFormName(fest.name);
    setFormBadge(fest.badgeText || "Festival Special");
    setFormBanner(fest.bannerText || "");
    setFormDesc(fest.description || "");
    setFormIsActive(fest.isActive);
    setSelectedProductIds(fest.products.map((p) => (typeof p === "string" ? p : p._id)));
    setProductSearch("");
    setProductCategoryFilter("");
    setIsModalOpen(true);
  };

  // Apply preset
  const handleApplyPreset = (preset: (typeof PRESET_FESTIVALS)[0]) => {
    setFormName(preset.name);
    setFormBadge(preset.badge);
    setFormBanner(preset.banner);
    setFormDesc(preset.desc);
  };

  // Toggle single product selection
  const handleToggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filtered products inside the modal selector
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory =
        !productCategoryFilter || p.category === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, productSearch, productCategoryFilter]);

  const handleSelectAllFiltered = () => {
    const idsToAdd = filteredProducts.map((p) => p._id);
    setSelectedProductIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleClearFiltered = () => {
    const idsToRemove = new Set(filteredProducts.map((p) => p._id));
    setSelectedProductIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  // Save (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("error", "Please provide a festival category name.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        badgeText: formBadge.trim() || "Festival Special",
        bannerText: formBanner.trim(),
        description: formDesc.trim(),
        isActive: formIsActive,
        products: selectedProductIds,
      };

      const url = editingFestival ? `/api/festivals/${editingFestival._id}` : "/api/festivals";
      const method = editingFestival ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to save festival category.");
        setSaving(false);
        return;
      }

      showToast(
        "success",
        editingFestival
          ? `Festival category "${formName}" updated successfully.`
          : `Festival category "${formName}" created successfully.`
      );
      setIsModalOpen(false);
      fetchFestivals();
    } catch (err) {
      console.error("Save festival failed", err);
      showToast("error", "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Toggle Active
  const handleQuickToggle = async (fest: FestivalCategoryItem) => {
    try {
      const res = await fetch(`/api/festivals/${fest._id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to update festival status.");
        return;
      }
      const nowActive = data.data.isActive;
      showToast(
        "success",
        nowActive
          ? `✨ "${fest.name}" is now ACTIVE and live on the customer website!`
          : `"${fest.name}" is now DEACTIVATED and hidden from the website.`
      );
      fetchFestivals();
    } catch (err) {
      console.error("Toggle failed", err);
      showToast("error", "Failed to update festival status.");
    }
  };

  // Delete Festival Category
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Failed to delete festival category.");
        return;
      }
      showToast("success", "Festival category deleted. All assigned products remain untouched.");
      setDeleteConfirmId(null);
      fetchFestivals();
    } catch (err) {
      console.error("Delete failed", err);
      showToast("error", "Failed to delete festival category.");
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "5rem" }}>
      {/* Toast Notification */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            background: feedback.type === "success" ? "#065f46" : "#991b1b",
            color: "#ffffff",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {feedback.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              marginLeft: "8px",
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#b89d72",
                fontWeight: 700,
              }}
            >
              Occasions &amp; Campaigns
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: "#2c2c2c",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Dynamic Festival Specials
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#6b6560", marginTop: "6px", maxWidth: "680px" }}>
            Add, switch, or remove temporary festival categories (e.g. Diwali Special, Holi Special,
            Rakhi Special, Christmas Special) anytime. Assigned products safely retain their permanent categories.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={fetchFestivals}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0.65rem 1rem",
              background: "#ffffff",
              border: "1px solid #ede5d8",
              borderRadius: "10px",
              fontSize: "0.82rem",
              color: "#2c2c2c",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.65rem 1.35rem",
              background: "#2c2c2c",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Plus size={16} />
            <span>New Festival Category</span>
          </button>
        </div>
      </div>

      {/* Active Festival Spotlight Card */}
      <div
        style={{
          background: activeFestival
            ? "linear-gradient(135deg, #2c2c2c 0%, #1f1f1f 100%)"
            : "#ffffff",
          borderRadius: "16px",
          border: activeFestival ? "1px solid #b89d72" : "1px solid #ede5d8",
          padding: "1.5rem 1.75rem",
          marginBottom: "2.5rem",
          color: activeFestival ? "#ffffff" : "#2c2c2c",
          boxShadow: activeFestival
            ? "0 10px 30px rgba(184, 157, 114, 0.15)"
            : "0 2px 10px rgba(0,0,0,0.02)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: activeFestival ? "rgba(184, 157, 114, 0.2)" : "#faf7f2",
              border: activeFestival ? "1px solid #b89d72" : "1px solid #ede5d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: activeFestival ? "#d4b896" : "#6b6560",
              flexShrink: 0,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "0.68rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: activeFestival ? "#d4b896" : "#a09990",
                  fontWeight: 700,
                }}
              >
                Website Status
              </span>
              {activeFestival ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid #10b981",
                    color: "#34d399",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#34d399",
                      boxShadow: "0 0 6px #34d399",
                    }}
                  />
                  Live on Website
                </span>
              ) : (
                <span
                  style={{
                    background: "#f3f0ea",
                    color: "#78716c",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                  }}
                >
                  Standard Mode (No Active Festival)
                </span>
              )}
            </div>

            {activeFestival ? (
              <>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.7rem",
                    fontWeight: 500,
                    color: "#f5f0e8",
                    margin: "4px 0 2px",
                  }}
                >
                  {activeFestival.name}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "rgba(245, 240, 232, 0.75)",
                    margin: 0,
                    maxWidth: "580px",
                  }}
                >
                  {activeFestival.bannerText ||
                    activeFestival.description ||
                    "Festival category is active and visible to customers on the Shop page."}
                </p>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.75rem", color: "#d4b896" }}>
                  <span>✓ {activeFestival.products.length} products curated</span>
                  <span>✓ URL: /shop?category=festival-special</span>
                </div>
              </>
            ) : (
              <>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#2c2c2c",
                    margin: "4px 0 2px",
                  }}
                >
                  No Festival Special is currently live
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#6b6560", margin: 0 }}>
                  Activate an existing festival category below or create a new one to show it to customers on the website.
                </p>
              </>
            )}
          </div>
        </div>

        {activeFestival && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleOpenEdit(activeFestival)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.1)",
                color: "#f5f0e8",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "0.78rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Edit2 size={13} />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => handleQuickToggle(activeFestival)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                background: "#be123c",
                color: "#ffffff",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <XCircle size={14} />
              <span>Deactivate Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Festival Categories Section */}
      <div style={{ marginBottom: "1rem" }}>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.5rem",
            color: "#2c2c2c",
            fontWeight: 500,
            marginBottom: "0.25rem",
          }}
        >
          All Festival Special Categories
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#6b6560", marginBottom: "1.25rem" }}>
          You can keep multiple festival presets saved. Toggle the active status whenever the occasion arrives.
        </p>
      </div>

      {/* Grid of Festivals */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                height: "240px",
                background: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #ede5d8",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      ) : festivals.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "2px dashed #ede5d8",
            padding: "3.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#faf7f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              color: "#b89d72",
            }}
          >
            <Sparkles size={26} />
          </div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.6rem",
              color: "#2c2c2c",
              marginBottom: "0.4rem",
            }}
          >
            No Festival Categories Yet
          </h3>
          <p style={{ fontSize: "0.88rem", color: "#6b6560", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
            Create your first festival special (such as Diwali Special, Holi Special, Rakhi Special, or Christmas Special)
            and choose which products appear under it.
          </p>
          <button
            onClick={handleOpenCreate}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#2c2c2c",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            + Create First Festival Category
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {festivals.map((fest) => {
            const isLive = fest.isActive;
            return (
              <div
                key={fest._id}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: isLive ? "1.5px solid #10b981" : "1px solid #ede5d8",
                  padding: "1.4rem",
                  boxShadow: isLive
                    ? "0 6px 20px rgba(16, 185, 129, 0.12)"
                    : "0 2px 10px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                {/* Header */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "#b89d72",
                          fontWeight: 700,
                        }}
                      >
                        {fest.badgeText || "Festival Special"}
                      </span>
                      <h3
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.4rem",
                          fontWeight: 600,
                          color: "#2c2c2c",
                          margin: "2px 0 6px",
                        }}
                      >
                        {fest.name}
                      </h3>
                    </div>

                    {/* Status Pill */}
                    {isLive ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: "#10b981",
                          }}
                        />
                        Active Live
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#f3f0ea",
                          color: "#78716c",
                          border: "1px solid #e7e5e4",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Banner / Description text */}
                  {fest.bannerText && (
                    <div
                      style={{
                        background: "#faf7f2",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        borderLeft: "3px solid #b89d72",
                        fontSize: "0.78rem",
                        color: "#57534e",
                        margin: "0.6rem 0",
                        fontStyle: "italic",
                      }}
                    >
                      &quot;{fest.bannerText}&quot;
                    </div>
                  )}

                  {fest.description && !fest.bannerText && (
                    <p style={{ fontSize: "0.8rem", color: "#6b6560", margin: "0.5rem 0 0.8rem", lineHeight: 1.5 }}>
                      {fest.description}
                    </p>
                  )}

                  {/* Products Preview */}
                  <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid #f3ece1" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.75rem",
                        color: "#6b6560",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Assigned Products:</span>
                      <span
                        style={{
                          background: "#faf7f2",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: 700,
                          color: "#2c2c2c",
                        }}
                      >
                        {fest.products.length} item{fest.products.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {fest.products.length > 0 ? (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", maxHeight: "40px", overflow: "hidden" }}>
                        {fest.products.slice(0, 6).map((prod) => (
                          <div
                            key={prod._id}
                            title={prod.name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              overflow: "hidden",
                              position: "relative",
                              background: "#f0ece4",
                              border: "1px solid #ede5d8",
                            }}
                          >
                            {prod.images && prod.images[0] ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                sizes="36px"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#a09990",
                                }}
                              >
                                <Package size={14} />
                              </div>
                            )}
                          </div>
                        ))}
                        {fest.products.length > 6 && (
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              background: "#ede5d8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: "#6b6560",
                            }}
                          >
                            +{fest.products.length - 6}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.75rem", color: "#a09990", margin: "4px 0" }}>
                        No products assigned yet. Click &quot;Edit&quot; to pick products.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1.25rem",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid #f3ece1",
                    gap: "8px",
                  }}
                >
                  {/* Quick Toggle Button */}
                  <button
                    onClick={() => handleQuickToggle(fest)}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      border: "none",
                      background: isLive ? "#fee2e2" : "#ecfdf5",
                      color: isLive ? "#b91c1c" : "#047857",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "5px",
                    }}
                  >
                    {isLive ? (
                      <>
                        <XCircle size={13} />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} />
                        <span>Activate on Site</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(fest)}
                    title="Edit festival category and products"
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #ede5d8",
                      background: "#faf7f2",
                      color: "#2c2c2c",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirmId(fest._id)}
                    title="Delete festival category (products are preserved)"
                    style={{
                      padding: "0.5rem 0.65rem",
                      borderRadius: "8px",
                      border: "1px solid #fee2e2",
                      background: "#fff1f2",
                      color: "#be123c",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "840px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              overflow: "hidden",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #ede5d8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#faf7f2",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#b89d72",
                    fontWeight: 700,
                  }}
                >
                  Festival Configuration
                </span>
                <h2
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "1.6rem",
                    color: "#2c2c2c",
                    margin: 0,
                  }}
                >
                  {editingFestival ? `Edit: ${editingFestival.name}` : "Create Festival Category"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b6560",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSubmit} style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>
              {/* Presets Row */}
              <div style={{ marginBottom: "1.5rem" }}>
                <span style={labelStyle}>Quick Presets (Click to autofill)</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {PRESET_FESTIVALS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        borderRadius: "20px",
                        border: "1px solid #ede5d8",
                        background: formName === preset.name ? "#2c2c2c" : "#faf7f2",
                        color: formName === preset.name ? "#ffffff" : "#6b6560",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Fields Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={labelStyle}>Festival Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diwali Special, Christmas Special"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Badge Tag (Shown on Tab / Cards)</label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Special, Limited Edition"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Announcement Banner Text (Shown on Shop Page)</label>
                <input
                  type="text"
                  placeholder="e.g. Celebrate with handcrafted festival creations &amp; bespoke gifts 🪔✨"
                  value={formBanner}
                  onChange={(e) => setFormBanner(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Internal notes or extended description for customers..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Active Toggle Switch */}
              <div
                style={{
                  background: formIsActive ? "#ecfdf5" : "#faf7f2",
                  border: formIsActive ? "1px solid #10b981" : "1px solid #ede5d8",
                  padding: "0.85rem 1rem",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.75rem",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#2c2c2c" }}>
                    Activate &amp; Show on Website Immediately
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b6560" }}>
                    When active, customers will see this festival category on the shop page and navigation.
                    Only one festival can be live at a time.
                  </div>
                </div>
                <label
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "48px",
                    height: "26px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      cursor: "pointer",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: formIsActive ? "#10b981" : "#d6d3d1",
                      borderRadius: "26px",
                      transition: "0.3s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        content: "",
                        height: "20px",
                        width: "20px",
                        left: formIsActive ? "24px" : "3px",
                        bottom: "3px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        transition: "0.3s",
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* PRODUCT SELECTION SECTION */}
              <div style={{ borderTop: "1px solid #ede5d8", paddingTop: "1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2c2c2c", margin: 0 }}>
                      Select Products for this Festival Category ({selectedProductIds.length} selected)
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "#6b6560", margin: "2px 0 0" }}>
                      Products assigned here will appear under this festival. Their original categories are completely preserved.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={handleSelectAllFiltered}
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.3rem 0.65rem",
                        background: "#faf7f2",
                        border: "1px solid #ede5d8",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Select All Filtered
                    </button>
                    <button
                      type="button"
                      onClick={handleClearFiltered}
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.3rem 0.65rem",
                        background: "#faf7f2",
                        border: "1px solid #ede5d8",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Clear Filtered
                    </button>
                  </div>
                </div>

                {/* Filter Controls for Product Selector */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Search
                      size={14}
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#a09990",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search products by name..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: "30px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    style={{ ...inputStyle, fontSize: "0.8rem" }}
                  >
                    <option value="">All Permanent Categories</option>
                    {ORDERED_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product List Box */}
                <div
                  style={{
                    maxHeight: "280px",
                    overflowY: "auto",
                    border: "1px solid #ede5d8",
                    borderRadius: "10px",
                    background: "#ffffff",
                    padding: "4px",
                  }}
                >
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#a09990", fontSize: "0.82rem" }}>
                      No products match your search/filter.
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = selectedProductIds.includes(p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => handleToggleProduct(p._id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "0.55rem 0.75rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: isSelected ? "rgba(184, 157, 114, 0.1)" : "transparent",
                            borderBottom: "1px solid #f7f4ee",
                            transition: "background 0.15s ease",
                          }}
                        >
                          {/* Checkbox */}
                          <div
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "4px",
                              border: isSelected ? "2px solid #b89d72" : "2px solid #d6d3d1",
                              background: isSelected ? "#b89d72" : "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffffff",
                              flexShrink: 0,
                            }}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>

                          {/* Thumbnail */}
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              overflow: "hidden",
                              position: "relative",
                              background: "#faf7f2",
                              flexShrink: 0,
                            }}
                          >
                            {p.images && p.images[0] ? (
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="36px"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <Package size={16} style={{ color: "#a09990" }} />
                            )}
                          </div>

                          {/* Product Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 500,
                                color: "#2c2c2c",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {p.name}
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  color: "#b89d72",
                                  fontWeight: 600,
                                  background: "#faf7f2",
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                }}
                              >
                                {getCategoryLabel(p.category)}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#6b6560" }}>
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Safety notice */}
              <div
                style={{
                  marginTop: "1.25rem",
                  padding: "0.75rem 1rem",
                  background: "#faf7f2",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.75rem",
                  color: "#6b6560",
                }}
              >
                <ShieldCheck size={16} color="#059669" />
                <span>
                  <strong>Category Integrity:</strong> When this festival ends, deactivating or deleting it will{" "}
                  <strong>never</strong> delete products or modify their permanent categories.
                </span>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "1.5rem",
                  borderTop: "1px solid #ede5d8",
                  paddingTop: "1.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "0.65rem 1.25rem",
                    borderRadius: "10px",
                    border: "1px solid #ede5d8",
                    background: "#ffffff",
                    fontSize: "0.85rem",
                    color: "#2c2c2c",
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
                    borderRadius: "10px",
                    border: "none",
                    background: "#2c2c2c",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : editingFestival ? "Update Festival Category" : "Save Festival Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "460px",
              width: "100%",
              padding: "1.75rem",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#be123c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.5rem",
                color: "#2c2c2c",
                margin: "0 0 0.5rem",
              }}
            >
              Delete Festival Category?
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#6b6560", lineHeight: 1.6, margin: "0 0 1.25rem" }}>
              Are you sure you want to remove this festival category?
              <br />
              <strong style={{ color: "#059669" }}>
                ✓ No products will be deleted.
              </strong>{" "}
              All assigned products will safely retain their original permanent categories.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "8px",
                  border: "1px solid #ede5d8",
                  background: "#ffffff",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  padding: "0.55rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: "#be123c",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
