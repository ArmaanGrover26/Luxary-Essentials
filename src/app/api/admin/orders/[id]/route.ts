import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import Product from "@/models/Product";
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

        const existingOrder = await Order.findById(id);
        if (!existingOrder) return notFoundResponse("Order not found");

        const oldStatus = existingOrder.orderStatus;
        const newStatus = parsed.data.orderStatus;
        const newPaymentStatus = parsed.data.paymentStatus;

        // Restore or re-deduct inventory on status changes following order lifecycle
        if (newStatus && oldStatus !== newStatus) {
            if (newStatus === "cancelled" && oldStatus !== "cancelled") {
                // Restock items atomically
                for (const item of existingOrder.items) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: item.quantity },
                    });
                }
            } else if (oldStatus === "cancelled" && newStatus !== "cancelled") {
                // Re-deduct items atomically
                for (const item of existingOrder.items) {
                    await Product.findByIdAndUpdate(item.productId, {
                        $inc: { stock: -item.quantity },
                    });
                }
            }
            existingOrder.orderStatus = newStatus;
        }

        if (newPaymentStatus) {
            existingOrder.paymentStatus = newPaymentStatus;
        }

        await existingOrder.save();
        await existingOrder.populate("userId", "name email");

        return successResponse(existingOrder);
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
