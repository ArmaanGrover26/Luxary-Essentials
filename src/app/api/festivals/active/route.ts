import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FestivalCategory from "@/models/FestivalCategory";
// Register Product model for population
import "@/models/Product";
import { successResponse, serverErrorResponse } from "@/utils/apiResponse";

// GET /api/festivals/active — Public endpoint returning the active festival category (if any)
export async function GET() {
    try {
        await connectDB();
        const activeFestival = await FestivalCategory.findOne({ isActive: true })
            .populate({
                path: "products",
                select: "name description price mrp category images stock rating numReviews createdAt",
            })
            .lean();

        return successResponse(activeFestival || null);
    } catch (err) {
        console.error("[GET /api/festivals/active]", err);
        return serverErrorResponse();
    }
}
