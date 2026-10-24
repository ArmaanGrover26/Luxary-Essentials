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

// POST /api/wishlist/merge — Merge guest favorites into authenticated user's wishlist
export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        await connectDB();

        const body = await req.json();
        const { productIds } = body || {};

        if (!Array.isArray(productIds)) {
            return errorResponse("productIds must be an array of strings", 400);
        }

        const validIds = productIds
            .filter((id): id is string => typeof id === "string" && mongoose.Types.ObjectId.isValid(id.trim()))
            .map((id) => id.trim());

        if (validIds.length === 0) {
            // Nothing to merge, return current user wishlist product IDs
            const existing = await Wishlist.find({
                userId: new mongoose.Types.ObjectId(authUser.userId),
            }).select("product").lean();
            return successResponse({
                mergedCount: 0,
                productIds: existing.map((e) => String(e.product)),
            });
        }

        // Verify products actually exist in database
        const existingProducts = await Product.find({
            _id: { $in: validIds.map((id) => new mongoose.Types.ObjectId(id)) },
        }).select("_id").lean();

        const verifiedIds = existingProducts.map((p) => String(p._id));
        const userObjId = new mongoose.Types.ObjectId(authUser.userId);

        // Perform bulk upserts to merge without creating duplicates
        const operations = verifiedIds.map((prodId) => ({
            updateOne: {
                filter: { userId: userObjId, product: new mongoose.Types.ObjectId(prodId) },
                update: { $setOnInsert: { userId: userObjId, product: new mongoose.Types.ObjectId(prodId) } },
                upsert: true,
            },
        }));

        if (operations.length > 0) {
            await Wishlist.bulkWrite(operations);
        }

        // Return updated list of product IDs
        const updatedEntries = await Wishlist.find({ userId: userObjId }).select("product").lean();

        return successResponse({
            mergedCount: verifiedIds.length,
            productIds: updatedEntries.map((e) => String(e.product)),
        });
    } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes("token") || err.message.includes("Authentication"))) {
            return unauthorizedResponse(err.message);
        }
        console.error("[POST /api/wishlist/merge]", err);
        return serverErrorResponse();
    }
}
