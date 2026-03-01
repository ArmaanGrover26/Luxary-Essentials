import { NextResponse } from "next/server";

export function successResponse(data: unknown, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse(message = "Authentication required") {
    return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Access denied") {
    return errorResponse(message, 403);
}

export function notFoundResponse(message = "Resource not found") {
    return errorResponse(message, 404);
}

export function serverErrorResponse(message = "Internal server error") {
    return errorResponse(message, 500);
}
