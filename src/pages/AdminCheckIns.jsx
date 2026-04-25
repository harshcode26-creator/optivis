import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  AdminPageLayout,
  StateCard,
  TableRow,
  useDashboardTheme,
} from '../components/admin/AdminLayout';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

function AdminCheckIns() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const { isDarkMode, toggleDarkMode } = useDashboardTheme();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/assignments/submitted');
        setAssignments(response.data || []);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load check-ins.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const normalizedAssignments = useMemo(
    () =>
      assignments.map((assignment) => ({
        ...assignment,
        user: assignment.userId,
        checkIn: assignment.checkInId,
        statusLabel: assignment.reviewStatus === 'REVIEWED' ? 'REVIEWED' : 'PENDING',
      })),
    [assignments],
  );

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminPageLayout
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      pageTitle="Check-ins"
    >
      {loading ? (
        <StateCard title="Loading Check-ins" message="Fetching submitted assignments." />
      ) : error ? (
        <StateCard
          title="Unable To Load Check-ins"
          message={error}
          tone="error"
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-base font-black text-slate-950 dark:text-white">
              Submitted Check-ins
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review or inspect every submitted employee check-in from the current workspace.
            </p>
          </div>

          {normalizedAssignments.length === 0 ? (
            <div className="px-5 py-10 text-sm font-medium text-slate-500 dark:text-slate-400">
              No submitted check-ins yet.
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
                {normalizedAssignments.map((assignment) => (
                  <TableRow
                    key={assignment._id || assignment.id}
                    assignment={assignment}
                    onAction={(selectedAssignment) =>
                      navigate(`/admin/assignment/${selectedAssignment._id || selectedAssignment.id}`)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </AdminPageLayout>
  );
}

export default AdminCheckIns;
