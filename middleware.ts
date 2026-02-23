import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
    '/',
    '/access-denied',
    '/api/otp',
    '/api/user-details',
    '/api/authenticate',
    '/api/logout',
];

const PUBLIC_PREFIXES = [
    '/_next/',
    '/favicon',
    '/public/',
];

const COOKIE_NAME = 'ss_session';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    // Allow static/internal prefixes
    for (const prefix of PUBLIC_PREFIXES) {
        if (pathname.startsWith(prefix)) {
            return NextResponse.next();
        }
    }

    // Check session cookie
    const sessionCookie = request.cookies.get(COOKIE_NAME);

    if (!sessionCookie?.value) {
        // API routes → 401 JSON
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized — please log in' },
                { status: 401 }
            );
        }

        // Page routes → redirect to login
        const loginUrl = new URL('/', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Cookie exists — allow through (detailed JWT verification happens in API route handlers)
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths except static files and images
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
