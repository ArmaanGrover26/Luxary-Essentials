"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  Package,
  GripVertical,
  Search,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getCategoryLabel } from "@/config/categories";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  price: number;
  mrp?: number | null;
  category: string;
  images: string[];
  stock: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewArrivalsAdminPage() {
  // Carousel config state
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, Product>>({});

  // All-products picker
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOver = useRef<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchConfig();
    fetchAllProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchConfig() {
    try {
      setLoading(true);
      const res = await fetch("/api/new-arrivals");
      const data = await res.json();
      if (data.success) {
        setIsEnabled(data.data.isEnabled);
        const prods: Product[] = data.data.products ?? [];
        setSelectedIds(prods.map((p) => p._id));
        const map: Record<string, Product> = {};
        prods.forEach((p) => (map[p._id] = p));
        setSelectedMap(map);
      }
    } catch {
      showToast("Failed to load carousel config", false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllProducts() {
    try {
      const res = await fetch("/api/products?limit=100&sort=createdAt&order=desc");
      const data = await res.json();
      if (data.success) {
        setAllProducts(data.data.products ?? []);
      }
    } catch {
      showToast("Failed to load products", false);
    }
  }

  // ── Search / filter ────────────────────────────────────────────────────────

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(
        allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      );
    }
  }, [search, allProducts]);

  // ── Selection helpers ──────────────────────────────────────────────────────

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleProduct = (product: Product) => {
    if (isSelected(product._id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== product._id));
      setSelectedMap((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    } else {
      if (selectedIds.length >= 20) {
        showToast("Maximum 20 products allowed in the carousel", false);
        return;
      }
      setSelectedIds((prev) => [...prev, product._id]);
      setSelectedMap((prev) => ({ ...prev, [product._id]: product }));
    }
  };

  const removeSelected = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setSelectedMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Move up/down in order
  const moveItem = (id: string, dir: -1 | 1) => {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  // ── Drag-and-drop reorder ──────────────────────────────────────────────────

  const onDragStart = (id: string) => setDragging(id);
  const onDragEnter = (id: string) => {
    dragOver.current = id;
  };
  const onDragEnd = () => {
    if (dragging && dragOver.current && dragging !== dragOver.current) {
      setSelectedIds((prev) => {
        const from = prev.indexOf(dragging);
        const to = prev.indexOf(dragOver.current!);
        if (from < 0 || to < 0) return prev;
        const next = [...prev];
        next.splice(from, 1);
        next.splice(to, 0, dragging);
        return next;
      });
    }
    setDragging(null);
    dragOver.current = null;
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/new-arrivals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnabled,
          productIds: selectedIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Carousel saved successfully!");
      } else {
        showToast(data.error ?? "Failed to save", false);
      }
    } catch {
      showToast("Network error — changes not saved", false);
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle enabled ─────────────────────────────────────────────────────────

  async function handleToggleEnabled() {
    const next = !isEnabled;
    setIsEnabled(next);
    // Optimistically save toggle
    try {
      const res = await fetch("/api/new-arrivals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: next }),
      });
      const data = await res.json();
      if (!data.success) {
        setIsEnabled(!next); // rollback
        showToast("Failed to update status", false);
      } else {
        showToast(
          next ? "Carousel is now visible on the homepage" : "Carousel hidden from homepage",
          true
        );
      }
    } catch {
      setIsEnabled(!next);
      showToast("Network error", false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "80px",
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #ede5d8",
              animation: "pulse 1.5s infinite",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            padding: "0.85rem 1.25rem",
            background: toast.ok ? "#ecfdf5" : "#fff1f2",
            border: `1px solid ${toast.ok ? "#a7f3d0" : "#fecdd3"}`,
            borderRadius: "12px",
            color: toast.ok ? "#065f46" : "#9f1239",
            fontSize: "0.875rem",
            fontWeight: 500,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            maxWidth: "360px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div
        style={{
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
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "0.25rem",
            }}
          >
            <Sparkles size={18} color="#b89d72" />
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.85rem",
                fontWeight: 500,
                color: "#2c2c2c",
                margin: 0,
              }}
            >
              New Arrivals Carousel
            </h1>
          </div>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "0.875rem",
              color: "#6b6560",
              margin: 0,
            }}
          >
            Curate and reorder the products shown in the New Arrivals carousel on the homepage.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={fetchConfig}
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
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={handleToggleEnabled}
            style={{
              padding: "0.6rem 1.15rem",
              background: isEnabled ? "#ecfdf5" : "#f5f0e8",
              color: isEnabled ? "#047857" : "#6b6560",
              borderRadius: "10px",
              border: `1px solid ${isEnabled ? "#a7f3d0" : "#ede5d8"}`,
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {isEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
            {isEnabled ? "Visible on Site" : "Hidden from Site"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "0.6rem 1.25rem",
              background: "#b89d72",
              color: "#ffffff",
              borderRadius: "10px",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(184,157,114,0.3)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Main two-column layout */}
      <div
        className="new-arrivals-admin-grid"
        style={{ display: "grid", gap: "1.5rem" }}
      >

        {/* LEFT — Selected products queue */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #ede5d8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.1rem 1.5rem",
              borderBottom: "1px solid #ede5d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: "#2c2c2c",
                  margin: 0,
                }}
              >
                Carousel Queue
              </h2>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.75rem",
                  color: "#a09990",
                  marginTop: "2px",
                }}
              >
                {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} selected
                {selectedIds.length === 0 && " — add from the picker →"}
              </p>
            </div>
            {selectedIds.length > 0 && (
              <span
                style={{
                  padding: "0.25rem 0.7rem",
                  background: "#fffbeb",
                  color: "#b45309",
                  border: "1px solid #fde68a",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                {selectedIds.length}/20
              </span>
            )}
          </div>

          {selectedIds.length === 0 ? (
            <div
              style={{
                padding: "3rem 1.5rem",
                textAlign: "center",
                color: "#a09990",
              }}
            >
              <Package
                size={36}
                style={{ margin: "0 auto 0.75rem", color: "#d4b896" }}
              />
              <p style={{ fontSize: "0.875rem" }}>
                No products in the carousel yet.
              </p>
              <p style={{ fontSize: "0.78rem", marginTop: "0.25rem" }}>
                Use the product picker on the right to add items.
              </p>
            </div>
          ) : (
            <div style={{ padding: "0.75rem" }}>
              {selectedIds.map((id, idx) => {
                const p = selectedMap[id];
                if (!p) return null;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={() => onDragStart(id)}
                    onDragEnter={() => onDragEnter(id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.65rem 0.75rem",
                      marginBottom: "4px",
                      background:
                        dragging === id ? "#faf7f2" : "#ffffff",
                      border: `1px solid ${dragging === id ? "#b89d72" : "#ede5d8"}`,
                      borderRadius: "10px",
                      transition: "all 0.15s ease",
                      cursor: "grab",
                    }}
                  >
                    {/* Drag handle */}
                    <GripVertical
                      size={16}
                      style={{ color: "#c5bdb5", flexShrink: 0 }}
                    />

                    {/* Thumbnail */}
                    {p.images?.[0] ? (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="40px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          background: "#f5f0e8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Package size={16} color="#d4b896" />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 500,
                          color: "#2c2c2c",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#a09990",
                          marginTop: "2px",
                        }}
                      >
                        {getCategoryLabel(p.category)} · {fmt(p.price)}
                      </div>
                    </div>

                    {/* Position badge */}
                    <span
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: "#b89d72",
                        background: "#faf7f2",
                        border: "1px solid #ede5d8",
                        borderRadius: "6px",
                        padding: "2px 7px",
                        flexShrink: 0,
                      }}
                    >
                      #{idx + 1}
                    </span>

                    {/* Move up/down */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 }}>
                      <button
                        onClick={() => moveItem(id, -1)}
                        disabled={idx === 0}
                        style={{
                          width: "22px", height: "22px",
                          border: "1px solid #ede5d8",
                          borderRadius: "5px",
                          background: "none",
                          cursor: idx === 0 ? "not-allowed" : "pointer",
                          color: idx === 0 ? "#ddd" : "#6b6560",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        onClick={() => moveItem(id, 1)}
                        disabled={idx === selectedIds.length - 1}
                        style={{
                          width: "22px", height: "22px",
                          border: "1px solid #ede5d8",
                          borderRadius: "5px",
                          background: "none",
                          cursor: idx === selectedIds.length - 1 ? "not-allowed" : "pointer",
                          color: idx === selectedIds.length - 1 ? "#ddd" : "#6b6560",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0,
                        }}
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeSelected(id)}
                      style={{
                        width: "28px",
                        height: "28px",
                        border: "1px solid #fecdd3",
                        borderRadius: "7px",
                        background: "#fff1f2",
                        color: "#be123c",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        padding: 0,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Product picker */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #ede5d8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Picker header */}
          <div
            style={{
              padding: "1.1rem 1.5rem",
              borderBottom: "1px solid #ede5d8",
            }}
          >
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.25rem",
                fontWeight: 500,
                color: "#2c2c2c",
                margin: 0,
                marginBottom: "0.75rem",
              }}
            >
              Product Picker
            </h2>

            {/* Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "#faf7f2",
                border: "1px solid #ede5d8",
                borderRadius: "10px",
                padding: "0.5rem 0.85rem",
              }}
            >
              <Search size={15} style={{ color: "#a09990", flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or category…"
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.85rem",
                  color: "#2c2c2c",
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a09990",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Product list */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              maxHeight: "520px",
              padding: "0.75rem",
            }}
          >
            {filteredProducts.length === 0 ? (
              <div
                style={{
                  padding: "2.5rem",
                  textAlign: "center",
                  color: "#a09990",
                  fontSize: "0.875rem",
                }}
              >
                {search ? "No products match your search." : "No products available."}
              </div>
            ) : (
              filteredProducts.map((product) => {
                const selected = isSelected(product._id);
                return (
                  <div
                    key={product._id}
                    onClick={() => toggleProduct(product)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.65rem 0.75rem",
                      marginBottom: "4px",
                      background: selected ? "#faf7f2" : "#ffffff",
                      border: `1px solid ${selected ? "rgba(184,157,114,0.4)" : "#ede5d8"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Thumbnail */}
                    {product.images?.[0] ? (
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="44px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "8px",
                          background: "#f5f0e8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Package size={18} color="#d4b896" />
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.83rem",
                          fontWeight: selected ? 600 : 400,
                          color: "#2c2c2c",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#a09990",
                          marginTop: "2px",
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{getCategoryLabel(product.category)}</span>
                        <span>·</span>
                        <span style={{ color: "#b89d72", fontWeight: 600 }}>
                          {fmt(product.price)}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <>
                            <span>·</span>
                            <span style={{ color: "#be123c", fontWeight: 600 }}>
                              -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                            </span>
                          </>
                        )}
                        {product.stock === 0 && (
                          <>
                            <span>·</span>
                            <span style={{ color: "#be123c" }}>Out of stock</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "6px",
                        border: `2px solid ${selected ? "#b89d72" : "#d4cfc8"}`,
                        background: selected ? "#b89d72" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {selected && <CheckCircle2 size={14} color="white" />}
                      {!selected && <Plus size={12} color="#d4cfc8" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .new-arrivals-admin-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
