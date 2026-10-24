import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { orderSchema } from "@/utils/validators";
import { sendOrderEmails } from "@/lib/emailService";

// POST /api/orders — Authenticated users can place orders
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        await connectDB();

        const body = await req.json();
        const parsed = orderSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const { items, shippingAddress } = parsed.data;

        // Validate products and DB prices
        let totalAmount = 0;
        const validatedItems: Array<{ productId: any; quantity: number; price: number; name: string }> = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return errorResponse(`Product is no longer available`, 404);
            }
            if (product.stock < item.quantity) {
                return errorResponse(
                    `"${product.name}" does not have sufficient quantity available. Please update your cart.`,
                    409
                );
            }
            totalAmount += product.price * item.quantity;
            validatedItems.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price, // Always use server-side DB price
                name: product.name,   // Keep for email
            });
        }

        // Atomically deduct stock with conditional check ($gte: quantity) to prevent concurrent overselling
        const successfullyDeducted: Array<{ productId: any; quantity: number }> = [];
        for (const item of validatedItems) {
            const updated = await Product.findOneAndUpdate(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { new: true }
            );

            if (!updated) {
                // Stock was claimed by a concurrent order! Roll back prior items
                for (const rollback of successfullyDeducted) {
                    await Product.findByIdAndUpdate(rollback.productId, {
                        $inc: { stock: rollback.quantity },
                    });
                }
                return errorResponse(
                    `"${item.name}" is no longer available in the requested quantity. Please update your cart before proceeding.`,
                    409
                );
            }
            successfullyDeducted.push({ productId: item.productId, quantity: item.quantity });
        }

        // Determine payment method from body (client sends paymentMethod: "cod" | "online")
        const paymentMethod: "cod" | "online" = body.paymentMethod === "online" ? "online" : "cod";

        const order = await Order.create({
            userId: user.userId,
            items: validatedItems.map(({ productId, quantity, price }) => ({ productId, quantity, price })),
            totalAmount,
            shippingAddress,
            paymentStatus: "pending",
            orderStatus: "processing",
        });

        // Fetch user details for email (name + email from DB)
        const dbUser = await User.findById(user.userId).select("name email");

        // Send emails (awaiting ensures serverless platforms like Vercel don't kill the function before emails finish)
        if (dbUser) {
            try {
                await sendOrderEmails({
                    orderId: String(order._id),
                    customerName: dbUser.name,
                    customerEmail: dbUser.email,
                    items: validatedItems.map(({ name, quantity, price }) => ({ name, quantity, price })),
                    totalAmount,
                    shippingAddress,
                    paymentMethod,
                });
            } catch (err) {
                console.error("[Email] Failed to send order emails:", err);
            }
        }

        return successResponse(order, 201);
    } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes("token") || err.message.includes("Authentication"))) {
            return unauthorizedResponse(err.message);
        }
        console.error("[POST /api/orders]", err);
        return serverErrorResponse();
    }
}

// GET /api/orders — Returns the authenticated user's orders
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") ?? 10)));
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ userId: user.userId })
                .populate("items.productId", "name images price")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ userId: user.userId }),
        ]);

        return successResponse({
            orders,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (err: unknown) {
        if (err instanceof Error && (err.message.includes("token") || err.message.includes("Authentication"))) {
            return unauthorizedResponse(err.message);
        }
        console.error("[GET /api/orders]", err);
        return serverErrorResponse();
    }
}
