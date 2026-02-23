import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/app/lib/jwt';

export async function POST() {
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0, // Expire immediately
    });
    return response;
}
