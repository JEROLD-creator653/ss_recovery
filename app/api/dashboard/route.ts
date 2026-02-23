import { NextRequest, NextResponse } from 'next/server';
import { getSession, unauthorized } from '@/app/lib/authMiddleware';

const BASE_URL = 'https://dbchangesstudent.edwisely.com';
const AWS_DASHBOARD_URL =
  'https://mwxwy0mup5.execute-api.ap-south-1.amazonaws.com/prod/studentwebdashboard';

function getHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/json, text/plain, */*',
    Authorization: `Bearer ${token}`,
    Referer: 'https://sailstudent.sairamit.edu.in/',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };
}

/**
 * POST /api/dashboard
 * Body: { section_id, college_university_degree_department_id, semester_id, department_id, regulation_batch_mapping_id }
 *
 * Token is extracted from the JWT session cookie — NOT from request body.
 */
export async function POST(request: NextRequest) {
  // ─── Auth check ───
  const session = getSession(request);
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const {
      section_id,
      college_university_degree_department_id,
      semester_id,
      department_id,
      regulation_batch_mapping_id,
    } = body;

    // Use Edwisely token from JWT — never trust client-provided token
    const headers = getHeaders(session.edwiselyToken);

    // Fire all independent requests in parallel
    const promises: Promise<any>[] = [
      // 1. Profile
      fetch(`${BASE_URL}/user/v2/getProfile`, {
        method: 'POST',
        headers,
      }).then((r) => r.json().catch(() => null)),

      // 2. Student Points Dashboard
      fetch(`${BASE_URL}/studentPoints/getStudentPointsDashboardData`, {
        method: 'GET',
        headers,
      }).then((r) => r.json().catch(() => null)),

      // 3. Points by Feature
      fetch(`${BASE_URL}/studentPoints/getStudentPointsBasedOnFeature`, {
        method: 'GET',
        headers,
      }).then((r) => r.json().catch(() => null)),
    ];

    // 4. Lambda dashboard (needs multiple params)
    if (section_id && college_university_degree_department_id && semester_id && department_id && regulation_batch_mapping_id) {
      const qs = new URLSearchParams({
        college_university_degree_department_id: String(college_university_degree_department_id),
        semester_id: String(semester_id),
        section_id: String(section_id),
        department_id: String(department_id),
        delta_days: '20',
        upcoming_delta_days: '3',
        regulation_batch_mapping_id: String(regulation_batch_mapping_id),
      }).toString();
      promises.push(
        fetch(`${AWS_DASHBOARD_URL}?${qs}`, {
          method: 'GET',
          headers,
        }).then((r) => r.json().catch(() => null))
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    const [profile, points, features, dashboard] = await Promise.all(promises);

    return NextResponse.json({
      success: true,
      profile: profile?.data || profile,
      points: points?.data || points,
      features: features?.data || features,
      subjects: dashboard?.semesters?.subjects || [],
      activityWall: dashboard?.activity_wall || [],
      upcomingTests: dashboard?.upcoming_tests || [],
      resultsReleased: dashboard?.results_released || [],
      questionOfTheDay: dashboard?.question_of_the_day || null,
    });
  } catch (error: any) {
    console.error('[dashboard] error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
