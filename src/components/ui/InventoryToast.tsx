"use client";

import { useCart } from "@/context/CartContext";
import { AlertCircle, X } from "lucide-react";

export default function InventoryToast() {
  const { cartNotification, setCartNotification } = useCart();

  if (!cartNotification) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        background: "rgba(35, 31, 32, 0.96)",
        backdropFilter: "blur(8px)",
        color: "#ffffff",
        padding: "0.85rem 1.25rem",
        borderRadius: "12px",
        border: "1px solid rgba(184, 157, 114, 0.4)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        maxWidth: "420px",
        animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.85rem",
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          background: "rgba(184, 157, 114, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--gold)",
        }}
      >
        <AlertCircle size={16} />
      </div>

      <div style={{ flex: 1, lineHeight: 1.4 }}>
        {cartNotification}
      </div>

      <button
        onClick={() => setCartNotification(null)}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.6)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "4px",
        }}
        aria-label="Dismiss alert"
      >
        <X size={15} />
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
