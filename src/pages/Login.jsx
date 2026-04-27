import { Eye, EyeOff, Lock, Mail, TrendingUp, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginPreviewDark from '../assets/login-preview-dark.png';
import loginPreviewLight from '../assets/login-preview-light.png';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

function Login() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('landing-theme') === 'dark';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('landing-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('landing-theme');
    if (stored) {
      setIsDarkMode(stored === 'dark');
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('name', user.name || '');
      }

      const role = user?.role || getUserFromToken()?.role;
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (requestError) {
        const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        'Invalid email or password';

        setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
          html,
          body,
          #root {
            height: 100%;
            overflow: hidden;
          }
        `}
      </style>

      <main className={`h-screen bg-white text-slate-900 dark:bg-[#080d1d] dark:text-white ${isDarkMode ? 'dark' : ''}`}>
        <section className="mx-auto grid h-full max-w-[1400px] grid-cols-1 lg:grid-cols-2 transition-colors duration-300">

          {/* LEFT SIDE */}
          <div className="flex items-center justify-center px-6 lg:px-10">
            <div className="w-full max-w-md space-y-2">

              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-[#0c1222] dark:text-slate-200"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* LOGO */}
              <div className="mb-8 text-center">
                <img
                  src={isDarkMode ? "/images/optivis-logo-dark.png" : "/images/optivis-logo.png"}
                  alt="Optivis Logo"
                  className={isDarkMode ? "mx-auto h-9 w-auto" : "mx-auto h-12 w-auto"}
                />
                <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Employee Growth & Feedback
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-white/10 dark:bg-[#11182b]">

                <h1 className="text-2xl font-black">Welcome back</h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Sign in to continue managing your team check-ins.
                </p>

                {/* EMAIL */}
                <div className="mt-5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-black outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-[#0c1222] dark:text-white"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    
                  />
                </div>

                {/* PASSWORD */}
                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-black outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-[#0c1222] dark:text-white"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                  />
                </div>

                {error && (
                  <p className="mt-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}

                {/* LOGIN BTN */}
                <button 
                  type='submit' 
                  disabled={isSubmitting}
                  className="mt-5 h-12 w-full rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 font-bold hover:from-indigo-400 hover:to-purple-400"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>

                {/* DIVIDER */}
                <div className="my-5 flex items-center gap-4">
                  <span className="h-px flex-1 bg-slate-700" />
                  <span className="text-[10px] tracking-widest text-slate-500">OR</span>
                  <span className="h-px flex-1 bg-slate-700" />
                </div>

                {/* BUTTONS */}
                <div className="space-y-3">
                  <button
                    type="button"
                    className="h-11 w-full rounded-md border border-slate-700 hover:border-indigo-500"
                    onClick={() => navigate('/create-workspace')}
                  >
                    Create Workspace
                  </button>
                  <button 
                    type="button" 
                    className="h-11 w-full rounded-md border border-slate-700 hover:border-indigo-500"
                    onClick={() => navigate('/join')}
                  >
                    Join Workspace
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <aside className="hidden lg:flex flex-col items-center justify-center py-10 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 px-12 text-center dark:from-indigo-600 dark:via-violet-600 dark:to-purple-700">

            <h2 className="max-w-xl text-3xl font-black leading-tight">
              Track team growth, feedback, and performance in one place.
            </h2>

            <p className="mt-4 max-w-md text-sm text-indigo-100">
              Stay aligned with your team through weekly check-ins and insights.
            </p>

            <img
              src={isDarkMode ? loginPreviewDark : loginPreviewLight}
              alt="preview"
              className="mt-10 w-full max-w-lg rounded-2xl shadow-2xl"
            />

            <div className="mt-8 flex gap-8 text-sm font-semibold">
              <p>7 check-ins completed</p>
              <p className="border-l border-white/30 pl-8">
                1 workspace created • 2 users
              </p>
            </div>

          </aside>

        </section>
      </main>
    </>
  );
}

export default Login;
