'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReflectiveCard from '../components/ReflectiveCard';
import GradientText from '../components/GradientText';
import DecryptedText from '../components/DecryptedText';
import AnimatedList from '../components/AnimatedList';
import './dashboard.css';

interface UserData {
  user_id: number;
  name: string;
  roll_number: string;
  section_id: number;
  section_name: string;
  semester_id: number;
  department_name: string;
  college_name: string;
  college_university_degree_department_id: number;
  department_id: number;
  regulation_batch_mapping_id: number;
  token: string;
  profile_pic: string;
  [key: string]: any;
}

interface Subject {
  id: number;
  name: string;
  colour_code: string;
  faculty_name: string;
  college_subject_mapping_id: number;
}

interface TestOption {
  id: number;
  name: string;
  is_answer: number;
  option_img: string;
  question_id: number;
  selected_option?: number;
  selected_option_id?: number;
}

interface Question {
  id: number;
  name: string;
  math_type?: number;
  question_img?: string;
  blooms_level?: string;
  test_questions_options: TestOption[];
  marks?: number;
  section_name?: string;
  correctly_answered?: number;
  solution?: string;
}

interface Test {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  subject_id?: number;
  start_time: string;
  doe: string;
  timelimit: number;
  submitted: number;
  results_release_time?: string;
  questions_count?: number;
  college_account_details?: { faculty_name: string; profile_pic: string };
  remedial_path?: number;
}

interface PointsData {
  academic: number;
  daily_rewards: number;
  streak_points: number;
  total_points: number;
  student_name: string;
}

interface Feature {
  feature_id: number;
  feature_name: string;
  feature_points: number;
  percentage_contribution: number;
}

