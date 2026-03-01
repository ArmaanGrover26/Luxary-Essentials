import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import {
    successResponse,
    unauthorizedResponse,
    notFoundResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";

type Params = { params: Promise<{ id: string }> };

// GET /api/orders/[id] — user can view their own order
export async function GET(req: NextRequest, { params }: Params) {
    try {
        const user = await getAuthUser(req);
        await connectDB();
        const { id } = await params;

        const order = await Order.findById(id).populate(
            "items.productId",
            "name images price category"
        );

        if (!order) return notFoundResponse("Order not found");

        // Users can only view their own orders; admins can view all
        if (
            order.userId.toString() !== user.userId &&
            user.role !== "admin"
        ) {
            return unauthorizedResponse("You can only view your own orders");
        }

        return successResponse(order);
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            (err.message.includes("token") ||
                err.message.includes("Authentication"))
        ) {
            return unauthorizedResponse(err.message);
        }
        console.error("[GET /api/orders/[id]]", err);
        return serverErrorResponse();
    }
}
