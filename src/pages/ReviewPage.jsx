import {
  CheckCircle2,
  LoaderCircle,
  Lock,
  MessageSquareText,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  AdminPageLayout,
  EmptyStateBox,
  StateCard,
  StatusBadge,
  useDashboardTheme,
} from '../components/admin/AdminLayout';
import ConfirmModal from '../components/ConfirmModal';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

function formatDateLabel(dateValue, prefix) {
  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${prefix} ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

function SuccessToast({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
      <CheckCircle2 className="h-5 w-5" />
      {message}
    </div>
  );
}

function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      <Lock className="h-3.5 w-3.5" />
      Read-only
    </span>
  );
}

function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUserFromToken();
  const { isDarkMode, toggleDarkMode } = useDashboardTheme();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/assignments/${id}`);
        setAssignment(response.data.assignment || null);
        setAnswers(response.data.answers || []);
        setComment(response.data.assignment?.adminComment || '');
      } catch (requestError) {
        setError(requestError.message || 'Unable to load assignment.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  const normalizedStatus = useMemo(
    () => (assignment?.reviewStatus === 'REVIEWED' ? 'REVIEWED' : 'PENDING'),
    [assignment],
  );
  const isReviewed = assignment?.reviewStatus === 'REVIEWED';
  const isCommentEmpty = !comment.trim();
  const submitDisabled = isSubmitting || isReviewed || isCommentEmpty;
  const submittedOn = formatDateLabel(
    assignment?.submittedAt || assignment?.updatedAt || assignment?.createdAt,
    'Submitted on',
  );
  const reviewedOn = formatDateLabel(assignment?.reviewedAt, 'Reviewed on');

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmitRequest = (event) => {
    event.preventDefault();

    if (isReviewed) {
      return;
    }

    if (isCommentEmpty) {
      setCommentError('Please add feedback before submitting review');
      return;
    }

    setCommentError('');
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    setCommentError('');

    try {
      await api.post('/assignments/review', {
        assignmentId: id,
        adminComment: comment.trim(),
      });

      const reviewedAt = new Date().toISOString();

      setAssignment((currentAssignment) =>
        currentAssignment
          ? {
              ...currentAssignment,
              reviewStatus: 'REVIEWED',
              reviewedAt,
              adminComment: comment.trim(),
            }
          : currentAssignment,
      );
      setComment(comment.trim());
      setSuccessMessage('Review submitted successfully');
      setIsConfirmOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit review.');
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      pageTitle="Assignment Review"
      ctaLabel="Back to Dashboard"
      ctaTo="/admin/dashboard"
      ctaIcon={MessageSquareText}
    >
      <ConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsConfirmOpen(false)}
        title="Mark As Reviewed?"
        message="Are you sure you want to mark this check-in as reviewed?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        isLoading={isSubmitting}
      />

      <SuccessToast message={successMessage} />

      {loading ? (
        <StateCard title="Loading Assignment" message="Fetching submission details." />
      ) : error && !assignment ? (
        <StateCard
          title="Unable To Load Assignment"
          message={error}
          tone="error"
          actionLabel="Back to Dashboard"
          onAction={() => navigate('/admin/dashboard')}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-black text-slate-950 dark:text-white">
                    {assignment?.userId?.name || assignment?.userId?.email || 'Employee'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {assignment?.checkInId?.title || 'Untitled Check-in'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={normalizedStatus} />
                  {isReviewed ? <ReadOnlyBadge /> : null}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-400">
                {submittedOn ? <p>{submittedOn}</p> : null}
                {isReviewed && reviewedOn ? <p>{reviewedOn}</p> : null}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {answers.length === 0 ? (
                <EmptyStateBox>No answers were submitted for this assignment.</EmptyStateBox>
              ) : (
                answers.map((answer, index) => (
                  <article
                    key={answer._id || `${answer.question}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-slate-950 dark:text-white">
                          {answer.question}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {answer.answer || 'No response provided.'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-950 dark:text-white">
                  Admin Comment
                </h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {isReviewed
                    ? 'This review has been submitted and is now read-only.'
                    : 'Add feedback before marking this submission as reviewed.'}
                </p>
              </div>
              {isReviewed ? <ReadOnlyBadge /> : null}
            </div>

            <form onSubmit={handleSubmitRequest} className="mt-6 space-y-4">
              <textarea
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  if (commentError && event.target.value.trim()) {
                    setCommentError('');
                  }
                }}
                placeholder="Share feedback for the employee..."
                disabled={isReviewed}
                className="min-h-48 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-85"
              />

              {commentError ? (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                  {commentError}
                </p>
              ) : null}

              {error ? (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                  {error}
                </p>
              ) : null}

              {isReviewed ? (
                <button
                  type="button"
                  onClick={() => navigate('/admin/check-ins')}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                >
                  Back to Check-ins
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitDisabled}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#6366F1] px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[#5855eb] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              )}
            </form>
          </aside>
        </div>
      )}
    </AdminPageLayout>
  );
}

export default ReviewPage;
