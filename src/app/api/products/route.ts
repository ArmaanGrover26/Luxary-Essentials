import { NextRequest } from "next/server";
import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Product from "@/models/Product";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { productSchema } from "@/utils/validators";

// GET /api/products — Public, with filtering/search/pagination
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 12)));
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const sortField = searchParams.get("sort") ?? "createdAt";
        const sortOrder: SortOrder = searchParams.get("order") === "asc" ? 1 : -1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};

        if (category) query.category = category;
        if (search) query.$text = { $search: search };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            Product.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
            Product.countDocuments(query),
        ]);

        return successResponse({ products, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        console.error("[GET /api/products]", err);
        return serverErrorResponse();
    }
}

// POST /api/products — Admin only
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);
        await connectDB();

        const body = await req.json();
        const parsed = productSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
        }

        const product = await Product.create(parsed.data);
        return successResponse(product, 201);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[POST /api/products]", err);
        return serverErrorResponse();
    }
}
