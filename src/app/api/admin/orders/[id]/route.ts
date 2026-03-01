import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import {
    successResponse,
    errorResponse,
    notFoundResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { updateOrderStatusSchema } from "@/utils/validators";

type Params = { params: Promise<{ id: string }> };

// PUT /api/admin/orders/[id] — Update order status
export async function PUT(req: NextRequest, { params }: Params) {
    try {
        await requireAdmin(req);
        await connectDB();

        const { id } = await params;
        const body = await req.json();
        const parsed = updateOrderStatusSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { $set: { orderStatus: parsed.data.orderStatus } },
            { new: true, runValidators: true }
        ).populate("userId", "name email");

        if (!order) return notFoundResponse("Order not found");

        return successResponse(order);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return unauthorizedResponse(err.message);
            }
        }
        console.error("[PUT /api/admin/orders/[id]]", err);
        return serverErrorResponse();
    }
}

// GET /api/admin/orders/[id] — Single order detail
export async function GET(req: NextRequest, { params }: Params) {
    try {
        await requireAdmin(req);
        await connectDB();
        const { id } = await params;

        const order = await Order.findById(id)
            .populate("userId", "name email createdAt")
            .populate("items.productId", "name images price category");

        if (!order) return notFoundResponse("Order not found");
        return successResponse(order);
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
        }
        console.error("[GET /api/admin/orders/[id]]", err);
        return serverErrorResponse();
    }
}
