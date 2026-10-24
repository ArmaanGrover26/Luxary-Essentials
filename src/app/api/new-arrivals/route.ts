import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import NewArrivals from "@/models/NewArrivals";
import Product from "@/models/Product";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/utils/apiResponse";

/**
 * GET /api/new-arrivals
 * Public endpoint — returns the config and populated products (if enabled).
 */
export async function GET() {
  try {
    await connectDB();

    let config = await NewArrivals.findOne().populate({
      path: "products",
      model: Product,
    });

    // Bootstrap: create default doc if none exists
    if (!config) {
      config = await NewArrivals.create({ isEnabled: false, products: [] });
    }

    return successResponse({
      isEnabled: config.isEnabled,
      products: config.products,
    });
  } catch (err) {
    console.error("[GET /api/new-arrivals]", err);
    return serverErrorResponse();
  }
}

/**
 * PUT /api/new-arrivals
 * Admin only — update isEnabled and/or product order/selection.
 * Body: { isEnabled?: boolean; productIds?: string[] }
 */
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    await connectDB();

    const body = await req.json();
    const { isEnabled, productIds } = body as {
      isEnabled?: boolean;
      productIds?: string[];
    };

    // Validate productIds when provided
    if (productIds !== undefined) {
      if (!Array.isArray(productIds)) {
        return errorResponse("productIds must be an array");
      }
      if (productIds.length > 20) {
        return errorResponse("Cannot feature more than 20 products at once");
      }

      // Verify all IDs refer to real products
      if (productIds.length > 0) {
        const existing = await Product.find({ _id: { $in: productIds } }).select("_id");
        if (existing.length !== productIds.length) {
          return errorResponse("One or more product IDs are invalid");
        }
      }
    }

    // Find-or-create the singleton doc
    let config = await NewArrivals.findOne();
    if (!config) {
      config = new NewArrivals({ isEnabled: true, products: [] });
    }

    if (isEnabled !== undefined) config.isEnabled = isEnabled;
    if (productIds !== undefined) config.products = productIds as unknown as typeof config.products;

    await config.save();

    // Return populated so admin UI refreshes immediately
    const populated = await NewArrivals.findById(config._id).populate({
      path: "products",
      model: Product,
    });

    return successResponse({
      isEnabled: populated!.isEnabled,
      products: populated!.products,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (
        err.message.includes("token") ||
        err.message.includes("Authentication")
      ) {
        return unauthorizedResponse(err.message);
      }
      if (err.message.includes("Access denied")) {
        return errorResponse(err.message, 403);
      }
    }
    console.error("[PUT /api/new-arrivals]", err);
    return serverErrorResponse();
  }
}
