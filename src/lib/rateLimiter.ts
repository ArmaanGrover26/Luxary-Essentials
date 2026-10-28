import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";

type Options = {
  /** Max requests allowed within the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
};

// One shared cache per process — tracks request timestamps per key per route
const cache = new LRUCache<string, number[]>({
  max: 10_000,       // track at most 10 000 distinct keys
  ttl: 60 * 60_000,  // entries expire after 1 hour (covers the longest window)
});

/**
 * Resolves the client IP from the request headers.
 * Works behind Vercel, Nginx, and other proxies.
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Sliding-window rate limiter.
 *
 * Returns a 429 NextResponse if the identifier has exceeded the limit,
 * or null if the request should be allowed through.
 *
 * @param identifier - Any unique string: an IP, a userId, or a composite key.
 * @param routePrefix - Short label for the route (e.g. "login", "order").
 * @param options     - { limit, windowMs }
 *
 * Usage (IP-based):
 *   const limited = rateLimit(getClientIp(req), "login", { limit: 5, windowMs: 15 * 60_000 });
 *   if (limited) return limited;
 *
 * Usage (user-based):
 *   const limited = rateLimit(userId, "order", { limit: 5, windowMs: 10 * 60_000 });
 *   if (limited) return limited;
 */
export function rateLimit(
  identifier: string,
  routePrefix: string,
  { limit, windowMs }: Options
): NextResponse | null {
  const key = `${routePrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Sliding window: keep only timestamps within the current window
  const timestamps = (cache.get(key) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  cache.set(key, timestamps);

  if (timestamps.length > limit) {
    const retryAfterSec = Math.ceil(windowMs / 1000);
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil((windowStart + windowMs) / 1000)),
        },
      }
    );
  }

  return null; // allow the request
}
