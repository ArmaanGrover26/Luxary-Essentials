import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    notFoundResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { verifyPaymentSchema } from "@/utils/validators";

// POST /api/payment/verify
// Verifies Razorpay HMAC signature and marks order as paid
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        await connectDB();

        const body = await req.json();
        const parsed = verifyPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId,
        } = parsed.data;

        // Verify HMAC SHA256 signature — critical security step
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return errorResponse("Payment verification failed: invalid signature", 400);
        }

        // Find the order and confirm it belongs to this user
        const order = await Order.findById(orderId);
        if (!order) return notFoundResponse("Order not found");

        if (order.userId.toString() !== user.userId) {
            return unauthorizedResponse("Order does not belong to you");
        }

        // Update order with payment details
        order.paymentStatus = "paid";
        order.paymentId = razorpay_payment_id;
        order.razorpayOrderId = razorpay_order_id;
        await order.save();

        return successResponse({
            message: "Payment verified successfully",
            order: {
                id: order._id,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
            },
        });
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            (err.message.includes("token") ||
                err.message.includes("Authentication"))
        ) {
            return unauthorizedResponse(err.message);
        }
        console.error("[POST /api/payment/verify]", err);
        return serverErrorResponse("Payment verification failed");
    }
}