type TestStatus = 'submitted' | 'missed' | 'live' | 'upcoming';

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activityWall, setActivityWall] = useState<Test[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [resultsReleased, setResultsReleased] = useState<Test[]>([]);
  const [points, setPoints] = useState<PointsData | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming' | 'recent'>('all');

  // Interactive test state
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const [showQuestionsTestId, setShowQuestionsTestId] = useState<number | null>(null);
  const [answersModalTest, setAnswersModalTest] = useState<Test | null>(null);
  const [testQuestions, setTestQuestions] = useState<Record<number, Question[]>>({});
  const [loadingTest, setLoadingTest] = useState<number | null>(null);
  const [submittingTest, setSubmittingTest] = useState<number | null>(null);
  const [submitCountdown, setSubmitCountdown] = useState<number | null>(null);
  const [submitLog, setSubmitLog] = useState<Record<number, string>>({});
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getToken = () => userData?.token || sessionStorage.getItem('edwiselyToken') || sessionStorage.getItem('token') || '';

  const fetchDashboard = useCallback(async (ud: UserData, token: string) => {
    try {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ud.token || token,
          section_id: ud.section_id,
          college_university_degree_department_id: ud.college_university_degree_department_id,
          semester_id: ud.semester_id,
          department_id: ud.department_id,
          regulation_batch_mapping_id: ud.regulation_batch_mapping_id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.points) setPoints(data.points);
        if (data.features) setFeatures(data.features);
        if (data.subjects) setSubjects(data.subjects);
        if (data.activityWall) setActivityWall(data.activityWall);
        if (data.upcomingTests) setUpcomingTests(data.upcomingTests);
        if (data.resultsReleased) setResultsReleased(data.resultsReleased);
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    setIsAuthenticated(true);

    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const ud: UserData = JSON.parse(userStr);
        setUserName(ud.name);
        setUserData(ud);
        fetchDashboard(ud, token);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [router, fetchDashboard]);

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('edwiselyToken');
    router.push('/');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatPoints = (n: number) => {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  };

  const getTestStatus = (test: Test): TestStatus => {
    const now = new Date();
    const doe = new Date(test.doe);
    const start = new Date(test.start_time);
    if (test.submitted === 1) return 'submitted';
    if (now > doe) return 'missed';
    if (now >= start && now <= doe) return 'live';
    return 'upcoming';
  };

  const badgeInfo: Record<TestStatus, { text: string; cls: string }> = {
    submitted: { text: 'Submitted', cls: 'badge-submitted' },
    missed: { text: 'Missed', cls: 'badge-missed' },
    live: { text: 'Live Now', cls: 'badge-live' },
    upcoming: { text: 'Upcoming', cls: 'badge-upcoming' },
  };

  // ─── Helper: fetch correct answers from all SAIL endpoints ───
  const fetchCorrectAnswers = async (testId: number, token: string): Promise<Record<number, number[]>> => {
    try {
      const res = await fetch('/api/test-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch-correct', token, test_id: testId }),
      });
      const data = await res.json();
      if (data.success && data.answerMap) {
        console.log(`[fetchCorrectAnswers] Found ${data.answerCount} answers from ${data.sourceEndpoint}`);
        return data.answerMap as Record<number, number[]>;
      }
    } catch (err) {
      console.error('Error fetching correct answers:', err);
    }
    return {};
  };

  // ─── Helper: merge is_answer flags from answerMap into questions ───
  const mergeAnswersIntoQuestions = (questions: Question[], answerMap: Record<number, number[]>): Question[] => {
    return questions.map((q) => {
      const correctIds = answerMap[q.id] || [];
      if (correctIds.length === 0) return q;
      return {
        ...q,
        test_questions_options: q.test_questions_options.map((opt) => ({
          ...opt,
          is_answer: correctIds.includes(opt.id) ? 1 : 0,
        })),
      };
    });
  };

  // ─── Show Answers ───
  const handleShowAnswers = async (test: Test) => {
    if (testQuestions[test.id]) {
      // Already loaded — open modal
      setAnswersModalTest(test);
      return;
    }
    setLoadingTest(test.id);
    setSubmitLog((prev) => ({ ...prev, [test.id]: 'Fetching correct answers from SAIL...' }));
    const token = getToken();
    const status = getTestStatus(test);

    try {
      // Step 1: Try to fetch correct answers from all SAIL answer endpoints
      const answerMap = await fetchCorrectAnswers(test.id, token);
      const hasAnswers = Object.keys(answerMap).length > 0;

      // Step 2: Get the questions themselves
      let questions: Question[] = [];

      if (status === 'submitted' || status === 'missed') {
        const res = await fetch('/api/test-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'answers', token, test_id: test.id }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          questions = data.data;
        }
      }

      // Fallback: fetch questionnaire for live/upcoming or if above failed
      if (questions.length === 0) {
        const res = await fetch('/api/test-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch', token, test_id: test.id }),
        });
        const data = await res.json();
        if (data.success && data.questions) {
          questions = data.questions;
        } else {
          setSubmitLog((prev) => ({ ...prev, [test.id]: data.message || 'Failed to load questions' }));
          setLoadingTest(null);
          return;
        }
      }

      // Step 3: Merge correct answers into questions
      if (hasAnswers) {
        questions = mergeAnswersIntoQuestions(questions, answerMap);
        const answeredCount = Object.keys(answerMap).length;
        setSubmitLog((prev) => ({
          ...prev,
          [test.id]: `Found correct answers for ${answeredCount}/${questions.length} questions`,
        }));
      } else {
        // Check if questions already have is_answer from the endpoint
        const alreadyHasAnswers = questions.some((q) =>
          q.test_questions_options.some((o) => o.is_answer === 1)
        );
        if (alreadyHasAnswers) {
          setSubmitLog((prev) => ({ ...prev, [test.id]: 'Answers loaded from results' }));
        } else {
          setSubmitLog((prev) => ({
            ...prev,
            [test.id]: 'Questions loaded but no correct answers available yet',
          }));
        }
      }

      setTestQuestions((prev) => ({ ...prev, [test.id]: questions }));
      setExpandedTestId(test.id);
      setAnswersModalTest(test);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setSubmitLog((prev) => ({ ...prev, [test.id]: 'Error loading questions' }));
    }
    setLoadingTest(null);
  };

  // ─── Auto-submit test with CORRECT answers ───
  const handleAutoSubmit = async (test: Test) => {
    if (!userData) return;
    const token = getToken();
    const status = getTestStatus(test);

    if (status !== 'live') {
      setSubmitLog((prev) => ({ ...prev, [test.id]: 'Can only submit live tests' }));
      return;
    }

    setSubmittingTest(test.id);
    setSubmitLog((prev) => ({ ...prev, [test.id]: 'Fetching questions & correct answers...' }));

    try {
      // Step 1: Fetch questions AND correct answers in parallel
      const [qRes, answerMap] = await Promise.all([
        fetch('/api/test-actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch', token, test_id: test.id }),
        }).then((r) => r.json()),
        fetchCorrectAnswers(test.id, token),
      ]);

      if (!qRes.success || !qRes.questions) {
        setSubmitLog((prev) => ({ ...prev, [test.id]: qRes.message || 'Failed to fetch questions' }));
        setSubmittingTest(null);
        return;
      }

      let questions: Question[] = qRes.questions;
      const subjectId = qRes.subject_id;
      const hasAnswerMap = Object.keys(answerMap).length > 0;

      // Merge correct answers into questions for display
      if (hasAnswerMap) {
        questions = mergeAnswersIntoQuestions(questions, answerMap);
      }

      setTestQuestions((prev) => ({ ...prev, [test.id]: questions }));
      setExpandedTestId(test.id);
      setShowQuestionsTestId(test.id);

      // Step 2: Build answer payload with CORRECT answers + fake 2-3 min timing
      let correctCount = 0;
      let unansweredCount = 0;
      const fakeStartTime = new Date(); // pretend we started now
      const fakeTotalSec = 120 + Math.floor(Math.random() * 61); // 120-180s fake total
      const perQuestionSec = Math.max(3, Math.floor(fakeTotalSec / questions.length));
      let elapsed = 0;

      const question_answers = questions.map((q, idx) => {
        // Find correct option
        let selectedOption: number | null = null;
        const correctFromMap = answerMap[q.id];
        if (correctFromMap && correctFromMap.length > 0) {
          selectedOption = correctFromMap[0];
          correctCount++;
        } else {
          const correctOpt = q.test_questions_options.find((o) => o.is_answer === 1);
          if (correctOpt) {
            selectedOption = correctOpt.id;
            correctCount++;
          } else {
            unansweredCount++;
          }
        }

        // Fake realistic per-question timing
        const jitter = Math.floor(Math.random() * 6) - 2; // -2 to +3s jitter
        const thisDuration = Math.max(2, perQuestionSec + jitter);
        const qStart = new Date(fakeStartTime.getTime() + elapsed * 1000);
        elapsed += thisDuration;
        const qEnd = new Date(fakeStartTime.getTime() + elapsed * 1000);
        const fmtDate = (d: Date) => d.toISOString().replace('T', ' ').substring(0, 19);

        return {
          question_id: q.id,
          question_option_id: selectedOption ?? null,
          timetaken: JSON.stringify([[fmtDate(qStart), fmtDate(qEnd), thisDuration]]),
          total_timetaken: thisDuration,
          screenshot: 0,
          isBookMarked: false,
          answered: selectedOption ? 1 : 0,
          action_type: 2,
          device: 2,
          internet_speed: 0,
          question_section_id: (q as any).section_id || null,
          question_section_marks: q.marks || 1,
        };
      });

      // Step 3: Submit IMMEDIATELY (no waiting)
      setSubmitLog((prev) => ({
        ...prev,
        [test.id]: `Submitting ${correctCount}/${questions.length} correct answers (fake time: ${fakeTotalSec}s)...`,
      }));
      const sRes = await fetch('/api/test-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          token,
          test_id: test.id,
          subject_id: subjectId,
          user_id: userData.user_id,
          roll_number: userData.roll_number,
          question_answers,
        }),
      });
      const sData = await sRes.json();

      if (sData.success) {
        setSubmitLog((prev) => ({
          ...prev,
          [test.id]: `Submitted! ${correctCount}/${questions.length} correct. Reported time: ${Math.floor(fakeTotalSec / 60)}m ${fakeTotalSec % 60}s. ${sData.message || ''}`,
        }));
        // Update locally
        const updater = (list: Test[]) =>
          list.map((t) => (t.id === test.id ? { ...t, submitted: 1 } : t));
        setActivityWall(updater);
        setUpcomingTests(updater);
      } else {
        const debugInfo = sData.debug ? '\n' + sData.debug.join('\n') : '';
        setSubmitLog((prev) => ({ ...prev, [test.id]: `Submit failed: ${sData.message}${debugInfo}` }));
      }
    } catch (err: any) {
      setSubmitLog((prev) => ({ ...prev, [test.id]: `Error: ${err?.message || 'unknown'}` }));
    }
    setSubmittingTest(null);
    setSubmitCountdown(null);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>We Won&apos;t SAIL Anymore...</p>
        </div>
      </div>
    );
  }

  const allTests = [...activityWall, ...upcomingTests, ...resultsReleased].filter(
    (test, idx, arr) => arr.findIndex((t) => t.id === test.id) === idx
  );
  const ongoingTests = allTests.filter((t) => getTestStatus(t) === 'live');
  const displayTests = activeTab === 'all' ? allTests : activeTab === 'ongoing' ? ongoingTests : activeTab === 'upcoming' ? upcomingTests : activityWall;

  return (
    <div className="dashboard-container">
      {/* Top bar */}
      <div className="dashboard-topbar">
        <span className="topbar-title"><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={8} showBorder={false}>SAIL Slayer</GradientText></span>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-content">
        {/* Hero: Reflective Card + Subjects */}
        <div className="hero-section">
          <ReflectiveCard
            userName={userData?.name || userName}
            department={userData?.department_name}
            rollNumber={userData?.roll_number}
            college={userData?.college_name}
            semester={userData?.semester_id}
            totalPoints={points?.total_points}
          />

          {subjects.length > 0 && (
            <div className="hero-subjects">
              <h2 className="section-title"><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={8} showBorder={false}>Subjects</GradientText> <span className="semester-tag">Sem {userData?.semester_id || ''}</span></h2>
              <AnimatedList
                items={subjects.map((s) => ({
                  id: s.id,
                  name: s.name,
                  faculty_name: s.faculty_name,
                }))}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={false}
              />
            </div>
          )}
        </div>

        {/* Tests & Assessments */}
        <div className="section-card">
          <h2 className="section-title"><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={8} showBorder={false}>Tests & Assessments</GradientText></h2>
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All ({allTests.length})
            </button>
            <button className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveTab('ongoing')}>
              Ongoing ({ongoingTests.length})
            </button>
            <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
              Upcoming ({upcomingTests.length})
            </button>
            <button className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`} onClick={() => setActiveTab('recent')}>
              Recent ({activityWall.length})
            </button>
          </div>

          {displayTests.length === 0 ? (
            <div className="empty-state">
              <p>{activeTab === 'ongoing' ? 'No ongoing tests right now' : activeTab === 'upcoming' ? 'No upcoming tests' : activeTab === 'all' ? 'No tests found' : 'No recent activity'}</p>
            </div>
          ) : (
            <div className="tests-scroll-wrapper">
            <div className="tests-list">
              {displayTests.map((test) => {
                const status = getTestStatus(test);
                const badge = badgeInfo[status];
                const isExpanded = expandedTestId === test.id;
                const questions = testQuestions[test.id];
                const isLoading = loadingTest === test.id;
                const isSubmitting = submittingTest === test.id;
                const log = submitLog[test.id];
                const canSubmit = status === 'live';
                const canShowAnswers = true;
                const isQuestionsVisible = showQuestionsTestId === test.id;

                return (
                  <div key={test.id} className={`test-card ${isExpanded ? 'expanded' : ''}`}>
                    {/* Clickable header */}
                    <div
                      className="test-header clickable"
                      onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                    >
                      <div className="test-header-left">
                        <span className={`expand-arrow ${isExpanded ? 'open' : ''}`}>&#9654;</span>
                        <h3 className="test-title">{test.title}</h3>
                      </div>
                      <span className={`status-badge ${badge.cls}`}>{badge.text}</span>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="test-expanded">
                        <div className="test-meta">
                          <span className="meta-item subject-tag">{test.subject_name}</span>
                          <span className="meta-item">Duration: {formatTime(test.timelimit)}</span>
                          <span className="meta-item">Start: {formatDateTime(test.start_time)}</span>
                          <span className="meta-item">End: {formatDateTime(test.doe)}</span>
                          {test.questions_count != null && <span className="meta-item">{test.questions_count} Questions</span>}
                          {test.college_account_details?.faculty_name && (
                            <span className="meta-item">By: {test.college_account_details.faculty_name}</span>
                          )}
                        </div>

                        {test.description && <p className="test-desc">{test.description}</p>}

                        {/* Action buttons */}
                        <div className="test-actions">
                          <button
                            className="action-btn show-answers-btn"
                            onClick={(e) => { e.stopPropagation(); handleShowAnswers(test); setAnswersModalTest(test); }}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Loading...' : 'Show Answers'}
                          </button>

                          {canSubmit && (
                            <button
                              className="action-btn submit-btn"
                              onClick={(e) => { e.stopPropagation(); handleAutoSubmit(test); }}
                              disabled={isSubmitting}
                            >
                              {isSubmitting
                                ? submitCountdown
                                  ? `Submitting in ${submitCountdown}s`
                                  : 'Submitting...'
                                : 'Auto Submit Test'}
                            </button>
                          )}
                        </div>

                        {/* Status log */}
                        {log && <p className="submit-log">{log}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="tests-scroll-fade-bottom" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Answers Modal Overlay ─── */}
      {answersModalTest && testQuestions[answersModalTest.id] && (
        <div className="answers-modal-overlay" onClick={() => setAnswersModalTest(null)}>
          <div className="answers-modal" onClick={(e) => e.stopPropagation()}>
            <div className="answers-modal-header">
              <div>
                <h2 className="answers-modal-title">{answersModalTest.title}</h2>
                <span className="answers-modal-subject">{answersModalTest.subject_name}</span>
              </div>
              <button className="answers-modal-close" onClick={() => setAnswersModalTest(null)}>&times;</button>
            </div>
            <div className="answers-modal-body">
              {testQuestions[answersModalTest.id].map((q, idx) => {
                const isSubmitted = answersModalTest.submitted === 1;
                return (
                  <div key={q.id} className="question-item">
                    <div className="question-header">
                      <span className="q-number">Q{idx + 1}</span>
                      {q.blooms_level && <span className="q-bloom">{q.blooms_level}</span>}
                      {q.marks != null && <span className="q-marks">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>}
                      {isSubmitted && q.correctly_answered === 1 && <span className="q-correct">&#10003; Correct</span>}
                      {isSubmitted && q.correctly_answered === 0 && q.correctly_answered !== undefined && <span className="q-wrong">&#10007; Wrong</span>}
                    </div>
                    <p className="q-text" dangerouslySetInnerHTML={{ __html: q.name }} />

                    <div className="options-list">
                      {q.test_questions_options.map((opt) => {
                        const isCorrect = opt.is_answer === 1;
                        const wasSelected = (opt.selected_option === 1 || ((opt as any).selected_option_id != null && (opt as any).selected_option_id === opt.id));
                        let cls = 'option-item';
                        if (isCorrect) cls += ' correct';
                        if (wasSelected && !isCorrect) cls += ' wrong-selected';
                        if (wasSelected && isCorrect) cls += ' correct-selected';
                        return (
                          <div key={opt.id} className={cls}>
                            <span className="opt-indicator-wrap">
                              {isCorrect && <span className="opt-indicator correct-ind">&#10003;</span>}
                              {wasSelected && !isCorrect && <span className="opt-indicator wrong-ind">&#10007;</span>}
                              {!isCorrect && !wasSelected && <span className="opt-indicator neutral-ind">&#9675;</span>}
                            </span>
                            <span className="opt-text" dangerouslySetInnerHTML={{ __html: opt.name }} />
                            {isCorrect && <span className="opt-badge correct-badge">Correct Answer</span>}
                            {wasSelected && !isCorrect && <span className="opt-badge wrong-badge">Your Answer</span>}
                            {wasSelected && isCorrect && <span className="opt-badge correct-badge">Your Answer &#10003;</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p className="footer-tagline">
          &ldquo;<DecryptedText
            text="A product of what happens when students are pushed beyond tolerance."
            animateOn="view"
            speed={40}
            maxIterations={12}
            sequential={true}
            className="decrypted-quote"
          />&rdquo;
        </p>
        <p className="footer-credit">Built with hatred against SAIL &mdash; by <strong><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={6} showBorder={false}>Jerry</GradientText></strong> &amp; <strong><GradientText colors={['#3B0DBF', '#8B00C4', '#D400FF', '#6A00A8']} animationSpeed={6} showBorder={false}>N71.h5</GradientText></strong></p>
      </footer>
    </div>
  );
}
