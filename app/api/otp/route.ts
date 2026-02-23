import { NextRequest, NextResponse } from 'next/server';

const OTP_URL = 'https://dbchangesstudent.edwisely.com/auth/getLoginOtp';
const COMMON_HEADERS: Record<string, string> = {
  'Accept': 'application/json, text/plain, */*',
  'Referer': 'https://sailstudent.sairamit.edu.in/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roll_number } = body;

    if (!roll_number) {
      return NextResponse.json(
        { success: false, message: 'Missing roll number' },
        { status: 400 }
      );
    }

    const fd = new FormData();
    fd.append('roll_number', roll_number);

    const res = await fetch(OTP_URL, {
      method: 'POST',
      headers: COMMON_HEADERS,
      body: fd,
    });

    const data = await res.json();
    console.log(`[otp] ${res.status}`, JSON.stringify(data).slice(0, 300));

    if (data.status === 200 || data.otp_send_to) {
      return NextResponse.json({
        success: true,
        otp_send_to: data.otp_send_to || 'registered contact',
      });
    }

    return NextResponse.json(
      { success: false, message: data?.message || 'Failed to send OTP' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[otp] Unexpected error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while requesting your OTP.' },
      { status: 500 }
    );
  }
}
