import { NextRequest } from "next/server";
import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Product from "@/models/Product";
import FestivalCategory from "@/models/FestivalCategory";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { productSchema } from "@/utils/validators";
import { isRequestAdmin, sanitizeProductForPublic } from "@/lib/inventoryUtils";

// Allowed sort fields — prevents SEC-006 unvalidated sort injection
const ALLOWED_SORT_FIELDS = ["createdAt", "price", "name", "rating", "numReviews", "_id"];

// GET /api/products — Public, with filtering/search/pagination
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        // Allow up to 100 for the shop page; admin uses 10
        const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 12)));
        const category = searchParams.get("category");
        const festivalId = searchParams.get("festivalId");
        const search = searchParams.get("search");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");

        // SEC-006 fix: allowlist sort fields
        const rawSort = searchParams.get("sort") ?? "createdAt";
        const sortField = ALLOWED_SORT_FIELDS.includes(rawSort) ? rawSort : "createdAt";
        const sortOrder: SortOrder = searchParams.get("order") === "asc" ? 1 : -1;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};

        if (festivalId) {
            const festival = await FestivalCategory.findById(festivalId);
            query._id = { $in: festival?.products ?? [] };
        } else if (category) {
            if (category === "festival-special" || category.startsWith("festival")) {
                const activeFestival = await FestivalCategory.findOne({ isActive: true });
                query._id = { $in: activeFestival?.products ?? [] };
            } else {
                // Check if category matches active festival slug
                const activeFestival = await FestivalCategory.findOne({ isActive: true, slug: category });
                if (activeFestival) {
                    query._id = { $in: activeFestival.products ?? [] };
                } else {
                    query.category = category;
                }
            }
        }

        if (search) query.$text = { $search: search };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            // Secondary sort by _id ensures stable ordering for equal timestamps
            Product.find(query).sort({ [sortField]: sortOrder, _id: sortOrder }).skip(skip).limit(limit),
            Product.countDocuments(query),
        ]);

        const isAdmin = await isRequestAdmin(req);
        const sanitizedProducts = products.map((prod) => sanitizeProductForPublic(prod, isAdmin));

        return successResponse({ products: sanitizedProducts, total, page, pages: Math.ceil(total / limit) });
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
