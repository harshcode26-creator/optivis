import { AlertCircle, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  AdminPageLayout,
  EmptyStateBox,
  InsightCard,
  StateCard,
  StatCard,
  TableRow,
  useDashboardTheme,
} from '../components/admin/AdminLayout';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

function getSentimentDisplay(sentimentScore) {
  if (sentimentScore > 0) {
    return {
      label: 'Positive',
      className: 'text-emerald-600 dark:text-emerald-300',
    };
  }

  if (sentimentScore < 0) {
    return {
      label: 'Negative',
      className: 'text-rose-600 dark:text-rose-300',
    };
  }

  return {
    label: 'Neutral',
    className: 'text-slate-500 dark:text-slate-400',
  };
}

function RecentSubmissionsTable({ assignments, onOpenAssignment }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Recent Submissions
        </h2>
      </div>

      {assignments.length === 0 ? (
        <div className="p-5">
          <EmptyStateBox>No submissions yet.</EmptyStateBox>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-slate-100 px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:border-slate-800">
            <p>Employee Name</p>
            <p>Week</p>
            <p>Status</p>
            <p className="justify-self-end">Action</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {assignments.map((assignment) => (
              <TableRow
                key={assignment._id || assignment.id}
                assignment={assignment}
                onAction={onOpenAssignment}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function TeamInsights({ blockers, summary }) {
  return (
    <div className="space-y-6">
      <InsightCard title="Team Insights">
        <div className="mt-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Active Blockers
          </p>

          {blockers.length === 0 ? (
            <div className="mt-4">
              <EmptyStateBox>No blockers reported.</EmptyStateBox>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {blockers.map((blocker) => (
                <span
                  key={blocker}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
                >
                  {blocker}
                </span>
              ))}
            </div>
          )}
        </div>
      </InsightCard>

      <InsightCard title="AI Summary" className="bg-[#EEF2FF] dark:bg-[#121A31]">
        <div className="mt-4 flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
            {summary || 'AI summary is not available yet for this workspace.'}
          </p>
        </div>
      </InsightCard>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const { isDarkMode, toggleDarkMode } = useDashboardTheme();
  const [insights, setInsights] = useState(null);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [insightsResponse, submittedResponse] = await Promise.all([
          api.get('/insights'),
          api.get('/assignments/submitted'),
        ]);

        setInsights(insightsResponse.data || {});
        setSubmittedAssignments(submittedResponse.data || []);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const normalizedAssignments = useMemo(
    () =>
      submittedAssignments.map((assignment) => ({
        ...assignment,
        user: assignment.userId,
        checkIn: assignment.checkInId,
        statusLabel: assignment.reviewStatus === 'REVIEWED' ? 'REVIEWED' : 'PENDING',
      })),
    [submittedAssignments],
  );

  const blockerItems = useMemo(() => {
    if (Array.isArray(insights?.blockers) && insights.blockers.length > 0) {
      return insights.blockers;
    }

    return Object.keys(insights?.blockerSummary || {});
  }, [insights]);

  const sentimentDisplay = useMemo(
    () => getSentimentDisplay(Number(insights?.averageSentiment || 0)),
    [insights],
  );

  const stats = useMemo(
    () => [
      {
        title: 'Total Check-ins Created',
        value: insights?.totalCheckInsCreated ?? 0,
      },
      {
        title: 'Total Submissions',
        value: insights?.submittedCount ?? 0,
        subtext: 'weekly',
      },
      {
        title: 'Reviewed Count',
        value: insights?.reviewedCount ?? 0,
        subtext:
          (insights?.submittedCount || 0) > 0
            ? `${Math.round(((insights?.reviewedCount || 0) / insights.submittedCount) * 100)}% Rate`
            : undefined,
      },
      {
        title: 'Avg Sentiment',
        value: sentimentDisplay.label,
        valueClassName: sentimentDisplay.className,
      },
    ],
    [insights, sentimentDisplay],
  );

  const handleOpenAssignment = (assignment) => {
    navigate(`/admin/assignment/${assignment._id || assignment.id}`);
  };

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminPageLayout
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      pageTitle="Admin Dashboard"
    >
      {loading ? (
        <StateCard title="Loading Dashboard" message="Fetching insights and recent submissions." />
      ) : error ? (
        <StateCard
          title="Dashboard Unavailable"
          message={error}
          tone="error"
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                subtext={stat.subtext}
                valueClassName={stat.valueClassName}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <TeamInsights
              blockers={blockerItems}
              summary={insights?.summary || insights?.aiSummary}
            />

            <RecentSubmissionsTable
              assignments={normalizedAssignments.slice(0, 6)}
              onOpenAssignment={handleOpenAssignment}
            />
          </section>

          {normalizedAssignments.length === 0 ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <EmptyStateBox className="bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">
                      No submissions yet
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Submitted employee check-ins will appear here once the first responses come in.
                    </p>
                  </div>
                </div>
              </EmptyStateBox>
            </section>
          ) : null}
        </div>
      )}
    </AdminPageLayout>
  );
}

export default AdminDashboard;
