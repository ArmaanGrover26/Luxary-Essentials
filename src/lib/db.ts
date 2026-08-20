import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

// Extend global to cache the mongoose connection between hot-reloads in dev
declare global {
    // eslint-disable-next-line no-var
    var mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
    };
}

const cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
    const mongoUri = process.env.MONGODB_URI ?? MONGODB_URI;
    if (!mongoUri) {
        throw new Error("Please define the MONGODB_URI environment variable in .env.local");
    }

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(mongoUri, opts).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
