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

// ── Category validator ────────────────────────────────────────────────
export const categoryEnum = z
    .string()
    .min(1, "Category is required")
    .max(100, "Category cannot exceed 100 characters")
    .transform((val) => val.trim().toLowerCase());

// ── Product ──────────────────────────────────────────────────────────
export const baseProductSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().min(10).max(2000),
    price: z.number().nonnegative("Selling price must be non-negative"),
    mrp: z.number().nonnegative("MRP must be non-negative").optional().nullable(),
    category: categoryEnum,
    images: z.array(z.string().url()).min(1, "At least one image required"),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    lowStockThreshold: z.number().int().min(1, "Low stock threshold must be at least 1").default(5).optional(),
});

export const productSchema = baseProductSchema.refine(
    (data) => {
        if (data.mrp != null && data.price > data.mrp) {
            return false;
        }
        return true;
    },
    { message: "Selling price cannot exceed MRP", path: ["price"] }
);

export const updateProductSchema = baseProductSchema.partial().refine(
    (data) => {
        if (data.mrp != null && data.price != null && data.price > data.mrp) {
            return false;
        }
        return true;
    },
    { message: "Selling price cannot exceed MRP", path: ["price"] }
);

// ── Order ────────────────────────────────────────────────────────────
export const orderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
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
export const updateOrderStatusSchema = z
    .object({
        orderStatus: z
            .enum(["processing", "shipped", "delivered", "cancelled"])
            .optional(),
        paymentStatus: z
            .enum(["pending", "paid", "failed"])
            .optional(),
    })
    .refine((data) => data.orderStatus !== undefined || data.paymentStatus !== undefined, {
        message: "At least one of orderStatus or paymentStatus must be provided",
    });

// ── Payment ──────────────────────────────────────────────────────────
export const createPaymentOrderSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    amount: z.number().positive("Amount must be positive").optional(),
});

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    orderId: z.string(), // Our DB order ID
});

// ── Festival Category ────────────────────────────────────────────────
export const baseFestivalCategorySchema = z.object({
    name: z.string().min(2, "Festival name must be at least 2 characters").max(100),
    description: z.string().max(500),
    bannerText: z.string().max(200),
    badgeText: z.string().max(50),
    isActive: z.boolean(),
    products: z.array(z.string()),
});

export const festivalCategorySchema = z.object({
    name: z.string().min(2, "Festival name must be at least 2 characters").max(100),
    description: z.string().max(500).optional().default(""),
    bannerText: z.string().max(200).optional().default(""),
    badgeText: z.string().max(50).optional().default("Festival Special"),
    isActive: z.boolean().optional().default(false),
    products: z.array(z.string()).optional().default([]),
});

export const updateFestivalCategorySchema = baseFestivalCategorySchema.partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProductCategory = z.infer<typeof categoryEnum>;
export type FestivalCategoryInput = z.infer<typeof festivalCategorySchema>;
export type UpdateFestivalCategoryInput = z.infer<typeof updateFestivalCategorySchema>;

