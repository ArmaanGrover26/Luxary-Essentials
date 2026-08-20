import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import User from "@/models/User";
import {
    successResponse,
    unauthorizedResponse,
    forbiddenResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";

// GET /api/admin/users — List registered users with pagination & search
export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page") ?? 1));
        const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
        const search = searchParams.get("search")?.trim() ?? "";
        const role = searchParams.get("role");
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: Record<string, any> = {};

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        return successResponse({
            users,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return forbiddenResponse(err.message);
            }
        }
        console.error("[GET /api/admin/users]", err);
        return serverErrorResponse();
    }
}
