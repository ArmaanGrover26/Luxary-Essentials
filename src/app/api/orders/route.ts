import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import Product from "@/models/Product";
import {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { orderSchema } from "@/utils/validators";

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

        // Validate stock and calculate total from DB prices (never trust client prices)
        let totalAmount = 0;
        const validatedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return errorResponse(`Product ${item.productId} not found`, 404);
            }
            if (product.stock < item.quantity) {
                return errorResponse(
                    `Insufficient stock for "${product.name}". Available: ${product.stock}`
                );
            }
            totalAmount += product.price * item.quantity;
            validatedItems.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price, // Use server-side price
            });
        }

        // Reduce stock atomically
        for (const item of validatedItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity },
            });
        }

        const order = await Order.create({
            userId: user.userId,
            items: validatedItems,
            totalAmount,
            shippingAddress,
            paymentStatus: "pending",
            orderStatus: "processing",
        });

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
