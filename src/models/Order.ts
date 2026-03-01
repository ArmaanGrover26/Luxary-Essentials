import { Schema, model, models, Document, Types } from "mongoose";

export interface IOrderItem {
    productId: Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
}

export interface IOrder extends Document {
    userId: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    shippingAddress: IShippingAddress;
    paymentStatus: "pending" | "paid" | "failed";
    paymentId?: string;      // Razorpay payment ID
    razorpayOrderId?: string; // Razorpay order ID
    orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        },
    },
    { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        pincode: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (v: IOrderItem[]) => v.length >= 1,
                message: "Order must contain at least one item",
            },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Total cannot be negative"],
        },
        shippingAddress: {
            type: ShippingAddressSchema,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paymentId: {
            type: String,
            default: null,
        },
        razorpayOrderId: {
            type: String,
            default: null,
        },
        orderStatus: {
            type: String,
            enum: ["processing", "shipped", "delivered", "cancelled"],
            default: "processing",
        },
    },
    { timestamps: true }
);

// Index for admin queries: sort by date
OrderSchema.index({ createdAt: -1 });
// Index for payment verification
OrderSchema.index({ razorpayOrderId: 1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);
export default Order;
