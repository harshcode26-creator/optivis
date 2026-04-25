import {
  AlertCircle,
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  LoaderCircle,
  Lock,
  MessageSquareText,
  Send,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';

function normalizeQuestion(question, index) {
  if (typeof question === 'string') {
    return {
      id: `${question}-${index}`,
      text: question,
    };
  }

  return {
    id: question?._id || question?.id || `question-${index}`,
    text:
      question?.text ||
      question?.question ||
      question?.prompt ||
      `Question ${index + 1}`,
  };
}

function buildAnswerMap(answerList) {
  return new Map(
    (Array.isArray(answerList) ? answerList : []).map((item) => [
      item?.question,
      item?.answer || '',
    ]),
  );
}

function initializeAnswers(questionList, existingAnswers) {
  const answerMap = buildAnswerMap(existingAnswers);

  return questionList.map((question) => ({
    question,
    answer: answerMap.get(question) || '',
  }));
}

function formatSubmittedDate(dateValue) {
  if (!dateValue) {
    return 'Submitted date unavailable';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Submitted date unavailable';
  }

  return `Submitted on ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function formatReviewedDate(dateValue) {
  if (!dateValue) {
    return 'Review date unavailable';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'Review date unavailable';
  }

  return `Reviewed on ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function CheckInPage() {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('landing-theme') === 'dark';
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAssignment = async () => {
      setLoading(true);
      setErrorMessage('');

      const token =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('token')
          : null;
      const authConfig = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined;

      try {
        let response;

        try {
          response = await api.get(`/assignments/${assignmentId}`, authConfig);
        } catch (primaryError) {
          response = await api.get(`/assignments/my/${assignmentId}`, authConfig);

          if (primaryError?.status && primaryError.status !== 404) {
            console.warn(primaryError.message);
          }
        }

        if (!isMounted) {
          return;
        }

        const assignmentData = response.data.assignment || response.data;
        const existingAnswers =
          response.data.answers ||
          assignmentData.answers ||
          assignmentData.responses ||
          [];
        const questionList =
          response.data.questions ||
          assignmentData.checkInId?.questions ||
          assignmentData.questions ||
          existingAnswers.map((item) => item.question).filter(Boolean) ||
          [];

        setAssignment(assignmentData);
        setQuestions(questionList);
        setAnswers(initializeAnswers(questionList, existingAnswers));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAssignment(null);
        setQuestions([]);
        setAnswers([]);
        setErrorMessage(
          error.status === 404 ? 'Check-in not found' : error.message,
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAssignment();

    return () => {
      isMounted = false;
    };
  }, [assignmentId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = () => {
      setIsDarkMode(window.localStorage.getItem('landing-theme') === 'dark');
    };

    window.addEventListener('storage', handleStorage);
    handleStorage();

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage('');
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const redirectTimeoutId = window.setTimeout(() => {
      navigate('/dashboard');
    }, 900);

    return () => window.clearTimeout(redirectTimeoutId);
  }, [navigate, toastMessage]);

  const isSubmitted =
    assignment?.status === 'SUBMITTED' || assignment?.status === 'REVIEWED';
  const normalizedQuestions = useMemo(
    () => questions.map((question, index) => normalizeQuestion(question, index)),
    [questions],
  );
  const hasQuestions = normalizedQuestions.length > 0;
  const hasEmptyAnswers = answers.some((item) => !item.answer.trim());
  const isSubmitDisabled =
    !hasQuestions || hasEmptyAnswers || submitting || isSubmitted;
  const title =
    assignment?.checkInId?.title || assignment?.title || 'Check-in';
  const subtitle = isSubmitted
    ? 'This check-in has already been submitted and is now read-only.'
    : 'Answer each question before submitting your check-in.';
  const isReviewed = assignment?.reviewStatus === 'REVIEWED';
  const managerFeedback = assignment?.adminComment?.trim() || 'No comment provided';

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((currentAnswers) =>
      currentAnswers.map((item, index) =>
        index === questionIndex ? { ...item, answer: value } : item,
      ),
    );
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const token =
      typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    const authConfig = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    try {
      await api.post(
        '/assignments/submit',
        {
          assignmentId,
          answers,
        },
        authConfig,
      );

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowConfirm(false);
      setToastMessage('Check-in submitted');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(isSubmitted ? '/check-ins' : '/dashboard');
  };

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-slate-950 dark:bg-[#050817] dark:text-white ${isDarkMode ? 'dark' : ''}`}
    >
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={handleSubmit}
        onCancel={() => setShowConfirm(false)}
        title="Submit Check-in?"
        message="Once submitted, you won’t be able to edit your answers."
        confirmLabel="Submit"
        cancelLabel="Cancel"
        isLoading={submitting}
      />

      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          {toastMessage ? (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              {toastMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-300" />
                Loading check-in...
              </div>
            </section>
          ) : errorMessage ? (
            <section className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm dark:border-rose-500/30 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-rose-500" />
                <div>
                  <h1 className="text-xl font-black text-slate-950 dark:text-white">
                    {errorMessage}
                  </h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    The check-in could not be loaded.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {assignment?.status || 'PENDING'}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                      {title}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {subtitle}
                    </p>
                  </div>

                  {isSubmitted ? (
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Lock className="h-3.5 w-3.5" />
                        Read only
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {formatSubmittedDate(assignment?.updatedAt || assignment?.createdAt)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>

              {!hasQuestions ? (
                <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    No questions available for this check-in.
                  </p>
                </section>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!isSubmitDisabled) {
                      setShowConfirm(true);
                    }
                  }}
                  className="space-y-5"
                >
                  {normalizedQuestions.map((question, index) => (
                    <section
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {index + 1}
                        </div>
                        <h2 className="text-lg font-black text-slate-950 dark:text-white">
                          {question.text}
                        </h2>
                      </div>

                      {isSubmitted ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                          {answers[index]?.answer?.trim() || 'No answer provided'}
                        </div>
                      ) : (
                        <textarea
                          id={`question-${index}`}
                          value={answers[index]?.answer || ''}
                          onChange={(event) =>
                            handleAnswerChange(index, event.target.value)
                          }
                          placeholder="Write your response here..."
                          className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/15"
                        />
                      )}
                    </section>
                  ))}

                  {isReviewed ? (
                    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                            <MessageSquareText className="h-4 w-4" />
                          </div>
                          <div>
                            <h2 className="text-lg font-black text-slate-950 dark:text-white">
                              Manager Feedback
                            </h2>
                            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                              {formatReviewedDate(assignment?.reviewedAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-amber-400/20 dark:bg-slate-900/70 dark:text-slate-200">
                        {managerFeedback}
                      </div>
                    </section>
                  ) : null}

                  {errorMessage ? (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4" />
                      {errorMessage}
                    </div>
                  ) : null}

                  {!isSubmitted ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {hasEmptyAnswers
                          ? 'Complete every answer before submitting.'
                          : 'Your answers are ready to submit.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowConfirm(true)}
                        disabled={isSubmitDisabled}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                      >
                        {submitting ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Check-in
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default CheckInPage;
