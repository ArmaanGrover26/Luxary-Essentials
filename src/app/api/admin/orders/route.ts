import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import {
    successResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";

// GET /api/admin/orders — All orders with user details
export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
        const status = searchParams.get("status");
        const paymentStatus = searchParams.get("paymentStatus");
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};
        if (status) query.orderStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate("userId", "name email")
                .populate("items.productId", "name images")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(query),
        ]);

        return successResponse({
            orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return unauthorizedResponse(err.message);
            }
        }
        console.error("[GET /api/admin/orders]", err);
        return serverErrorResponse();
    }
}
