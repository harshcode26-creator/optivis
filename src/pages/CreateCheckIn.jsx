import { CirclePlus, Eye, EyeOff, LoaderCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Calendar from 'react-calendar';
import { Navigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { AdminPageLayout, StateCard, useDashboardTheme } from '../components/admin/AdminLayout';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

const QUESTION_REMOVE_DELAY_MS = 180;
const PREVIOUS_QUESTIONS_KEY = 'previousQuestions';
const DEFAULT_QUESTIONS = [
  'What did you accomplish this week?',
  'What are your top priorities next week?',
  'Any blockers or challenges?',
  'What did you learn?',
  'How are you feeling about your work?',
];

function createQuestionItem(value = '', options = {}) {
  return {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    value,
    isRemoving: false,
    isEntering: options.isEntering ?? false,
  };
}

function createQuestionItems(values) {
  return values.map((value) => createQuestionItem(value));
}

function mergeQuestionValues(savedQuestions = []) {
  const seenQuestions = new Set();

  return [...DEFAULT_QUESTIONS, ...savedQuestions].reduce((mergedQuestions, question) => {
    const normalizedQuestion = typeof question === 'string' ? question.trim() : '';

    if (!normalizedQuestion) {
      return mergedQuestions;
    }

    const questionKey = normalizedQuestion.toLowerCase();

    if (seenQuestions.has(questionKey)) {
      return mergedQuestions;
    }

    seenQuestions.add(questionKey);
    mergedQuestions.push(normalizedQuestion);
    return mergedQuestions;
  }, []);
}

function getInitialQuestionValues() {
  if (typeof window === 'undefined') {
    return [...DEFAULT_QUESTIONS];
  }

  try {
    const parsedQuestions = JSON.parse(window.localStorage.getItem(PREVIOUS_QUESTIONS_KEY));
    const savedQuestions = Array.isArray(parsedQuestions) ? parsedQuestions : [];
    const mergedQuestions = mergeQuestionValues(savedQuestions);
    return mergedQuestions.length > 0 ? mergedQuestions : [...DEFAULT_QUESTIONS];
  } catch {
    return [...DEFAULT_QUESTIONS];
  }
}

function startOfWeek(date) {
  const nextDate = new Date(date);
  const dayOfWeek = nextDate.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
}

function endOfWeek(date) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 6);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function isSameDay(firstDate, secondDate) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatWeekTitle(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatMonthTitle(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
  });
}

function buildAutoTitle(nextPeriod, date) {
  if (!date) {
    return '';
  }

  if (nextPeriod === 'MONTHLY') {
    return `Monthly Check-in – ${formatMonthTitle(date)}`;
  }

  return `Week of ${formatWeekTitle(startOfWeek(date))}`;
}

function SuccessToast({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      <CirclePlus className="h-5 w-5" />
      {message}
    </div>
  );
}

function PreviewPanel({ isVisible, title, questions }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950 dark:text-white">Preview</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            See how this check-in will appear to employees.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          Read-only
        </span>
      </div>

      {isVisible ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Check-in Title
            </p>
            <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">
              {title.trim() || 'Weekly Team Reflection'}
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-indigo-600 dark:bg-slate-900 dark:text-indigo-300">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      {question.value.trim() || 'What did you accomplish this week?'}
                    </p>
                    <input
                      type="text"
                      readOnly
                      placeholder="Employee response"
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
          Turn preview on to inspect the title and question flow before creating the check-in.
        </div>
      )}
    </section>
  );
}

