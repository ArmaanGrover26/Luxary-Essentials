import { NextRequest } from "next/server";
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

type Params = { params: Promise<{ id: string }> };

// GET /api/products/[id] — Public
export async function GET(_req: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;
        const product = await Product.findById(id);
        if (!product) return notFoundResponse("Product not found");
        return successResponse(product);
    } catch (err) {
        console.error("[GET /api/products/[id]]", err);
        return serverErrorResponse();
    }
}

// PUT /api/products/[id] — Admin only
export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await requireAdmin(req);
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const parsed = updateProductSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const product = await Product.findByIdAndUpdate(
            id,
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
        const product = await Product.findByIdAndDelete(id);
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
