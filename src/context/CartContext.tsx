"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image?: string;
  color?: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "qty">) => void;
  updateQty: (id: string | number, delta: number) => void;
  removeItem: (id: string | number) => void;
  clearCart: () => void;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("le_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("le_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => String(i.id) === String(product.id));
      if (existing) {
        return prev.map((i) =>
          String(i.id) === String(product.id) ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string | number, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        String(i.id) === String(id)
          ? { ...i, qty: Math.max(1, i.qty + delta) }
          : i
      )
    );
  };

  const removeItem = (id: string | number) =>
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQty, removeItem, clearCart, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