function CreateCheckIn() {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('WEEKLY');
  const [selectedDate, setSelectedDate] = useState(null);
  const [questions, setQuestions] = useState(() => createQuestionItems(getInitialQuestionValues()));
  const [titleTouched, setTitleTouched] = useState(false);
  const [questionTouched, setQuestionTouched] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const inputRefs = useRef({});
  const pendingFocusId = useRef(null);
  const user = getUserFromToken();
  const { isDarkMode, toggleDarkMode } = useDashboardTheme();

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    if (!pendingFocusId.current) {
      return;
    }

    const targetInput = inputRefs.current[pendingFocusId.current];

    if (targetInput) {
      targetInput.focus();
      pendingFocusId.current = null;
    }
  }, [questions]);

  useEffect(() => {
    const enteringQuestionIds = questions
      .filter((question) => question.isEntering)
      .map((question) => question.id);

    if (enteringQuestionIds.length === 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setQuestions((currentQuestions) =>
        currentQuestions.map((question) =>
          enteringQuestionIds.includes(question.id) ? { ...question, isEntering: false } : question,
        ),
      );
    }, 20);

    return () => window.clearTimeout(timeoutId);
  }, [questions]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const visibleQuestions = questions.filter((question) => !question.isRemoving);
  const trimmedTitle = title.trim();
  const titleError =
    !trimmedTitle ? 'Title is required' : trimmedTitle.length < 3 ? 'Title must be at least 3 characters' : '';
  const questionErrors = visibleQuestions.map((question) =>
    question.value.trim() ? '' : 'Question cannot be empty',
  );
  const hasQuestionErrors = questionErrors.some(Boolean);
  const isFormInvalid = Boolean(titleError) || visibleQuestions.length === 0 || hasQuestionErrors;
  const previewQuestions = visibleQuestions.map((question) => ({ ...question }));

  const handlePeriodChange = (nextPeriod) => {
    if (nextPeriod === period) {
      return;
    }

    setPeriod(nextPeriod);

    if (selectedDate) {
      setTitle(buildAutoTitle(nextPeriod, selectedDate));
    }
  };

  const handleDateChange = (nextValue) => {
    const nextDate = Array.isArray(nextValue) ? nextValue[0] : nextValue;

    if (!nextDate) {
      return;
    }

    setSelectedDate(nextDate);
    setTitle(buildAutoTitle(period, nextDate));
  };

  const handleQuestionChange = (questionId, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, value } : question,
      ),
    );
  };

  const handleAddQuestion = () => {
    const nextQuestion = createQuestionItem('', { isEntering: true });
    pendingFocusId.current = nextQuestion.id;
    setQuestions((currentQuestions) => [...currentQuestions, nextQuestion]);
    setQuestionTouched((currentTouched) => ({
      ...currentTouched,
      [nextQuestion.id]: false,
    }));
  };

  const handleRemoveQuestion = (questionId) => {
    if (visibleQuestions.length === 1) {
      return;
    }

    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, isRemoving: true } : question,
      ),
    );

    window.setTimeout(() => {
      setQuestions((currentQuestions) =>
        currentQuestions.filter((question) => question.id !== questionId),
      );
      setQuestionTouched((currentTouched) => {
        const nextTouched = { ...currentTouched };
        delete nextTouched[questionId];
        return nextTouched;
      });
    }, QUESTION_REMOVE_DELAY_MS);
  };

  const resetForm = () => {
    const nextQuestions = createQuestionItems(getInitialQuestionValues());
    const [firstQuestion] = nextQuestions;
    setTitle('');
    setPeriod('WEEKLY');
    setSelectedDate(null);
    setQuestions(nextQuestions);
    setTitleTouched(false);
    setQuestionTouched({});
    setShowPreview(false);
    pendingFocusId.current = firstQuestion.id;
  };

  const handleSubmitRequest = (event) => {
    event.preventDefault();
    setTitleTouched(true);
    setQuestionTouched(
      Object.fromEntries(visibleQuestions.map((question) => [question.id, true])),
    );
    setError('');

    if (isFormInvalid) {
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmCreate = async () => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const submittedQuestions = visibleQuestions.map((question) => question.value.trim());

      await api.post('/checkins/create', {
        title: trimmedTitle,
        period,
        questions: submittedQuestions,
      });

      try {
        window.localStorage.setItem(PREVIOUS_QUESTIONS_KEY, JSON.stringify(submittedQuestions));
      } catch {
        // Ignore localStorage failures so a successful create flow still completes.
      }

      setSuccessMessage('Check-in created successfully');
      setIsConfirmOpen(false);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      setError(requestError.message || 'Unable to create check-in.');
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      pageTitle="Create Check-in"
      ctaLabel="View Check-ins"
      ctaTo="/admin/check-ins"
      ctaIcon={CirclePlus}
    >
      <ConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmCreate}
        onCancel={() => setIsConfirmOpen(false)}
        title="Create New Check-in?"
        message="This will create a new check-in and assign it to all employees. Continue?"
        confirmLabel="Create"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      />

      <SuccessToast message={successMessage} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">
            New Check-in
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create a weekly or monthly check-in for everyone in the workspace.
          </p>

          <form onSubmit={handleSubmitRequest} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
              <label className="block">
                <span className="text-sm font-black text-slate-950 dark:text-white">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onBlur={() => setTitleTouched(true)}
                  placeholder={
                    period === 'MONTHLY' ? 'Monthly Check-in – April' : 'Week of April 27, 2026'
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950"
                />
                {titleTouched && titleError ? (
                  <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">
                    {titleError}
                  </p>
                ) : null}
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-950 dark:text-white">Period</span>
                <div className="mt-2 inline-flex w-full rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950/50">
                  {['WEEKLY', 'MONTHLY'].map((option) => {
                    const isActive = period === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handlePeriodChange(option)}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-black transition-all duration-200 ${
                          isActive
                            ? 'scale-[1.02] bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300'
                            : 'text-slate-500 hover:scale-[1.01] hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        {option === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                      </button>
                    );
                  })}
                </div>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    {period === 'WEEKLY' ? 'Pick a week' : 'Pick a month'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {period === 'WEEKLY'
                      ? 'Choose any date to auto-title the check-in and highlight that full week.'
                      : 'Choose a month to auto-title the monthly check-in.'}
                  </p>
                </div>
                {selectedDate ? (
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {period === 'WEEKLY'
                      ? `Week of ${formatWeekTitle(startOfWeek(selectedDate))}`
                      : formatMonthTitle(selectedDate)}
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <Calendar
                  calendarType="iso8601"
                  className="create-checkin-calendar"
                  onChange={handleDateChange}
                  tileClassName={({ date, view }) => {
                    if (period !== 'WEEKLY' || view !== 'month' || !selectedDate) {
                      return null;
                    }

                    const weekStartDate = startOfWeek(selectedDate);
                    const weekEndDate = endOfWeek(weekStartDate);
                    const currentDate = new Date(date);
                    currentDate.setHours(0, 0, 0, 0);

                    if (currentDate < weekStartDate || currentDate > weekEndDate) {
                      return null;
                    }

                    const classNames = ['create-checkin-calendar__week-range'];

                    if (isSameDay(currentDate, weekStartDate)) {
                      classNames.push('create-checkin-calendar__week-start');
                    }

                    if (isSameDay(currentDate, weekEndDate)) {
                      classNames.push('create-checkin-calendar__week-end');
                    }

                    if (isSameDay(currentDate, selectedDate)) {
                      classNames.push('create-checkin-calendar__week-selected');
                    }

                    return classNames.join(' ');
                  }}
                  value={selectedDate}
                  view={period === 'MONTHLY' ? 'year' : 'month'}
                  minDetail={period === 'MONTHLY' ? 'year' : 'month'}
                  maxDetail={period === 'MONTHLY' ? 'year' : 'month'}
                  showNeighboringMonth={period === 'WEEKLY'}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    Questions
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Keep prompts concise and answerable within a weekly check-in flow.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview((currentValue) => !currentValue)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                  >
                    <CirclePlus className="h-4 w-4" />
                    Add Question
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {questions.map((question, index) => {
                  const visibleIndex = visibleQuestions.findIndex((item) => item.id === question.id);
                  const questionError = visibleIndex >= 0 ? questionErrors[visibleIndex] : '';
                  const showQuestionError = questionTouched[question.id] && questionError;

                  return (
                    <div
                      key={question.id}
                      className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 dark:border-slate-800 dark:bg-slate-950/40 ${
                        question.isRemoving
                          ? 'pointer-events-none -translate-y-1 scale-95 opacity-0'
                          : question.isEntering
                            ? 'translate-y-1 scale-95 opacity-0'
                            : 'translate-y-0 scale-100 opacity-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-indigo-600 dark:bg-slate-900 dark:text-indigo-300">
                          {visibleIndex >= 0 ? visibleIndex + 1 : index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <input
                            ref={(node) => {
                              if (node) {
                                inputRefs.current[question.id] = node;
                              } else {
                                delete inputRefs.current[question.id];
                              }
                            }}
                            type="text"
                            value={question.value}
                            onChange={(event) => handleQuestionChange(question.id, event.target.value)}
                            onBlur={() =>
                              setQuestionTouched((currentTouched) => ({
                                ...currentTouched,
                                [question.id]: true,
                              }))
                            }
                            placeholder="What did you accomplish this week?"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                          />
                          {showQuestionError ? (
                            <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-300">
                              {questionError}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(question.id)}
                          disabled={visibleQuestions.length === 1 || question.isRemoving}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error ? (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isFormInvalid || isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[#6366F1] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[#5855eb] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Creating Check-in...
                </>
              ) : (
                'Create Check-in'
              )}
            </button>
          </form>
        </section>

        <div className="space-y-4">
          <PreviewPanel
            isVisible={showPreview}
            title={title}
            questions={previewQuestions}
          />

          <StateCard
            title="Publishing Notes"
            message="Each new check-in creates assignments for every employee in the current workspace."
          />
        </div>
      </div>
    </AdminPageLayout>
  );
}

export default CreateCheckIn;
