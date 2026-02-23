import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const BASE_URL = 'https://dbchangesstudent.edwisely.com';
const COMMON_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://sailstudent.sairamit.edu.in/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

// RSA public key used by the Edwisely frontend for encrypting OTP/password
const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvSsVM48DpxsgrCU47Pcl
Ra2wJE1zqyOHo5EeLWRWLaITPRIvZgwL5pEQRRvFIsZ3eB69BrRGUbIO3SfqrkBj
3klag7jAJO7PmeoltXbvwWYWczZKZ/t+4zb3luid6Nl7ZF4rltHs0VQ7hQh6u8ql
MvDLV0zxY3O4ywa9R8zbe3HIiyhf/fnqoEhffiElrvP5ZHnPQy4bH7agmVGA7TSz
smJtvZTCVwYa+3daUNlteAK3Ozi08pBXDul83LSYtcGx+zWt7yrY/9DbGs30T6aw
qwRSB6AbPK2pIpXBXUEM8+lTn6om7PnY23SqSvEj9K1h2q6TtgEZbVOGSIXqZf6m
ZwIDAQAB
-----END PUBLIC KEY-----`;

function rsaEncrypt(plaintext: string): string {
  const encrypted = crypto.publicEncrypt(
    {
      key: RSA_PUBLIC_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(plaintext, 'utf-8')
  );
  return encrypted.toString('base64');
}

/**
 * GET /api/user-details?roll_number=...&password=...
 * or
 * GET /api/user-details?roll_number=...&otp=...
 *
 * Encrypts the password/OTP with the Edwisely RSA public key and calls
 * auth/v5/getUserDetails to get the full user profile (with section_id,
 * semester_id, token, refresh_token, subjects, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roll_number = searchParams.get('roll_number');
    const password = searchParams.get('password');
    const otp = searchParams.get('otp');

    if (!roll_number || (!password && !otp)) {
      return NextResponse.json(
        { success: false, message: 'Missing roll_number and password/otp' },
        { status: 400 }
      );
    }

    const secret = (password || otp)!;
    const encrypted = rsaEncrypt(secret);
    const encoded = encodeURIComponent(encrypted);

    const paramName = password ? 'password' : 'otp';
    const url = `${BASE_URL}/auth/v5/getUserDetails?roll_number=${roll_number}&${paramName}=${encoded}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: COMMON_HEADERS,
    });

    const data = await res.json();
    console.log('[user-details]', res.status, data?.status, data?.message);

    if (data.status === 200 && data.data) {
      return NextResponse.json({
        success: true,
        user: data.data,
      });
    }

    return NextResponse.json(
      { success: false, message: data.message || 'Failed to get user details' },
      { status: res.status === 200 ? 400 : res.status }
    );
  } catch (error: any) {
    console.error('[user-details] error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
