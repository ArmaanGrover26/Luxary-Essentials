import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { createPaymentOrderSchema } from "@/utils/validators";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payment/create-order
// Creates a Razorpay order — called before checkout
export async function POST(req: NextRequest) {
    try {
        await getAuthUser(req);
        await connectDB();

        const body = await req.json();
        const parsed = createPaymentOrderSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const { amount } = parsed.data;

        // Razorpay expects amount in paise (₹1 = 100 paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return successResponse({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
