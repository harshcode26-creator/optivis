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

  return (
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

        {workspaceInfo ? (
          <div className="mt-6 animate-[fadeIn_0.4s_ease] rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:bg-emerald-400/5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </span>

              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Workspace created successfully
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Share the invite details below with your team.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Invite Link
                </p>
                <p className="mt-2 break-all text-sm text-slate-700 dark:text-slate-200">
                  {workspaceInfo.inviteLink}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Join Code
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {workspaceInfo.joinCode}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AuthButton
                  type="button"
                  variant="secondary"
                  trailingIcon={Copy}
                  onClick={() => navigator.clipboard.writeText(workspaceInfo.inviteLink)}
                >
                  Copy Invite Link
                </AuthButton>
                <AuthButton
                  type="button"
                  variant="secondary"
                  trailingIcon={LayoutDashboard}
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </AuthButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
}

export default CreateWorkspace;
