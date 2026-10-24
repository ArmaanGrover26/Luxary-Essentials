import { Schema, model, models, Document, Types } from "mongoose";

export interface INewArrivals extends Document {
  isEnabled: boolean;
  products: Types.ObjectId[];
  updatedAt: Date;
  createdAt: Date;
}

const NewArrivalsSchema = new Schema<INewArrivals>(
  {
    isEnabled: {
      type: Boolean,
      default: true,
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

// Singleton: only one document should ever exist
export default models.NewArrivals ||
  model<INewArrivals>("NewArrivals", NewArrivalsSchema);
