import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://dbchangesstudent.edwisely.com';

function getHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/json, text/plain, */*',
    Authorization: `Bearer ${token}`,
    Referer: 'https://sailstudent.sairamit.edu.in/',
    'Content-Type': 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };
}

/**
 * POST /api/tests
 * Body: { token, from_date?, delta_days?, section_id? }
 *
 * Fetches the list of assessments/tests assigned to the student.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, from_date, delta_days, section_id } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Missing token' },
        { status: 400 }
      );
    }

    const headers = getHeaders(token);

    // Try multiple endpoints in parallel to maximize data
    const promises: Promise<{ key: string; data: any }>[] = [];

    // 1. college/v4/getAllList — test/assessment list
    const listBody: Record<string, any> = {};
    if (from_date) listBody.from_date = from_date;
    if (delta_days) listBody.delta_days = delta_days;
    if (section_id) listBody.section_id = section_id;

    promises.push(
      fetch(`${BASE_URL}/college/v4/getAllList`, {
        method: 'POST',
        headers,
        body: JSON.stringify(listBody),
      })
        .then(async (r) => {
          const d = await r.json().catch(() => null);
          return { key: 'allList', data: d };
        })
        .catch(() => ({ key: 'allList', data: null }))
    );

    // 2. AWS Lambda dashboard endpoint (for subjects & assessments)
    if (section_id) {
      promises.push(
        fetch(
          `https://mwxwy0mup5.execute-api.ap-south-1.amazonaws.com/prod/studentwebdashboard?section_id=${section_id}`,
          { method: 'GET', headers }
        )
          .then(async (r) => {
            const d = await r.json().catch(() => null);
            return { key: 'webDashboard', data: d };
          })
          .catch(() => ({ key: 'webDashboard', data: null }))
      );
    }

    const results = await Promise.all(promises);
    const out: Record<string, any> = { success: true };
    for (const r of results) {
      out[r.key] = r.data?.data || r.data;
    }

    return NextResponse.json(out);
  } catch (error: any) {
    console.error('[tests] error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}
