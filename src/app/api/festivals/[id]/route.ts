import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import FestivalCategory from "@/models/FestivalCategory";
import "@/models/Product";
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { updateFestivalCategorySchema } from "@/utils/validators";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

// GET /api/festivals/[id] — Admin only, retrieve single festival
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(req);
        await connectDB();
        const { id } = await context.params;

        const festival = await FestivalCategory.findById(id)
            .populate({
                path: "products",
                select: "name price mrp category images stock",
            })
            .lean();

        if (!festival) {
            return notFoundResponse("Festival category not found");
        }

        return successResponse(festival);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[GET /api/festivals/[id]]", err);
        return serverErrorResponse();
    }
}

// PUT /api/festivals/[id] — Admin only, update festival category
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(req);
        await connectDB();
        const { id } = await context.params;

        const body = await req.json();
        const parsed = updateFestivalCategorySchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(parsed.error.issues.map((e) => e.message).join(", "));
        }

        const existing = await FestivalCategory.findById(id);
        if (!existing) {
            return notFoundResponse("Festival category not found");
        }

        const updates: Record<string, unknown> = { ...parsed.data };

        // If name is updated, re-generate slug and check duplicates
        if (parsed.data.name && parsed.data.name.trim() !== existing.name) {
            const newSlug = generateSlug(parsed.data.name);
            const duplicate = await FestivalCategory.findOne({
                _id: { $ne: id },
                $or: [
                    { name: { $regex: new RegExp(`^${parsed.data.name.trim()}$`, "i") } },
                    { slug: newSlug },
                ],
            });

            if (duplicate) {
                return errorResponse(`A festival category with the name "${parsed.data.name}" already exists.`);
            }
            updates.slug = newSlug;
        }

        // If activating, deactivate all other festival categories
        if (updates.isActive === true) {
            await FestivalCategory.updateMany({ _id: { $ne: id } }, { isActive: false });
        }

        const updated = await FestivalCategory.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        })
            .populate({
                path: "products",
                select: "name price mrp category images stock",
            })
            .lean();

        return successResponse(updated);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[PUT /api/festivals/[id]]", err);
        return serverErrorResponse();
    }
}

// DELETE /api/festivals/[id] — Admin only, remove festival category (preserves assigned products completely)
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(req);
        await connectDB();
        const { id } = await context.params;

        const deleted = await FestivalCategory.findByIdAndDelete(id);
        if (!deleted) {
            return notFoundResponse("Festival category not found");
        }

        return successResponse({
            message: `Festival category "${deleted.name}" removed successfully. All assigned products and their permanent categories are preserved.`,
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
        console.error("[DELETE /api/festivals/[id]]", err);
        return serverErrorResponse();
    }
}
