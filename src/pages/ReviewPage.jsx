import { MessageSquareText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  AdminPageLayout,
  StateCard,
  StatusBadge,
  useDashboardTheme,
} from '../components/admin/AdminLayout';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

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

  const normalizedStatus = useMemo(() => {
    if (assignment?.reviewStatus === 'REVIEWED') {
      return 'REVIEWED';
    }

    return 'PENDING';
  }, [assignment]);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/assignments/review', {
        assignmentId: id,
        adminComment: comment,
      });

      navigate('/admin/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit review.');
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
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    {assignment?.userId?.name || assignment?.userId?.email || 'Employee'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {assignment?.checkInId?.title || 'Untitled Check-in'}
                  </p>
                </div>
                <StatusBadge status={normalizedStatus} />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {answers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No answers were submitted for this assignment.
                </div>
              ) : (
                answers.map((answer) => (
                  <article
                    key={answer._id || answer.question}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      {answer.question}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {answer.answer || 'No response provided.'}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Admin Comment
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Add feedback before marking this submission as reviewed.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share feedback for the employee..."
                required={assignment?.reviewStatus !== 'REVIEWED'}
                disabled={assignment?.reviewStatus === 'REVIEWED'}
                className="min-h-48 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950"
              />

              {error ? (
                <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                  {error}
                </p>
              ) : null}

              {assignment?.reviewStatus === 'REVIEWED' ? (
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
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#6366F1] px-4 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[#5855eb] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
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
