import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAllowedRegistration } from '@/app/lib/registrationAllowlist';
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from '@/app/lib/jwt';
import { checkRateLimit } from '@/app/lib/rateLimit';

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
 * On success: signs a JWT, sets httpOnly session cookie, returns user data.
 */
export async function GET(request: NextRequest) {
  // ─── Rate limit: 5 req/min ───
  const rateLimited = checkRateLimit(request, 'user-details', 5, 60000);
  if (rateLimited) return rateLimited;

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

    // 1. Call Edwisely API first to get real user details
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

    // Log with limited detail (no sensitive data)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    console.log(`[user-details] IP=${ip} roll=${roll_number} status=${data?.status}`);

    // 2. If Edwisely returned valid user data, check allowlist
    if (data.status === 200 && data.data) {
      const user = data.data;

      // Check allowlist AFTER getting user info
      if (!isAllowedRegistration(roll_number)) {
        const studentName = user.name || 'Unknown Student';
        const department = user.department || user.branch || 'Unknown Department';
        return NextResponse.json(
          {
            success: false,
            message: 'Access denied',
            department: department,
            studentName: studentName,
            regNo: roll_number,
          },
          { status: 403 }
        );
      }

      // Allowed — sign JWT with all needed data (including edwisely token)
      const jwtToken = signToken({
        userId: user.user_id,
        rollNumber: roll_number,
        department: user.department || user.branch || '',
        sectionId: user.section_id,
        semesterId: user.semester_id,
        departmentId: user.department_id,
        collegeUniversityDegreeDepartmentId: user.college_university_degree_department_id,
        regulationBatchMappingId: user.regulation_batch_mapping_id,
        edwiselyToken: user.token, // Server-only — never sent to client
      });

      // Build response WITHOUT the edwisely token
      const safeUser = { ...user };
      delete safeUser.token;
      delete safeUser.refresh_token;

      const response = NextResponse.json({
        success: true,
        user: safeUser,
      });

      // Set httpOnly session cookie
      response.cookies.set(COOKIE_NAME, jwtToken, COOKIE_OPTIONS);
      return response;
    }

    // 3. Edwisely auth failed — check allowlist for better error
    if (!isAllowedRegistration(roll_number)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied',
          department: null,
          studentName: null,
          regNo: roll_number,
        },
        { status: 403 }
      );
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
