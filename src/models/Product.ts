import { Schema, model, models, Document } from "mongoose";

export type ProductCategory = string;

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    mrp?: number;
    category: ProductCategory;
    images: string[];
    stock: number;
    lowStockThreshold?: number;
    rating: number;
    numReviews: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: 2,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: 10,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        mrp: {
            type: Number,
            min: [0, "MRP cannot be negative"],
            default: null,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            lowercase: true,
        },
        images: {
            type: [String],
            required: [true, "At least one image is required"],
            validate: {
                validator: (v: string[]) => v.length >= 1,
                message: "Product must have at least one image",
            },
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: [0, "Stock cannot be negative"],
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
            min: [1, "Low stock threshold must be at least 1"],
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// Text search index for product search
ProductSchema.index({ name: "text", description: "text" });
// Compound index for category + price filtering
ProductSchema.index({ category: 1, price: 1 });

const Product = models.Product || model<IProduct>("Product", ProductSchema);
export default Product;
