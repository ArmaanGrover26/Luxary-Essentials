import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { successResponse, errorResponse, serverErrorResponse } from "@/utils/apiResponse";
import { getStockStatus, getMaxPurchasable, StockStatus } from "@/lib/inventoryUtils";

interface CartValidateRequestItem {
    productId: string;
    quantity: number;
}

export interface CartItemValidationResult {
    productId: string;
    valid: boolean;
    name?: string;
    price?: number;
    inStock: boolean;
    stockStatus: StockStatus;
    maxPurchasable: number;
    requestedQuantity: number;
    allowedQuantity: number;
    message?: string;
    adjusted?: boolean;
    outOfStock?: boolean;
    notFound?: boolean;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        if (!body || !Array.isArray(body.items)) {
            return errorResponse("Invalid cart items format");
        }

        const items: CartValidateRequestItem[] = body.items;

        if (items.length === 0) {
            return successResponse({ allValid: true, results: [] });
        }

        const validObjectIds = items
            .map((i: any) => i.productId || i.product || i._id)
            .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)));

        const products = await Product.find({ _id: { $in: validObjectIds } }).lean();
        const productMap = new Map<string, any>();
        for (const p of products) {
            productMap.set(String(p._id), p);
        }

        let allValid = true;
        const results: CartItemValidationResult[] = [];

        for (const item of items) {
            const rawId = String(item.productId || (item as any).product || (item as any)._id);
            const requestedQty = Math.max(1, Math.floor(Number(item.quantity) || 1));
            const p = productMap.get(rawId);

            if (!p) {
                allValid = false;
                results.push({
                    productId: rawId,
                    valid: false,
                    inStock: false,
                    stockStatus: "out_of_stock",
                    maxPurchasable: 0,
                    requestedQuantity: requestedQty,
                    allowedQuantity: 0,
                    notFound: true,
                    outOfStock: true,
                    message: "This product is no longer available.",
                });
                continue;
            }

            const rawStock = typeof p.stock === "number" ? Math.max(0, p.stock) : 0;
            const threshold = typeof p.lowStockThreshold === "number" ? p.lowStockThreshold : 5;
            const status = getStockStatus(rawStock, threshold);
            const maxPurchasable = getMaxPurchasable(rawStock);

            if (rawStock <= 0) {
                allValid = false;
                results.push({
                    productId: rawId,
                    name: p.name,
                    price: p.price,
                    valid: false,
                    inStock: false,
                    stockStatus: "out_of_stock",
                    maxPurchasable: 0,
                    requestedQuantity: requestedQty,
                    allowedQuantity: 0,
                    outOfStock: true,
                    message: "This item is currently out of stock.",
                });
            } else if (requestedQty > rawStock) {
                allValid = false;
                results.push({
                    productId: rawId,
                    name: p.name,
                    price: p.price,
                    valid: false,
                    inStock: true,
                    stockStatus: status,
                    maxPurchasable,
                    requestedQuantity: requestedQty,
                    allowedQuantity: maxPurchasable,
                    adjusted: true,
                    message: "You've reached the available quantity for this item.",
                });
            } else {
                results.push({
                    productId: rawId,
                    name: p.name,
                    price: p.price,
                    valid: true,
                    inStock: true,
                    stockStatus: status,
                    maxPurchasable,
                    requestedQuantity: requestedQty,
                    allowedQuantity: requestedQty,
                });
            }
        }

        return successResponse({
            allValid,
            results,
        });
    } catch (err) {
        console.error("[POST /api/cart/validate]", err);
        return serverErrorResponse();
    }
}
