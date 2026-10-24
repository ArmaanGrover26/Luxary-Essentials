"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface CartItem {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image?: string;
  color?: string;
  qty: number;
  maxPurchasable?: number;
  inStock?: boolean;
  stockStatus?: StockStatus;
}

export interface AddToCartResult {
  success: boolean;
  message?: string;
  addedQty?: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "qty">, quantityToAdd?: number) => AddToCartResult;
  updateQty: (id: string | number, delta: number) => { success: boolean; message?: string };
  setExactQty: (id: string | number, exactQty: number) => { success: boolean; message?: string };
  removeItem: (id: string | number) => void;
  clearCart: () => void;
  totalCount: number;
  getItemCartQty: (id: string | number) => number;
  revalidateCart: () => Promise<{ adjusted: boolean; messages: string[] }>;
  cartNotification: string | null;
  setCartNotification: (msg: string | null) => void;
  isRevalidating: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartNotification, setCartNotificationState] = useState<string | null>(null);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);

  const setCartNotification = useCallback((msg: string | null) => {
    setCartNotificationState(msg);
  }, []);

  // Auto-clear notification after 4 seconds
  useEffect(() => {
    if (!cartNotification) return;
    const t = setTimeout(() => setCartNotificationState(null), 4000);
    return () => clearTimeout(t);
  }, [cartNotification]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("le_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem("le_cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const getItemCartQty = useCallback(
    (id: string | number): number => {
      const found = items.find((i) => String(i.id) === String(id));
      return found ? found.qty : 0;
    },
    [items]
  );

  const addToCart = useCallback(
    (product: Omit<CartItem, "qty">, quantityToAdd: number = 1): AddToCartResult => {
      const addCount = Math.max(1, Math.floor(quantityToAdd));
      const prodId = String(product.id);
      const existing = items.find((i) => String(i.id) === prodId);
      const currentQty = existing ? existing.qty : 0;

      // Determine ceiling (default 10 if not set)
      const maxAllowed = typeof product.maxPurchasable === "number"
        ? Math.max(0, product.maxPurchasable)
        : (product.inStock === false ? 0 : 10);

      if (maxAllowed <= 0) {
        const msg = "This item is currently out of stock.";
        setCartNotification(msg);
        return { success: false, message: msg };
      }

      const availableToAdd = Math.max(0, maxAllowed - currentQty);

      if (availableToAdd <= 0) {
        const msg = "You've reached the available quantity for this item.";
        setCartNotification(msg);
        return { success: false, message: msg };
      }

      const actualToAdd = Math.min(addCount, availableToAdd);

      setItems((prev) => {
        const idx = prev.findIndex((i) => String(i.id) === prodId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            ...product,
            qty: updated[idx].qty + actualToAdd,
            maxPurchasable: maxAllowed,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ...product,
              qty: actualToAdd,
              maxPurchasable: maxAllowed,
            },
          ];
        }
      });

      if (actualToAdd < addCount) {
        const msg = "You've reached the available quantity for this item.";
        setCartNotification(msg);
        return { success: true, message: msg, addedQty: actualToAdd };
      }

      return { success: true, addedQty: actualToAdd };
    },
    [items, setCartNotification]
  );

  const updateQty = useCallback(
    (id: string | number, delta: number): { success: boolean; message?: string } => {
      const prodId = String(id);
      const target = items.find((i) => String(i.id) === prodId);
      if (!target) return { success: false };

      const maxAllowed = typeof target.maxPurchasable === "number" ? target.maxPurchasable : 10;

      if (delta > 0 && target.qty >= maxAllowed) {
        const msg = "You've reached the available quantity for this item.";
        setCartNotification(msg);
        return { success: false, message: msg };
      }

      const nextQty = Math.max(1, Math.min(maxAllowed, target.qty + delta));

      setItems((prev) =>
        prev.map((i) => (String(i.id) === prodId ? { ...i, qty: nextQty } : i))
      );

      return { success: true };
    },
    [items, setCartNotification]
  );

  const setExactQty = useCallback(
    (id: string | number, exactQty: number): { success: boolean; message?: string } => {
      const prodId = String(id);
      const target = items.find((i) => String(i.id) === prodId);
      if (!target) return { success: false };

      const maxAllowed = typeof target.maxPurchasable === "number" ? target.maxPurchasable : 10;
      const parsed = Math.max(1, Math.floor(Number(exactQty) || 1));

      if (parsed > maxAllowed) {
        const msg = "You've reached the available quantity for this item.";
        setCartNotification(msg);
        setItems((prev) =>
          prev.map((i) => (String(i.id) === prodId ? { ...i, qty: maxAllowed } : i))
        );
        return { success: false, message: msg };
      }

      setItems((prev) =>
        prev.map((i) => (String(i.id) === prodId ? { ...i, qty: parsed } : i))
      );
      return { success: true };
    },
    [items, setCartNotification]
  );

  const removeItem = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Background server revalidation of cart items
  const revalidateCart = useCallback(async (): Promise<{ adjusted: boolean; messages: string[] }> => {
    if (items.length === 0) return { adjusted: false, messages: [] };

    try {
      setIsRevalidating(true);
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: String(i.id), quantity: i.qty })),
        }),
      });

      const data = await res.json();
      if (!data.success || !Array.isArray(data.data?.results)) {
        return { adjusted: false, messages: [] };
      }

      const results = data.data.results;
      const messages: string[] = [];
      let hadAdjustment = false;

      setItems((prev) => {
        return prev.map((item) => {
          const match = results.find((r: any) => String(r.productId) === String(item.id));
          if (!match) return item;

          const updatedItem = {
            ...item,
            inStock: match.inStock,
            stockStatus: match.stockStatus,
            maxPurchasable: match.maxPurchasable,
            price: match.price ?? item.price,
          };

          if (match.outOfStock) {
            hadAdjustment = true;
            messages.push(`"${item.name}" is currently out of stock.`);
            updatedItem.qty = 0;
          } else if (match.adjusted || item.qty > match.allowedQuantity) {
            hadAdjustment = true;
            messages.push(`Quantity for "${item.name}" was adjusted to the available limit.`);
            updatedItem.qty = Math.max(1, match.allowedQuantity);
          }

          return updatedItem;
        });
      });

      if (messages.length > 0) {
        setCartNotification(messages[0]);
      }

      return { adjusted: hadAdjustment, messages };
    } catch {
      return { adjusted: false, messages: [] };
    } finally {
      setIsRevalidating(false);
    }
  }, [items, setCartNotification]);

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQty,
        setExactQty,
        removeItem,
        clearCart,
        totalCount,
        getItemCartQty,
        revalidateCart,
        cartNotification,
        setCartNotification,
        isRevalidating,
      }}
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
