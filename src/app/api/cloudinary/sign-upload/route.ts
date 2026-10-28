import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/authMiddleware";
import {
  unauthorizedResponse,
  errorResponse,
} from "@/utils/apiResponse";

// Configure Cloudinary with server-side credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  try {
    // Only authorized administrators can generate Cloudinary upload signatures
    await requireAdmin(req);

    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "luxury-essentials/products",
        // Transformation: auto quality + format on delivery
        transformation: "q_auto,f_auto",
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: "luxury-essentials/products",
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message.includes("token") || err.message.includes("Authentication")) {
        return unauthorizedResponse(err.message);
      }
      if (err.message.includes("Access denied")) {
        return errorResponse(err.message, 403);
      }
    }
    console.error("[Cloudinary Sign] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
