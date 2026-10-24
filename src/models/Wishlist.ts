import { Schema, model, models, Document, Types } from "mongoose";

export interface IWishlist extends Document {
    userId: Types.ObjectId;
    product: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
            index: true,
        },
    },
    { timestamps: true }
);

// Compound unique index prevents duplicate favorite entries for the same user and product
WishlistSchema.index({ userId: 1, product: 1 }, { unique: true });

const Wishlist = models.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
