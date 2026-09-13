import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// This route generates a signed upload signature server-side.
// The API_SECRET never leaves the server, keeping uploads secure.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
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
  } catch (err) {
    console.error("[Cloudinary Sign] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
