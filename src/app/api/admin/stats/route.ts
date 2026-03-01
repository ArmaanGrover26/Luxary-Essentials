import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import {
    successResponse,
    unauthorizedResponse,
    serverErrorResponse,
} from "@/utils/apiResponse";

// GET /api/admin/stats — Dashboard stats for admin
export async function GET(req: NextRequest) {
    try {
        await requireAdmin(req);
        await connectDB();

        const [
            totalOrders,
            totalUsers,
            totalProducts,
            revenueResult,
            ordersByStatus,
            recentOrders,
        ] = await Promise.all([
            Order.countDocuments(),
            User.countDocuments({ role: "user" }),
            Product.countDocuments(),

            // Total revenue from paid orders
            Order.aggregate([
                { $match: { paymentStatus: "paid" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),

            // Count by order status
            Order.aggregate([
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
            ]),

            // Last 5 orders for quick view
            Order.find()
                .populate("userId", "name email")
                .sort({ createdAt: -1 })
                .limit(5)
                .select("totalAmount paymentStatus orderStatus createdAt userId"),
        ]);

        const totalRevenue = revenueResult[0]?.total ?? 0;

        const statusMap: Record<string, number> = {};
        for (const s of ordersByStatus) {
            statusMap[s._id] = s.count;
        }

        return successResponse({
            totalOrders,
            totalUsers,
            totalProducts,
            totalRevenue,
            ordersByStatus: {
                processing: statusMap.processing ?? 0,
                shipped: statusMap.shipped ?? 0,
                delivered: statusMap.delivered ?? 0,
                cancelled: statusMap.cancelled ?? 0,
            },
            recentOrders,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.includes("token") || err.message.includes("Authentication")) {
                return unauthorizedResponse(err.message);
            }
            if (err.message.includes("Access denied")) {
                return unauthorizedResponse(err.message);
            }
        }
        console.error("[GET /api/admin/stats]", err);
        return serverErrorResponse();
    }
}
