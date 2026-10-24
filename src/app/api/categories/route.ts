import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { ORDERED_CATEGORIES } from "@/config/categories";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/utils/apiResponse";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Seed initial categories if the collection is empty
 */
async function ensureDefaultCategories() {
  const count = await Category.countDocuments();
  if (count === 0) {
    const initialDocs = ORDERED_CATEGORIES.map((c, index) => ({
      name: c.label,
      slug: c.value,
      description: `${c.label} collection at Luxury Essentials`,
      order: index,
      isActive: true,
    }));
    await Category.insertMany(initialDocs);
  }
}

// GET /api/categories — Returns active categories (public) or all categories with product counts (admin)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    await ensureDefaultCategories();

    const { searchParams } = new URL(req.url);
    const getAll = searchParams.get("all") === "true";

    if (getAll) {
      // Require admin access for managing all categories
      try {
        await requireAdmin(req);
      } catch (authErr: unknown) {
        if (authErr instanceof Error) {
          if (authErr.message.includes("token") || authErr.message.includes("Authentication")) {
            return unauthorizedResponse(authErr.message);
          }
          if (authErr.message.includes("Access denied")) {
            return errorResponse(authErr.message, 403);
          }
        }
        return unauthorizedResponse();
      }

      const categories = await Category.find()
        .sort({ order: 1, createdAt: 1 })
        .lean();

      // Get live product counts for each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
          const productCount = await Product.countDocuments({ category: cat.slug });
          return {
            ...cat,
            productCount,
          };
        })
      );

      return successResponse(categoriesWithCount);
    }

    // Public request: active categories only
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select("name slug description image order isActive")
      .lean();

    return successResponse(categories);
  } catch (err: unknown) {
    console.error("[GET /api/categories]", err);
    return serverErrorResponse();
  }
}

// POST /api/categories — Admin creates a new category
export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();

    const body = await req.json();
    const { name, slug, description, image, order, isActive } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return errorResponse("Category name is required", 400);
    }

    const trimmedName = name.trim();
    const finalSlug = (slug && typeof slug === "string" && slug.trim().length > 0)
      ? generateSlug(slug)
      : generateSlug(trimmedName);

    if (!finalSlug) {
      return errorResponse("A valid slug could not be generated from category name", 400);
    }

    // Check slug uniqueness
    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) {
      return errorResponse(`A category with slug "${finalSlug}" already exists`, 409);
    }

    // Determine order
    let targetOrder = typeof order === "number" ? order : 0;
    if (typeof order !== "number") {
      const highest = await Category.findOne().sort({ order: -1 }).select("order");
      targetOrder = highest && typeof highest.order === "number" ? highest.order + 1 : 0;
    }

    const category = await Category.create({
      name: trimmedName,
      slug: finalSlug,
      description: description && typeof description === "string" ? description.trim() : "",
      image: image && typeof image === "string" ? image.trim() : "",
      order: targetOrder,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return successResponse(category, 201);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("token") || err.message.includes("Authentication")) {
        return unauthorizedResponse(err.message);
      }
      if (err.message.includes("Access denied")) {
        return errorResponse(err.message, 403);
      }
    }
    console.error("[POST /api/categories]", err);
    return serverErrorResponse();
  }
}
