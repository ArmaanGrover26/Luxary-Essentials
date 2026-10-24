"use client";

import { useWishlist } from "@/context/WishlistContext";
import { Heart, X } from "lucide-react";
import Link from "next/link";

export default function WishlistToast() {
  const { wishlistNotification, clearWishlistNotification } = useWishlist();

  if (!wishlistNotification) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: "80px",
        right: "24px",
        zIndex: 9998,
        background: "rgba(28, 25, 23, 0.96)",
        backdropFilter: "blur(10px)",
        color: "#ffffff",
        padding: "0.85rem 1.2rem",
        borderRadius: "14px",
        border: "1px solid rgba(190, 18, 60, 0.35)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "400px",
        animation: "slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "'Jost', sans-serif",
        fontSize: "0.85rem",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(190, 18, 60, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#be123c",
        }}
      >
        <Heart size={16} fill="#be123c" />
      </div>

      <div style={{ flex: 1, lineHeight: 1.4 }}>
        <div>{wishlistNotification}</div>
        <Link
          href="/wishlist"
          onClick={clearWishlistNotification}
          style={{
            fontSize: "0.75rem",
            color: "var(--gold)",
            fontWeight: 600,
            textDecoration: "underline",
            marginTop: "2px",
            display: "inline-block",
          }}
        >
          View Wishlist →
        </Link>
      </div>

      <button
        onClick={clearWishlistNotification}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255, 255, 255, 0.6)",
          cursor: "pointer",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>

      <style>{`
        @keyframes slideInToast {
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
