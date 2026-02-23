import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
    timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Cleanup every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    const cutoff = now - windowMs;
    for (const [key, entry] of store) {
        entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
        if (entry.timestamps.length === 0) store.delete(key);
    }
}

/**
 * Sliding-window rate limiter.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export function checkRateLimit(
    request: NextRequest,
    endpoint: string,
    maxRequests: number,
    windowMs: number = 60_000
): NextResponse | null {
    cleanup(windowMs);

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const cutoff = now - windowMs;

    let entry = store.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        store.set(key, entry);
    }

    // Remove expired timestamps
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

    if (entry.timestamps.length >= maxRequests) {
        const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000);
        console.warn(`[rate-limit] BLOCKED ${ip} on ${endpoint} (${entry.timestamps.length}/${maxRequests})`);
        return NextResponse.json(
            { success: false, message: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: { 'Retry-After': String(retryAfter) },
            }
        );
    }

    entry.timestamps.push(now);
    return null; // Allowed
}
