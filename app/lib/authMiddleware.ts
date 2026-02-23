import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME, JWTPayload } from './jwt';

/**
 * Extract and verify the JWT session from the request cookie.
 * Returns the decoded payload or null if invalid/missing.
 */
export function getSession(request: NextRequest): JWTPayload | null {
    const cookie = request.cookies.get(COOKIE_NAME);
    if (!cookie?.value) return null;
    return verifyToken(cookie.value);
}

/**
 * Guard helper — returns a 401 response if session is invalid.
 * Use at the top of protected API route handlers:
 *
 *   const session = getSession(request);
 *   if (!session) return unauthorized();
 */
export function unauthorized() {
    return NextResponse.json(
        { success: false, message: 'Unauthorized — please log in' },
        { status: 401 }
    );
}
