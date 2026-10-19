import { Schema, model, models, Document, Types } from "mongoose";

export interface IFestivalCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  bannerText?: string;
  badgeText?: string;
  isActive: boolean;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FestivalCategorySchema = new Schema<IFestivalCategory>(
  {
    name: {
      type: String,
      required: [true, "Festival category name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    bannerText: {
      type: String,
      trim: true,
      default: "",
    },
    badgeText: {
      type: String,
      trim: true,
      default: "Festival Special",
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default models.FestivalCategory ||
  model<IFestivalCategory>("FestivalCategory", FestivalCategorySchema);
