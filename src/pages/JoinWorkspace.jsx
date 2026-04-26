import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginPreviewDark from '../assets/login-preview-dark.png';
import loginPreviewLight from '../assets/login-preview-light.png';
import AuthButton from '../components/auth/AuthButton';
import AuthLayout from '../components/auth/AuthLayout';
import InputField from '../components/auth/InputField';
import api from '../services/api';

function JoinWorkspace() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [workspaceSlugFromUrl, setWorkspaceSlugFromUrl] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workspace = params.get('workspace');

    if (workspace) {
      setWorkspaceSlug(workspace);
      setWorkspaceSlugFromUrl(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const response = await api.post('/auth/join', {
      name,
      email,
      password,
      workspaceSlug,
      joinCode,
    });

    localStorage.setItem('token', response.data.token);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('name', response.data.user.name || '');
    }
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      darkPreviewImage={loginPreviewDark}
      lightPreviewImage={loginPreviewLight}
      previewAlt="Workspace dashboard preview"
      visualHeading="Join your team and start collaborating."
      visualSubtitle="Enter your workspace details and become part of your team's check-in flow."
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
        <h1 className="text-2xl font-black">Join your workspace</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Enter your invite details to access your team&apos;s check-ins.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <InputField
            id="join-name"
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
            id="join-email"
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
              id="join-password"
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
              id="join-confirm-password"
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
            id="join-workspace-slug"
            name="workspaceSlug"
            label="Workspace Slug"
            type="text"
            placeholder="e.g. acme-marketing"
            value={workspaceSlug}
            onChange={(event) => {
              setWorkspaceSlug(event.target.value);
              setError('');
            }}
            helperText="Enter the workspace identifier provided by your admin."
            highlight
            readOnly={workspaceSlugFromUrl}
            required
          />

          <InputField
            id="join-code"
            name="joinCode"
            label="Join Code"
            type="text"
            placeholder="Enter join code"
            value={joinCode}
            onChange={(event) => {
              setJoinCode(event.target.value);
              setError('');
            }}
            helperText="Use the invite code shared with you."
            required
          />

          {error ? (
            <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <AuthButton type="submit" trailingIcon={ArrowRight} className="mt-3">
            Join Workspace
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
            to="/create-workspace"
            className="inline-block font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Create a new workspace
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default JoinWorkspace;
