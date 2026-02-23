import { NextRequest, NextResponse } from 'next/server';

/**
 * Authentication proxy.
 *
 * The original SAIL Solver backend (sailv2.vercel.app) exposes a server-side
 * /authenticate route that calls an internal Edwisely endpoint to verify
 * credentials. That internal endpoint is not publicly documented and cannot
 * be discovered from the client-side bundle — so we proxy through the
 * original deployment which is still live.
 *
 * Request:  POST /api/authenticate  { user, password, useOtp }
 * Response: { success, token }
 */

const UPSTREAM_URL = 'https://sailv2.vercel.app/authenticate';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, password, useOtp } = body;

    if (!user || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing credentials' },
        { status: 400 }
      );
    }

    // Forward to the original SAIL backend (same payload shape)
    const upstream = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password, useOtp }),
    });

    const data = await upstream.json();

    console.log(`[auth] upstream ${upstream.status}`, JSON.stringify(data).slice(0, 300));

    // Pass the response straight through
    return NextResponse.json(data, { status: upstream.status });
  } catch (error: any) {
    console.error('[auth] Unexpected error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred during authentication.' },
      { status: 500 }
    );
  }
}
