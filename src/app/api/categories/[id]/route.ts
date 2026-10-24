import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Category from "@/models/Category";
import Product from "@/models/Product";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/utils/apiResponse";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// PUT /api/categories/[id] — Admin updates a category
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const category = await Category.findById(id);
    if (!category) {
      return notFoundResponse("Category not found");
    }

    const { name, slug, description, image, order, isActive } = body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return errorResponse("Category name cannot be empty", 400);
      }
      category.name = name.trim();
    }

    // Slug update check
    if (slug !== undefined) {
      const newSlug = generateSlug(slug);
      if (!newSlug) {
        return errorResponse("Invalid slug provided", 400);
      }
      if (newSlug !== category.slug) {
        const existing = await Category.findOne({ slug: newSlug, _id: { $ne: id } });
        if (existing) {
          return errorResponse(`A category with slug "${newSlug}" already exists`, 409);
        }

        const oldSlug = category.slug;
        category.slug = newSlug;

        // Automatically update all products that reference the old slug
        await Product.updateMany({ category: oldSlug }, { category: newSlug });
      }
    }

    if (description !== undefined) {
      category.description = typeof description === "string" ? description.trim() : "";
    }

    if (image !== undefined) {
      category.image = typeof image === "string" ? image.trim() : "";
    }

    if (order !== undefined && typeof order === "number") {
      category.order = order;
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    return successResponse(category);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("token") || err.message.includes("Authentication")) {
        return unauthorizedResponse(err.message);
      }
      if (err.message.includes("Access denied")) {
        return errorResponse(err.message, 403);
      }
    }
    console.error("[PUT /api/categories/[id]]", err);
    return serverErrorResponse();
  }
}

// DELETE /api/categories/[id] — Admin deletes a category (safeguarded against deleting categories with products)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);
    await connectDB();

    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) {
      return notFoundResponse("Category not found");
    }

    // Check if any products are using this category
    const assignedProductsCount = await Product.countDocuments({ category: category.slug });
    if (assignedProductsCount > 0) {
      return errorResponse(
        `Cannot delete "${category.name}" because ${assignedProductsCount} product(s) are currently assigned to it. Please reassign or delete these products first, or mark this category as Inactive to hide it.`,
        400
      );
    }

    await Category.findByIdAndDelete(id);

    return successResponse({
      message: `Category "${category.name}" deleted successfully`,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("token") || err.message.includes("Authentication")) {
        return unauthorizedResponse(err.message);
      }
      if (err.message.includes("Access denied")) {
        return errorResponse(err.message, 403);
      }
    }
    console.error("[DELETE /api/categories/[id]]", err);
    return serverErrorResponse();
  }
}
