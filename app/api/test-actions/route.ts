import { NextRequest, NextResponse } from 'next/server';

const QUESTIONNAIRE_URL =
  'https://qsdsbm4079.execute-api.ap-south-1.amazonaws.com/prod/questionnaire';
const SUBMISSION_URL =
  'https://mk2dp5bcoi.execute-api.ap-south-1.amazonaws.com/prod/testsubmission';
const BASE_URL = 'https://dbchangesstudent.edwisely.com';

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
 * POST /api/test-actions
 * Body: { action, token, test_id, subject_id?, user_id?, roll_number?, question_answers? }
 *
 * action = "fetch"     -> GET questionnaire (questions + options)
 * action = "answers"   -> GET getTestQuestions (with is_answer flags, only for released results)
 * action = "submit"    -> POST testsubmission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, test_id } = body;

    if (!token || !test_id) {
      return NextResponse.json(
        { success: false, message: 'Missing token or test_id' },
        { status: 400 }
      );
    }

    const headers = getHeaders(token);

    // ─── Fetch questions (active test) ───
    if (action === 'fetch') {
      const res = await fetch(
        `${QUESTIONNAIRE_URL}?test_id=${test_id}&device_type=2&device_details=127.0.0.1`,
        { method: 'GET', headers }
      );
      const data = await res.json();
      if (data.status === 200 && data.questions) {
        return NextResponse.json({
          success: true,
          test_id: data.test_id,
          name: data.name,
          timelimit: data.timelimit,
          subject_id: data.subject_id,
          date_of_expiry: data.date_of_expiry,
          questions: data.questions,
          sections: data.sections,
          resume_test: data.resume_test,
        });
      }
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to fetch questions',
        status_code: data.status,
      });
    }

    // ─── Fetch answers (results released) ───
    if (action === 'answers') {
      const res = await fetch(
        `${BASE_URL}/questionnaire/v2/getTestQuestions?test_id=${test_id}`,
        { method: 'GET', headers }
      );
      const data = await res.json();
      if (data.status === 200) {
        return NextResponse.json({
          success: true,
          data: data.data,
        });
      }
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to fetch answers',
      });
    }

    // ─── Fetch correct answers from ALL possible endpoints ───
    if (action === 'fetch-correct') {
      // Try multiple endpoints in parallel to find one that has is_answer data
      const endpoints = [
        {
          key: 'getTestQuestions',
          url: `${BASE_URL}/questionnaire/v2/getTestQuestions?test_id=${test_id}`,
        },
        {
          key: 'getLiveTestResults',
          url: `${BASE_URL}/questionnaire/v2/getLiveTestResults?test_id=${test_id}`,
        },
        {
          key: 'testSubmittedAnswers',
          url: `${BASE_URL}/questionnaire/v2/testSubmittedAnswers?test_id=${test_id}`,
        },
        {
          key: 'getTest',
          url: `${BASE_URL}/questionnaire/v3/getTest?test_id=${test_id}`,
        },
      ];

      const results = await Promise.allSettled(
        endpoints.map(async (ep) => {
          const res = await fetch(ep.url, { method: 'GET', headers });
          const data = await res.json();
          return { key: ep.key, data };
        })
      );

      // Build an answer map: question_id -> array of correct option ids
      const answerMap: Record<number, number[]> = {};
      const questionsWithAnswers: any[] = [];
      let sourceEndpoint = '';

      for (const result of results) {
        if (result.status !== 'fulfilled') continue;
        const { key, data } = result.value;

        // Each endpoint returns data differently
        let questions: any[] = [];
        if (data.status === 200 || data.statusCode === 200) {
          if (Array.isArray(data.data)) {
            questions = data.data;
          } else if (data.data?.questions && Array.isArray(data.data.questions)) {
            questions = data.data.questions;
          } else if (data.questions && Array.isArray(data.questions)) {
            questions = data.questions;
          } else if (data.data?.test_questions && Array.isArray(data.data.test_questions)) {
            questions = data.data.test_questions;
          }
        }

        // Check if this endpoint has is_answer flags
        for (const q of questions) {
          const options =
            q.test_questions_options ||
            q.options ||
            q.test_question_options ||
            [];
          const correctOpts = options
            .filter((o: any) => o.is_answer === 1)
            .map((o: any) => o.id);
          if (correctOpts.length > 0 && !answerMap[q.id]) {
            answerMap[q.id] = correctOpts;
            if (!sourceEndpoint) sourceEndpoint = key;
          }
        }

        if (questions.length > 0 && questionsWithAnswers.length === 0) {
          questionsWithAnswers.push(...questions);
        }
      }

      return NextResponse.json({
        success: true,
        answerMap,
        sourceEndpoint,
        questionsWithAnswers,
        answerCount: Object.keys(answerMap).length,
      });
    }

    // ─── Submit test ───
    if (action === 'submit') {
      const { subject_id, user_id, roll_number, question_answers } = body;

      if (!user_id || !question_answers) {
        return NextResponse.json(
          { success: false, message: 'Missing submission fields' },
          { status: 400 }
        );
      }

      const submitHeaders = {
        Accept: 'application/json, text/plain, */*',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Referer: 'https://sailstudent.sairamit.edu.in/',
        Origin: 'https://sailstudent.sairamit.edu.in',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      };

      // V1 payload (legacy endpoint — includes user_id, roll_number, subject_id)
      const v1Payload = {
        questionnaire_id: test_id,
        subject_id: subject_id || 0,
        question_answers,
        test_submission_type: 2, // V1 uses numeric
        user_id,
        roll_number,
      };

      // V2 payload (new endpoint — leaner, auth via token)
      const v2Payload = {
        questionnaire_id: test_id,
        question_answers,
        test_submission_type: 'manual',
        device: 'web',
        device_details: 'Windows desktop Chrome browser',
        reason: 'Student submitted the test',
      };

      // Try endpoints with their matching payload formats
      const attempts = [
        { url: SUBMISSION_URL, payload: v1Payload, label: 'v1-legacy' },
        { url: 'https://q6wjgn02f4.execute-api.ap-south-1.amazonaws.com/prod/testsubmission', payload: v2Payload, label: 'v2-new' },
        { url: `${BASE_URL}/questionnaire/v2/submitTest`, payload: v1Payload, label: 'v2-direct' },
      ];

      let lastError = 'All submission endpoints failed';
      const debugLogs: string[] = [];

      for (const attempt of attempts) {
        try {
          console.log(`[test-actions] trying ${attempt.label}: ${attempt.url}`);
          const res = await fetch(attempt.url, {
            method: 'POST',
            headers: submitHeaders,
            body: JSON.stringify(attempt.payload),
          });

          const rawText = await res.text();
          console.log(`[test-actions] ${attempt.label} raw response (${res.status}):`, rawText.substring(0, 500));
          debugLogs.push(`${attempt.label} [HTTP ${res.status}]: ${rawText.substring(0, 200)}`);

          let data: any;
          try {
            data = JSON.parse(rawText);
          } catch {
            lastError = `${attempt.label}: Non-JSON response (HTTP ${res.status})`;
            continue;
          }

          // Check for success in various response formats
          const respStatus = data.status || data.statusCode || res.status;
          const respMsg = data.message || data.msg || data.error || '';

          if (respStatus === 200 || respStatus === 201 || data.success === true) {
            return NextResponse.json({
              success: true,
              submission_id: data.submission_id || data.id,
              message: respMsg || 'Test submitted successfully',
            });
          }

          // 409 = already submitted
          if (respStatus === 409) {
            return NextResponse.json({
              success: true,
              message: respMsg || 'Test was already submitted',
            });
          }

          lastError = `${attempt.label}: ${respMsg || `Status ${respStatus}`}`;
        } catch (err: any) {
          const msg = err?.message || 'Network error';
          lastError = `${attempt.label}: ${msg}`;
          debugLogs.push(`${attempt.label}: EXCEPTION - ${msg}`);
          console.error(`[test-actions] ${attempt.label} error:`, msg);
        }
      }

      return NextResponse.json({
        success: false,
        message: lastError,
        debug: debugLogs,
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[test-actions] error:', error?.message || error);
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 500 }
    );
  }
}
