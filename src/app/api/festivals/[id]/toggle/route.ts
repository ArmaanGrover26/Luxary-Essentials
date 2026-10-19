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

// PATCH /api/festivals/[id]/toggle — Admin only, quickly toggle active/inactive status
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin(req);
        await connectDB();
        const { id } = await context.params;

        const festival = await FestivalCategory.findById(id);
        if (!festival) {
            return notFoundResponse("Festival category not found");
        }

        const nextActive = !festival.isActive;

        // If activating, deactivate all other festival categories
        if (nextActive) {
            await FestivalCategory.updateMany({ _id: { $ne: id } }, { isActive: false });
        }

        festival.isActive = nextActive;
        await festival.save();

        const populated = await FestivalCategory.findById(id)
            .populate({
                path: "products",
                select: "name price mrp category images stock",
            })
            .lean();

        return successResponse(populated);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return errorResponse(err.message, 403);
            }
        }
        console.error("[PATCH /api/festivals/[id]/toggle]", err);
        return serverErrorResponse();
    }
}
