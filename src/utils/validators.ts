import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────
export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100),
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

// ── Product ──────────────────────────────────────────────────────────
export const productSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().min(10).max(2000),
    price: z.number().positive("Price must be positive"),
    category: z.enum(["resin", "candles", "raw-materials", "gifts"]),
    images: z.array(z.string().url()).min(1, "At least one image required"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
});

export const updateProductSchema = productSchema.partial();

// ── Order ────────────────────────────────────────────────────────────
export const orderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
});

export const shippingAddressSchema = z.object({
    name: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    address: z.string().min(5),
    city: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
});

export const orderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
    shippingAddress: shippingAddressSchema,
});

// ── Admin ────────────────────────────────────────────────────────────
export const updateOrderStatusSchema = z.object({
    orderStatus: z.enum([
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ]),
});

// ── Payment ──────────────────────────────────────────────────────────
export const createPaymentOrderSchema = z.object({
    amount: z.number().positive("Amount must be positive"),
});

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    orderId: z.string(), // Our DB order ID
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
