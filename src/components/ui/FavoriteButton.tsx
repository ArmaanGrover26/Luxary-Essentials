"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

interface FavoriteButtonProps {
  productId: string;
  size?: "sm" | "md" | "lg";
  variant?: "floating" | "inline";
  style?: React.CSSProperties;
  className?: string;
}

export default function FavoriteButton({
  productId,
  size = "md",
  variant = "floating",
  style,
  className,
}: FavoriteButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [animating, setAnimating] = useState(false);
  const saved = isWishlisted(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAnimating(true);
    await toggleWishlist(productId);
    setTimeout(() => setAnimating(false), 300);
  };

  const getDimensions = () => {
    switch (size) {
      case "sm":
        return { btn: "28px", icon: 14 };
      case "lg":
        return { btn: "44px", icon: 20 };
      case "md":
      default:
        return { btn: "34px", icon: 16 };
    }
  };

  const { btn, icon } = getDimensions();

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
        className={className}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "6px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: saved ? "#be123c" : "var(--charcoal)",
          transition: "transform 0.15s ease, color 0.2s ease",
          transform: animating ? "scale(1.2)" : "scale(1)",
          ...style,
        }}
      >
        <Heart
          size={icon}
          fill={saved ? "#be123c" : "none"}
          color={saved ? "#be123c" : "currentColor"}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      className={className}
      style={{
        position: "absolute",
        top: "0.75rem",
        right: "0.75rem",
        width: btn,
        height: btn,
        borderRadius: "50%",
        background: saved ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
        zIndex: 10,
        color: saved ? "#be123c" : "var(--charcoal)",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: animating ? "scale(1.25)" : "scale(1)",
        ...style,
      }}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
    >
      <Heart
        size={icon}
        fill={saved ? "#be123c" : "none"}
        color={saved ? "#be123c" : "currentColor"}
        strokeWidth={1.75}
      />
    </button>
  );
}
