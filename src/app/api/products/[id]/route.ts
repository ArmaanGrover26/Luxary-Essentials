import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Product from "@/models/Product";
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { updateProductSchema } from "@/utils/validators";
import { isRequestAdmin, sanitizeProductForPublic } from "@/lib/inventoryUtils";

type Params = { params: Promise<{ id: string }> };

// GET /api/products/[id] — Public
export async function GET(req: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;

        if (!id || typeof id !== "string") {
            return notFoundResponse("Product not found");
        }

        const trimmedId = id.trim();
        let product = null;

        // 1. Try finding by ObjectId
        if (mongoose.Types.ObjectId.isValid(trimmedId)) {
            product = await Product.findById(trimmedId);
        }

        // 2. Fallback: Try finding by unique name or slug (hyphens replaced with spaces)
        if (!product) {
            const decoded = decodeURIComponent(trimmedId);
            const asName = decoded.replace(/-/g, " ");
            product = await Product.findOne({
                $or: [
                    { name: { $regex: new RegExp(`^${escapeRegex(decoded)}$`, "i") } },
                    { name: { $regex: new RegExp(`^${escapeRegex(asName)}$`, "i") } },
                ],
            });
        }

        if (!product) return notFoundResponse("Product not found");

        const isAdmin = await isRequestAdmin(req);
        return successResponse(sanitizeProductForPublic(product, isAdmin));
    } catch (err) {
        console.error("[GET /api/products/[id]]", err);
        return serverErrorResponse();
    }
}

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// PUT /api/products/[id] — Admin only
export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await requireAdmin(req);
        await connectDB();

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id.trim())) {
            return notFoundResponse("Product not found");
        }

        const body = await req.json();
        const parsed = updateProductSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const product = await Product.findByIdAndUpdate(
            id.trim(),
            { $set: parsed.data },
            { new: true, runValidators: true }
        );
        if (!product) return notFoundResponse("Product not found");

        return successResponse(product);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[PUT /api/products/[id]]", err);
        return serverErrorResponse();
    }
}

// DELETE /api/products/[id] — Admin only
export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        await requireAdmin(req);
        await connectDB();

        const { id } = await params;
        if (!id || !mongoose.Types.ObjectId.isValid(id.trim())) {
            return notFoundResponse("Product not found");
        }

        const product = await Product.findByIdAndDelete(id.trim());
        if (!product) return notFoundResponse("Product not found");

        return successResponse({ message: "Product deleted successfully" });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[DELETE /api/products/[id]]", err);
        return serverErrorResponse();
    }
}
