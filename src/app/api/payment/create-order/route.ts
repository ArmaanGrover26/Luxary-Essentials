import { NextRequest } from "next/server";
import Razorpay from "razorpay";
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
import { createPaymentOrderSchema } from "@/utils/validators";

function getRazorpayClient() {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        key_secret: process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder",
    });
}

// POST /api/payment/create-order
// SEC-007: Validates amount directly against database order total to prevent financial tampering
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        await connectDB();

        const body = await req.json();
        const parsed = createPaymentOrderSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const { orderId, amount: clientAmount } = parsed.data;

        // Fetch the order from the database to guarantee authentic total
        const order = await Order.findById(orderId);
        if (!order) {
            return notFoundResponse("Order not found");
        }

        // Verify order ownership
        if (order.userId.toString() !== user.userId && user.role !== "admin") {
            return unauthorizedResponse("Order does not belong to you");
        }

        // Verify order is payable
        if (order.paymentStatus === "paid") {
            return errorResponse("This order has already been paid", 400);
        }

        if (order.orderStatus === "cancelled") {
            return errorResponse("Cannot process payment for a cancelled order", 400);
        }

        // If client supplied an amount, verify it matches database total (reject tampered amounts)
        if (typeof clientAmount === "number" && Math.abs(clientAmount - order.totalAmount) > 0.01) {
            return errorResponse("Provided amount does not match order total", 400);
        }

        // Use DB order total — never trust client value
        const orderTotalInPaise = Math.round(order.totalAmount * 100);

        if (orderTotalInPaise <= 0) {
            return errorResponse("Order total must be greater than zero", 400);
        }

        // Razorpay expects amount in paise (₹1 = 100 paise)
        const razorpayOrder = await getRazorpayClient().orders.create({
            amount: orderTotalInPaise,
            currency: "INR",
            receipt: `rcpt_${order._id.toString().slice(-8)}_${Date.now().toString().slice(-4)}`,
        });

        // Track razorpayOrderId on the order
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return successResponse({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            dbOrderId: order._id,
        });
    } catch (err: unknown) {
        if (
            err instanceof Error &&
            (err.message.includes("token") ||
                err.message.includes("Authentication"))
        ) {
            return unauthorizedResponse(err.message);
        }
        console.error("[POST /api/payment/create-order]", err);
        return serverErrorResponse("Failed to create payment order");
    }
}
