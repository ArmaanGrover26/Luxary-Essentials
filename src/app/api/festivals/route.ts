import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import FestivalCategory from "@/models/FestivalCategory";
import "@/models/Product";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { festivalCategorySchema } from "@/utils/validators";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// GET /api/festivals — Admin only, returns all festival categories with product counts and summaries
export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);
        await connectDB();

        const festivals = await FestivalCategory.find()
            .sort({ isActive: -1, updatedAt: -1 })
            .populate({
                path: "products",
                select: "name price mrp category images stock",
            })
            .lean();

        return successResponse(festivals);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[GET /api/festivals]", err);
        return serverErrorResponse();
    }
}

// POST /api/festivals — Admin only, creates a new festival category
export async function POST(req: NextRequest) {
    try {
        await requireAdmin(req);
        await connectDB();

        const body = await req.json();
        const parsed = festivalCategorySchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
        }

        const { name, description, bannerText, badgeText, isActive, products } = parsed.data;
        const slug = generateSlug(name);

        // Check for duplicates
        const existing = await FestivalCategory.findOne({
            $or: [{ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } }, { slug }],
        });

        if (existing) {
            return errorResponse(`A festival category with the name "${name}" already exists.`);
        }

        // If newly created festival is marked active, deactivate any others
        if (isActive) {
            await FestivalCategory.updateMany({}, { isActive: false });
        }

        const festival = await FestivalCategory.create({
            name,
            slug,
            description,
            bannerText,
            badgeText,
            isActive: !!isActive,
            products: products || [],
        });

        const populated = await FestivalCategory.findById(festival._id)
            .populate({
                path: "products",
                select: "name price mrp category images stock",
            })
            .lean();

        return successResponse(populated, 201);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[POST /api/festivals]", err);
        return serverErrorResponse();
    }
}
