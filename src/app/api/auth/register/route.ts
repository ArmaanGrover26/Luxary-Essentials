import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import User from "@/models/User";
import {
    successResponse,
    errorResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";
import { registerSchema } from "@/utils/validators";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return errorResponse(
                parsed.error.issues.map((e) => e.message).join(", ")
            );
        }

        const { name, email, password } = parsed.data;

        // Check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return errorResponse("Email already registered", 409);
        }

        // Create user (password hashed by pre-save hook)
        const user = await User.create({ name, email, password });

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        return successResponse(
            {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            201
        );
    } catch (err) {
        console.error("[POST /api/auth/register]", err);
        return serverErrorResponse();
    }
}
