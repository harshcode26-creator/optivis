import {
  ArrowRight,
  CheckCircle2,
  Copy,
  LayoutDashboard,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminDashboardDark from '../assets/adminDashboard-dark.png';
import adminDashboardLight from '../assets/adminDashboard-light.png';
import AuthButton from '../components/auth/AuthButton';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import api from '../services/api';

function CreateWorkspace() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setWorkspaceInfo(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/create-workspace', {
        name,
        email,
        password,
        workspaceName,
      });

      localStorage.setItem('token', response.data.token);

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('name', response.data.user.name || '');
      }

      const workspaceSlug = response.data.workspaceSlug;
      const inviteLink = `${window.location.origin}/join?workspace=${workspaceSlug}`;

      setWorkspaceInfo({
        inviteLink,
        joinCode: response.data.joinCode,
      });
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        'Unable to create workspace right now';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text, type) => {
  navigator.clipboard.writeText(text);
  setCopiedField(type);

  setTimeout(() => {
    setCopiedField(null);
  }, 1500);
};

  return (
    <>
      <AuthLayout
        darkPreviewImage={adminDashboardDark}
        lightPreviewImage={adminDashboardLight}
        previewAlt="Workspace dashboard preview"
        visualHeading="Build a culture of feedback and growth."
        visualSubtitle="Create your workspace, invite your team, and start weekly check-ins."
        visualBadges={[
          {
            id: 'workspace-users',
            icon: Users,
            title: (
              <>
                <span>1 workspace created</span>
                <span className="mx-1 text-slate-400">&bull;</span>
                <span>2 users</span>
              </>
            ),
          },
          {
            id: 'workspace-checkins',
            icon: CheckCircle2,
            title: '7 check-ins completed',
            subtitle: 'This week',
          },
        ]}
      >
        <div className="auth-card-enter rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-white/10 dark:bg-[#11182b]/95 dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <h1 className="text-2xl font-black">Create your workspace</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Start managing your team check-ins in minutes.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <InputField
              id="workspace-name"
              name="name"
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              required
            />

            <InputField
              id="workspace-email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              required
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField
                id="workspace-password"
                name="password"
                label="Password"
                type="password"
                placeholder="Enter password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                showToggle
                showValue={showPassword}
                onToggleVisibility={() => setShowPassword((previous) => !previous)}
                required
              />

              <InputField
                id="workspace-confirm-password"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError('');
                }}
                showToggle
                showValue={showConfirmPassword}
                onToggleVisibility={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                required
              />
            </div>

            <InputField
              id="workspace-title"
              name="workspaceName"
              label="Workspace Name"
              type="text"
              placeholder="e.g. Acme Marketing"
              value={workspaceName}
              onChange={(event) => {
                setWorkspaceName(event.target.value);
                setError('');
              }}
              helperText="This will be your team's workspace name."
              highlight
              required
            />

            {error ? (
              <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <AuthButton
              type="submit"
              disabled={isSubmitting}
              trailingIcon={ArrowRight}
              className="mt-3"
            >
              {isSubmitting ? 'Creating workspace...' : 'Create Workspace'}
            </AuthButton>
          </form>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] tracking-widest text-slate-500">OR</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="space-y-2 pt-1 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
              >
                Login
              </Link>
            </p>
            <Link
              to="/join"
              className="inline-block font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Join an existing workspace
            </Link>
          </div>
        </div>
      </AuthLayout>

      {workspaceInfo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 backdrop-blur-lg">

          <div className="w-full max-w-md scale-100 animate-[fadeIn_0.25s_ease] rounded-3xl border border-white/10 bg-white/90 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl dark:bg-[#11182b]/95">

            {/* HEADER */}
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Workspace Created 🎉
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Share this with your team
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <div className="mt-6 space-y-4">

              {/* INVITE LINK */}
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  Invite Link
                </p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-slate-800 dark:text-slate-200">
                    {workspaceInfo.inviteLink}
                  </p>

                  <div className="relative">
                    {copiedField === "link" && (
                      <span className="absolute -top-7 right-0 rounded-md bg-black px-2 py-1 text-xs text-white shadow-md animate-[fadeIn_0.2s_ease]">
                        Copied
                      </span>
                    )}

                    <button
                      onClick={() => handleCopy(workspaceInfo.inviteLink, "link")}
                      className="rounded-md p-2 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                    >
                      <Copy className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* JOIN CODE */}
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] uppercase tracking-widest text-slate-500">
                  Join Code
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-bold tracking-widest text-slate-900 dark:text-white">
                    {workspaceInfo.joinCode}
                  </p>

                  <div className="relative">
                    {copiedField === "code" && (
                      <span className="absolute -top-7 right-0 rounded-md bg-black px-2 py-1 text-xs text-white shadow-md animate-[fadeIn_0.2s_ease]">
                        Copied
                      </span>
                    )}

                    <button
                      onClick={() => handleCopy(workspaceInfo.joinCode, "code")}
                      className="rounded-md p-2 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                    >
                      <Copy className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setWorkspaceInfo(null)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Close
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 py-2 font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                Go Dashboard
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default CreateWorkspace;
