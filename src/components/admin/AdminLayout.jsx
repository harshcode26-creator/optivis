import {
  Bell,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function decodeStoredTokenPayload() {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalizedPayload));
  } catch {
    return null;
  }
}

function getStoredAdminProfile() {
  const userJson = localStorage.getItem('user');
  const storedName =
    localStorage.getItem('name') ||
    localStorage.getItem('userName') ||
    localStorage.getItem('username');
  let displayName = storedName || '';
  let role = '';

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      displayName = displayName || user.name || user.fullName || user.email || '';
      role = user.role || '';
    } catch {
      role = '';
    }
  }

  if (!displayName || !role) {
    const payload = decodeStoredTokenPayload();

    if (payload) {
      displayName = displayName || payload.name || payload.fullName || payload.email || '';
      role = role || payload.role || '';
    }
  }

  return {
    displayName: displayName || 'Admin User',
    role: String(role || 'ADMIN').toUpperCase(),
  };
}

function clearStoredAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('name');
  localStorage.removeItem('userName');
  localStorage.removeItem('username');
}

function logoutAndRedirect(navigate, onBeforeNavigate) {
  if (onBeforeNavigate) {
    onBeforeNavigate();
  }

  clearStoredAuthData();
  navigate('/login');
}

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

function formatNotificationTime(dateValue) {
  if (!dateValue) {
    return 'Just now';
  }

  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) {
    return 'Just now';
  }

  const diffMs = Date.now() - timestamp;
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return 'Just now';
  }

  if (diffMs < hourMs) {
    return `${Math.floor(diffMs / minuteMs)}m ago`;
  }

  if (diffMs < dayMs) {
    return `${Math.floor(diffMs / hourMs)}h ago`;
  }

  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function AdminNotificationBell({ isDarkMode }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    }

    try {
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error(error.message || 'Failed to fetch notifications');
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications({ silent: true });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const unreadBadge = unreadCount > 9 ? '9+' : unreadCount;

  const handleBellClick = async () => {
    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);

    if (nextOpenState) {
      await fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.post('/notifications/read', {
          notificationId: notification._id || notification.id,
        });

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            (item._id || item.id) === (notification._id || notification.id)
              ? { ...item, isRead: true }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error(error.message || 'Failed to update notification');
    } finally {
      setIsOpen(false);
      navigate(`/review/${notification.assignmentId}`);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleBellClick}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black leading-none text-white shadow-sm">
            {unreadBadge}
          </span>
        ) : null}
      </button>

      <div
        className={`absolute right-0 top-12 w-80 origin-top-right rounded-2xl border shadow-xl transition duration-150 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
        } ${
          isDarkMode
            ? 'border-slate-700 bg-slate-900 text-white shadow-slate-950/40'
            : 'border-slate-200 bg-white text-slate-950 shadow-slate-900/10'
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="text-sm font-black">Notifications</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-4 py-6 text-sm font-bold text-slate-500 dark:text-slate-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-6 text-sm font-bold text-slate-500 dark:text-slate-400">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id || notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70"
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    notification.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-rose-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      notification.isRead
                        ? 'font-semibold text-slate-700 dark:text-slate-200'
                        : 'font-black text-slate-950 dark:text-white'
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const navigationItems = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Create Check-in',
    to: '/admin/create-checkin',
    icon: Plus,
  },
  {
    label: 'Check-ins',
    to: '/admin/check-ins',
    icon: ClipboardList,
  },
];

function SidebarContent({ onNavigate, isDarkMode  }) {
  const navigate = useNavigate();
  const { displayName, role } = getStoredAdminProfile();
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || 'A';
  const roleLabel = role === 'ADMIN' ? 'Admin' : role;

  const handleLogout = () => {
    logoutAndRedirect(navigate, onNavigate);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex flex-col items-start gap-1"
        >
          <img
            src={isDarkMode ? "/images/optivis-logo-dark.png" : "/images/optivis-logo.png"}
            alt="Optivis Logo"
            className="h-9 w-auto"
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Admin Console
          </p>
        </button>
      </div>

      <nav className="space-y-2">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                isActive
                  ? 'border-indigo-200 bg-indigo-50 font-bold text-indigo-600 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'border-transparent font-semibold text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-slate-900/70">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            {avatarLabel}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950 dark:text-white">
              {displayName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {roleLabel}
              </p>
              <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                {role}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

function Sidebar({ isDarkMode }) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white/80 px-5 py-6 backdrop-blur dark:border-slate-800 dark:bg-[#0B1220]/80 lg:block">
        <SidebarContent isDarkMode={isDarkMode}/>
      </aside>

      <div className="border-b border-slate-200 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-[#050817]/90 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button onClick={() => navigate("/admin/dashboard")}>
            <img
              src={isDarkMode ? "/images/optivis-logo-dark.png" : "/images/optivis-logo.png"}
              alt="Optivis Logo"
              className="h-9 w-auto"
            />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/40"
          />
          <aside className="relative z-10 h-full w-[280px] border-r border-slate-200 bg-white px-5 py-6 shadow-xl dark:border-slate-800 dark:bg-[#050817]">
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarContent onNavigate={() => setIsOpen(false)} isDarkMode={isDarkMode}/>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function AdminTopNavbar({
  isDarkMode,
  onToggleDarkMode,
  pageTitle,
  ctaLabel = 'Create New Check-in',
  ctaTo = '/admin/create-checkin',
  ctaIcon: CtaIcon = Plus,
}) {
  const { displayName, role } = getStoredAdminProfile();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || 'A';
  const roleLabel = role === 'ADMIN' ? 'Admin' : role;

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    logoutAndRedirect(navigate, () => setIsProfileMenuOpen(false));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#050817]/95">
      <nav className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight text-slate-950 dark:text-white">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <AdminNotificationBell isDarkMode={isDarkMode} />
          <ThemeToggle
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
          <button
            type="button"
            onClick={() => navigate(ctaTo)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6366F1] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[#5855eb]"
          >
            <CtaIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{ctaLabel}</span>
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              aria-label="Open admin profile menu"
              aria-expanded={isProfileMenuOpen}
              onClick={() => setIsProfileMenuOpen((currentState) => !currentState)}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-1.5 py-1.5 text-slate-700 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
            >
              <div className="flex h-7 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-600 transition duration-150 group-hover:scale-105 dark:bg-indigo-500/20 dark:text-indigo-300">
                {avatarLabel}
              </div>
              <ChevronDown
                className={`mr-1 hidden h-4 w-4 transition duration-150 sm:block ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`absolute right-0 top-14 w-64 origin-top-right rounded-2xl border shadow-xl transition duration-150 ${
                isProfileMenuOpen
                  ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
                  : 'pointer-events-none -translate-y-2 scale-95 opacity-0'
              } ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-900 text-white shadow-slate-950/40'
                  : 'border-slate-200 bg-white text-slate-950 shadow-slate-900/10'
              }`}
            >
              <div className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {avatarLabel}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">
                      {displayName}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Role: 
                      </p>
                      <span className="inline-flex rounded-full bg-indigo-100 px-1 py-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 px-2 py-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-rose-600 dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-rose-300"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export function AdminPageLayout({
  isDarkMode,
  onToggleDarkMode,
  pageTitle,
  children,
  ctaLabel,
  ctaTo,
  ctaIcon,
}) {
  return (
    <div
      className={`min-h-screen bg-[#F6F7FF] text-slate-950 dark:bg-[#050817] dark:text-white ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      <AdminTopNavbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        pageTitle={pageTitle}
        ctaLabel={ctaLabel}
        ctaTo={ctaTo}
        ctaIcon={ctaIcon}
      />

      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <Sidebar  isDarkMode={isDarkMode}/>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function StateCard({ title, message, actionLabel, onAction, tone = 'default' }) {
  const toneClasses =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
      : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';

  return (
    <section className={`rounded-2xl border p-6 shadow-sm ${toneClasses}`}>
      <h2 className="text-base font-black">{title}</h2>
      <p className="mt-2 text-sm font-medium">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-black text-white transition hover:bg-[#5855eb]"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

export function InsightCard({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <h2 className="text-base font-black text-slate-950 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

export function EmptyStateBox({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-5 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, subtext, valueClassName = '', subtextClassName = '' }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>
      <div className="mt-3 flex items-end gap-2">
        <p className={`text-4xl font-black tracking-tight text-slate-950 dark:text-white ${valueClassName}`}>
          {value}
        </p>
        {subtext ? (
          <p className={`pb-1 text-xs font-bold text-indigo-600 dark:text-indigo-300 ${subtextClassName}`}>
            {subtext}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function StatusBadge({ status }) {
  const normalizedStatus = String(status || 'PENDING').toUpperCase();

  const styles =
    normalizedStatus === 'REVIEWED'
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${styles}`}
    >
      {normalizedStatus}
    </span>
  );
}

export function TableRow({ assignment, onAction }) {
  const employeeName =
    assignment?.user?.name ||
    assignment?.userId?.name ||
    assignment?.user?.email ||
    assignment?.userId?.email ||
    'Unknown Employee';
  const checkInTitle =
    assignment?.checkIn?.title || assignment?.checkInId?.title || 'Untitled Check-in';
  const status =
    assignment?.reviewStatus === 'REVIEWED' ? 'REVIEWED' : assignment?.statusLabel || 'PENDING';
  const actionLabel = status === 'REVIEWED' ? 'View' : 'Review';

  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] items-center gap-4 px-5 py-4 text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <div className="min-w-0">
        <p className="truncate font-black text-slate-950 dark:text-white">{employeeName}</p>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 font-medium text-slate-600 dark:text-slate-300">
          {checkInTitle}
        </p>
      </div>
      <div>
        <StatusBadge status={status} />
      </div>
      <div className="justify-self-end">
        <button
          type="button"
          onClick={() => onAction(assignment)}
          className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function useDashboardTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('landing-theme') === 'dark';
  });

  useEffect(() => {
    window.localStorage.setItem('landing-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode: () => setIsDarkMode((currentMode) => !currentMode),
  };
}
