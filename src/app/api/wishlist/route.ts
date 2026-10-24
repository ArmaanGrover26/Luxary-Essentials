import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { sanitizeProductForPublic } from "@/lib/inventoryUtils";

// GET /api/wishlist — Retrieve all favorite products for authenticated user or guest IDs
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        let authUser: { userId: string; email: string; role: string } | null = null;
        try {
            authUser = await getAuthUser(req);
        } catch {
            authUser = null;
        }

        const { searchParams } = new URL(req.url);
        const guestIdsParam = searchParams.get("ids");

        // 1. Guest user mode — specific product IDs explicitly requested
        if (guestIdsParam) {
            const rawIds = guestIdsParam.split(",").map((s) => s.trim());
            const validObjectIds = rawIds
                .filter((id) => mongoose.Types.ObjectId.isValid(id))
                .map((id) => new mongoose.Types.ObjectId(id));

            if (validObjectIds.length === 0) {
                return successResponse({ items: [], productIds: [], count: 0 });
            }

            const products = await Product.find({ _id: { $in: validObjectIds } }).lean();
            const validItems = products.map((prod) => ({
                _id: String(prod._id),
                product: sanitizeProductForPublic(prod, false),
                addedAt: new Date(),
            }));

            return successResponse({
                items: validItems,
                productIds: validItems.map((item) => String(item.product._id)),
                count: validItems.length,
            });
        }

        // 2. Authenticated user mode
        if (authUser) {
            const entries = await Wishlist.find({
                userId: new mongoose.Types.ObjectId(authUser.userId),
            })
                .sort({ createdAt: -1 })
                .populate({
                    path: "product",
                    model: Product,
                })
                .lean();

            // Filter out any entries where the product has been deleted or is invalid
            const validItems: any[] = [];
            const staleEntryIds: mongoose.Types.ObjectId[] = [];

            for (const entry of entries) {
                if (entry.product && typeof entry.product === "object" && (entry.product as any)._id) {
                    const sanitized = sanitizeProductForPublic(entry.product, false);
                    validItems.push({
                        _id: String(entry._id),
                        product: sanitized,
                        addedAt: entry.createdAt,
                    });
                } else {
                    staleEntryIds.push(entry._id as mongoose.Types.ObjectId);
                }
            }

            // Clean up stale entries asynchronously if any products were deleted
            if (staleEntryIds.length > 0) {
                Wishlist.deleteMany({ _id: { $in: staleEntryIds } }).catch((e) =>
                    console.error("Failed to clean up stale wishlist items", e)
                );
            }

            return successResponse({
                items: validItems,
                productIds: validItems.map((item) => String(item.product._id)),
                count: validItems.length,
            });
        }

        return unauthorizedResponse("Authentication required to view your saved wishlist.");
    } catch (err: unknown) {
        console.error("[GET /api/wishlist]", err);
        return serverErrorResponse();
    }
}

// POST /api/wishlist — Add a product to favorites
export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        await connectDB();

        const body = await req.json();
        const { productId } = body || {};

        if (!productId || typeof productId !== "string" || !mongoose.Types.ObjectId.isValid(productId.trim())) {
            return errorResponse("Valid product ID is required", 400);
        }

        const trimmedId = productId.trim();
        const productExists = await Product.findById(trimmedId).select("_id").lean();
        if (!productExists) {
            return errorResponse("Product not found", 404);
        }

        const userObjId = new mongoose.Types.ObjectId(authUser.userId);
        const prodObjId = new mongoose.Types.ObjectId(trimmedId);

        // Upsert ensures duplicate entries are strictly prevented
        const entry = await Wishlist.findOneAndUpdate(
            { userId: userObjId, product: prodObjId },
            { $setOnInsert: { userId: userObjId, product: prodObjId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return successResponse({
            message: "Added to favorites",
            productId: trimmedId,
            id: String(entry._id),
        });
    } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes("token") || err.message.includes("Authentication"))) {
            return unauthorizedResponse(err.message);
        }
        console.error("[POST /api/wishlist]", err);
        return serverErrorResponse();
    }
}

// DELETE /api/wishlist — Remove a product from favorites
export async function DELETE(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        await connectDB();

        let productId: string | null = null;

        // Try reading from search params (?productId=...) or JSON body
        const { searchParams } = new URL(req.url);
        productId = searchParams.get("productId");

        if (!productId) {
            try {
                const body = await req.json();
                productId = body?.productId || null;
            } catch {
                // body might be empty if sent as pure query param
            }
        }

        if (!productId || typeof productId !== "string" || !mongoose.Types.ObjectId.isValid(productId.trim())) {
            return errorResponse("Valid product ID is required", 400);
        }

        const userObjId = new mongoose.Types.ObjectId(authUser.userId);
        const prodObjId = new mongoose.Types.ObjectId(productId.trim());

        const result = await Wishlist.findOneAndDelete({
            userId: userObjId,
            product: prodObjId,
        });

        return successResponse({
            message: result ? "Removed from favorites" : "Product was not in favorites",
            productId: productId.trim(),
            removed: !!result,
        });
    } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes("token") || err.message.includes("Authentication"))) {
            return unauthorizedResponse(err.message);
        }
        console.error("[DELETE /api/wishlist]", err);
        return serverErrorResponse();
    }
}
