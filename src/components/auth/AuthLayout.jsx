import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function AuthLayout({
  children,
  darkPreviewImage,
  lightPreviewImage,
  previewAlt,
  visualBadges = [],
  visualHeading,
  visualSubtitle,
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('landing-theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('landing-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const badgePositions = [
    'left-2 top-3 sm:left-[-7%] sm:top-[4%]',
    'right-0 bottom-3 sm:right-[-6%] sm:bottom-[4%]',
  ];

  return (
    <main
      className={`min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-[#080d1d] dark:text-white ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      <section className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-8 lg:px-10 lg:py-10">
          <div className="w-full max-w-md">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDarkMode((previous) => !previous)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition duration-200 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-[#0c1222] dark:text-slate-200"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <Link to="/" className="mb-8 block text-center">
                <img
                  src={isDarkMode ? "/images/optivis-logo-dark.png" : "/images/optivis-logo.png"}
                  alt="Optivis Logo"
                  className={isDarkMode ? "mx-auto h-9 w-auto" : "mx-auto h-12 w-auto"}
                />
              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Employee Growth &amp; Feedback
              </p>
            </Link>

            {children}
          </div>
        </div>

        <aside className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 px-6 py-12 text-center text-white dark:from-indigo-600 dark:via-violet-600 dark:to-purple-700 lg:px-12">
          <div className="absolute inset-0">
            <div className="absolute left-[-10%] top-[8%] h-52 w-52 rounded-full bg-white/12 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-8%] h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
          </div>

          <div className="relative mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center">
            <h2 className="max-w-lg text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              {visualHeading}
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-indigo-100">{visualSubtitle}</p>

            <div className="relative mt-10 w-full max-w-[560px] auth-image-enter">
              {visualBadges.map((badge, index) => {
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.id || `${index}-${String(badge.title)}`}
                    className={`auth-badge-float absolute z-10 hidden rounded-2xl border border-white/25 bg-white/[0.92] px-4 py-3 text-left text-slate-900 shadow-xl shadow-slate-900/15 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 dark:bg-white/95 sm:block ${
                      index === 1 ? 'auth-badge-delay' : ''
                    } ${badgePositions[index] || 'left-4 top-4'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Icon className="h-4 w-4" />
                      </span>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">{badge.title}</p>
                        {badge.subtitle ? (
                          <p className="mt-1 text-[11px] text-slate-500">{badge.subtitle}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-[28px] border border-white/25 bg-white/12 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.24)] backdrop-blur-sm sm:p-5">
                <img
                  src={isDarkMode ? darkPreviewImage : lightPreviewImage}
                  alt={previewAlt}
                  className="w-full rounded-2xl shadow-2xl transition duration-500 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default AuthLayout;
