import { NextRequest } from "next/server";
import { getAuthUser } from "./authMiddleware";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
export const MAX_PURCHASABLE_PER_ITEM = 10;

/**
 * Calculates customer-friendly stock status without exposing numbers.
 */
export function getStockStatus(stock: number | undefined | null, threshold: number = DEFAULT_LOW_STOCK_THRESHOLD): StockStatus {
    const qty = typeof stock === "number" && !isNaN(stock) ? Math.floor(stock) : 0;
    if (qty <= 0) return "out_of_stock";
    if (qty <= (threshold || DEFAULT_LOW_STOCK_THRESHOLD)) return "low_stock";
    return "in_stock";
}

/**
 * Friendly label for customers.
 */
export function getStockLabel(status: StockStatus): string {
    switch (status) {
        case "in_stock":
            return "In Stock";
        case "low_stock":
            return "Only a Few Left";
        case "out_of_stock":
            return "Out of Stock";
    }
}

/**
 * Detailed friendly message for product detail page.
 */
export function getStockDetailedMessage(status: StockStatus): string {
    switch (status) {
        case "in_stock":
            return "In Stock — Ready to Dispatch";
        case "low_stock":
            return "Only a Few Left — Order Soon";
        case "out_of_stock":
            return "Currently Out of Stock";
    }
}

/**
 * Computes maximum purchasable units for a customer.
 * Clamped by physical stock and max per order limit (10).
 */
export function getMaxPurchasable(stock: number | undefined | null, limit: number = MAX_PURCHASABLE_PER_ITEM): number {
    const qty = typeof stock === "number" && !isNaN(stock) ? Math.floor(stock) : 0;
    if (qty <= 0) return 0;
    return Math.max(0, Math.min(qty, limit));
}

/**
 * Checks if incoming request is from an authenticated admin.
 */
export async function isRequestAdmin(req: NextRequest): Promise<boolean> {
    try {
        const user = await getAuthUser(req);
        return user.role === "admin";
    } catch {
        return false;
    }
}

/**
 * Sanitizes a product object for public display.
 * Hides raw stock counts from customer responses while providing
 * stockStatus, inStock, and maxPurchasable.
 */
export function sanitizeProductForPublic<T extends Record<string, unknown>>(
    product: T,
    isAdmin: boolean
): T & {
    stockStatus: StockStatus;
    inStock: boolean;
    maxPurchasable: number;
    stock?: number;
} {
    const plain = typeof (product as any).toObject === "function"
        ? (product as any).toObject()
        : { ...product };

    const rawStock = typeof plain.stock === "number" ? plain.stock : 0;
    const threshold = typeof plain.lowStockThreshold === "number" ? plain.lowStockThreshold : DEFAULT_LOW_STOCK_THRESHOLD;

    const status = getStockStatus(rawStock, threshold);
    const inStock = status !== "out_of_stock";
    const maxPurchasable = getMaxPurchasable(rawStock);

    if (isAdmin) {
        return {
            ...plain,
            stock: rawStock,
            lowStockThreshold: threshold,
            stockStatus: status,
            inStock,
            maxPurchasable,
        };
    }

    // Customer-facing: completely strip raw warehouse stock and internal thresholds
    const { stock: _omittedStock, lowStockThreshold: _omittedThreshold, ...safeFields } = plain;

    return {
        ...safeFields,
        stockStatus: status,
        inStock,
        maxPurchasable,
    };
}
