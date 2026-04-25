import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Home,
  LogOut,
  Moon,
  Play,
  Sun,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ThemeToggle({ isDarkMode, onToggleDarkMode }) {
  return (
    <button
      type="button"
      onClick={onToggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function getStoredUserName() {
  const userJson = localStorage.getItem('user');
  const storedName =
    localStorage.getItem('name') ||
    localStorage.getItem('userName') ||
    localStorage.getItem('username');

  if (storedName) {
    return storedName;
  }

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      return user.name || user.fullName || user.email || '';
    } catch {
      return '';
    }
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return '';
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || payload.fullName || payload.email || '';
  } catch {
    return '';
  }
}

function TopNavbar({ isDarkMode, onToggleDarkMode, displayName }) {
  const navigate = useNavigate();
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || 'U';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#050817]/95">
      <nav className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white"
        >
          15Five MERN
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
              {avatarLabel}
            </div>
            <p className="hidden text-sm font-black text-slate-950 sm:block dark:text-white">
              {displayName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

const navigationItems = [
  {
    label: 'Home',
    to: '/dashboard',
    icon: Home,
  },
  {
    label: 'Check-ins',
    to: '/check-ins',
    icon: CalendarCheck,
  },
];

function Sidebar() {
  return (
    <>
      <aside className="hidden w-[220px] shrink-0 border-r border-slate-200 bg-slate-50/80 px-4 py-6 lg:block dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-8">
          <p className="text-sm font-black text-indigo-600 dark:text-indigo-300">
            Employee Portal
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Growth & Feedback
          </p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-transparent font-semibold text-slate-600 hover:bg-white hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-indigo-300'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="border-b border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40 lg:hidden">
        <nav className="flex gap-2">
          {navigationItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 font-bold text-indigo-600 dark:border-indigo-500/40 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-slate-200 bg-white font-semibold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
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

function getAssignmentId(assignment) {
  return assignment?._id || assignment?.id;
}

function PendingCheckInCard({ assignment }) {
  const navigate = useNavigate();

  const handleStartCheckIn = () => {
    navigate(`/checkin/${assignment._id || assignment.id}`);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-900/8 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/30">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            Due in 2 days
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {assignment.checkInId?.title || assignment.title || 'Weekly Check-in'}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Take 5 minutes to reflect on your achievements, challenges, and
            goals for the coming week.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCheckIn}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500"
        >
          Start Check-in
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function PendingCheckIns({ pendingAssignments }) {
  const hasPendingAssignments = pendingAssignments.length > 0;

  if (pendingAssignments.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        No check-ins assigned yet
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border p-4 shadow-sm transition sm:p-5 ${
        hasPendingAssignments
          ? 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/30 dark:bg-indigo-500/10'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <CalendarCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Pending Check-ins
        </h2>
      </div>

      <div className="space-y-4">
      {pendingAssignments.map((assignment) => (
        <PendingCheckInCard
          key={assignment._id || assignment.id}
          assignment={assignment}
        />
      ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }) {
  const isReviewed = status === 'REVIEWED';

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
        isReviewed
          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'
      }`}
    >
      {status}
    </span>
  );
}

function CheckInsList({ assignments, title, emptyMessage, action }) {
  const navigate = useNavigate();

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          {title}
        </h2>
        {action ? (
          <button
            type="button"
            onClick={() => navigate(action.to)}
            className="text-sm font-bold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
          >
            {action.label}
          </button>
        ) : null}
      </div>

      {assignments.length === 0 ? (
        <div className="px-5 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">
          {emptyMessage}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {assignments.map((assignment) => (
            <button
              key={getAssignmentId(assignment)}
              type="button"
              onClick={() => navigate(`/checkin/${getAssignmentId(assignment)}`)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    assignment.status === 'REVIEWED'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'
                  }`}
                >
                  {assignment.status === 'REVIEWED' ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                    {assignment.checkInId?.title || assignment.title || 'Weekly Check-in'}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {formatSubmittedDate(assignment.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <StatusBadge status={assignment.status} />
                <ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentCheckIns({ submittedAssignments }) {
  return (
    <CheckInsList
      assignments={submittedAssignments.slice(0, 5)}
      title="Recent Check-ins"
      emptyMessage="No submissions yet"
      action={{ label: 'View All', to: '/check-ins' }}
    />
  );
}

function AllCheckIns({ submittedAssignments }) {
  return (
    <CheckInsList
      assignments={submittedAssignments}
      title="All Check-ins"
      emptyMessage="No submissions yet"
    />
  );
}

function DashboardStats({ totalCompleted, progress }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex items-center gap-2">
        <CalendarCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        <h2 className="text-base font-black text-slate-950 dark:text-white">
          Dashboard Stats
        </h2>
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Total Check-ins Completed
        </p>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-3xl font-black text-slate-950 dark:text-white">
            {totalCompleted}
          </p>
          <p className="pb-1 text-xs font-bold text-emerald-600 dark:text-emerald-300">
            Check-ins
          </p>
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-5 dark:border-slate-800">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Current Streak
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/15">
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-slate-950 dark:text-white">
            5 weeks
          </p>
        </div>
      </div>
    </aside>
  );
}

function EmployeeDashboard() {
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayName] = useState(() => getStoredUserName() || 'there');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('landing-theme') === 'dark';
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/assignments/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAssignments(response.data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    window.localStorage.setItem('landing-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const pendingAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'PENDING'),
    [assignments],
  );

  const submittedAssignments = useMemo(
    () =>
      assignments
        .filter(
          (assignment) =>
            assignment.status === 'SUBMITTED' || assignment.status === 'REVIEWED',
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [assignments],
  );

  const totalCompleted = submittedAssignments.length;
  const progress =
    assignments.length > 0
      ? Math.round((totalCompleted / assignments.length) * 100)
      : 0;
  const isCheckInsRoute = location.pathname === '/check-ins';

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] text-slate-950 dark:bg-[#050817] dark:text-white ${isDarkMode ? 'dark' : ''}`}
    >
      <TopNavbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((currentMode) => !currentMode)}
        displayName={displayName}
      />

      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
        <Sidebar />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <section className="mb-8">
              <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                {isCheckInsRoute ? 'Your Check-ins' : `Welcome back, ${displayName}`}
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {isCheckInsRoute
                  ? 'Review your submitted and reviewed check-in history.'
                  : "Here's your weekly check-in overview"}
              </p>
            </section>

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Loading...
              </div>
            ) : isCheckInsRoute ? (
              <AllCheckIns submittedAssignments={submittedAssignments} />
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <PendingCheckIns pendingAssignments={pendingAssignments} />
                  <RecentCheckIns submittedAssignments={submittedAssignments} />
                </div>

                <DashboardStats
                  totalCompleted={totalCompleted}
                  progress={progress}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
