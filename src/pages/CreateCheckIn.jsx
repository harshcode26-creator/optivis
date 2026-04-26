import { CirclePlus, Eye, EyeOff, LoaderCircle, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { AdminPageLayout, StateCard, useDashboardTheme } from '../components/admin/AdminLayout';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

const QUESTION_REMOVE_DELAY_MS = 180;

function createQuestionItem(value = '') {
  return {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    value,
    isRemoving: false,
  };
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
  const [questions, setQuestions] = useState([createQuestionItem()]);
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

  const previewQuestions = useMemo(
    () => visibleQuestions.map((question) => ({ ...question })),
    [visibleQuestions],
  );

  const handleQuestionChange = (questionId, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, value } : question,
      ),
    );
  };

  const handleAddQuestion = () => {
    const nextQuestion = createQuestionItem();
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
    const firstQuestion = createQuestionItem();
    setTitle('');
    setPeriod('WEEKLY');
    setQuestions([firstQuestion]);
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
      await api.post('/checkins/create', {
        title: trimmedTitle,
        period,
        questions: visibleQuestions.map((question) => question.value.trim()),
      });

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
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="text-sm font-black text-slate-950 dark:text-white">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onBlur={() => setTitleTouched(true)}
                  placeholder="Weekly Team Reflection"
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
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-950"
                >
                  <option value="WEEKLY">WEEKLY</option>
                  <option value="MONTHLY">MONTHLY</option>
                </select>
              </label>
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
                          ? 'pointer-events-none -translate-y-1 opacity-0'
                          : 'translate-y-0 opacity-100'
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
