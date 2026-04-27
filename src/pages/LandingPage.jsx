import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  Minus,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminDashboardDark from '../assets/adminDashboard-dark.png';
import adminDashboardLight from '../assets/adminDashboard-light.png';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#steps' },
  { label: 'FAQ', href: '#faq' },
];

const features = [
  {
    icon: CalendarCheck,
    title: 'Weekly Check-ins',
    description:
      'Automated prompts that capture team sentiment and progress without interrupting deep work.',
  },
  {
    icon: AlertTriangle,
    title: 'Blocker Detection',
    description:
      'Identify hurdles early with visual flags and clear manager cues when the team is stuck.',
  },
  {
    icon: LayoutDashboard,
    title: 'Insights Dashboard',
    description:
      'Aggregated data on team health, velocity, and focus areas in one clean view.',
  },
  {
    icon: Sparkles,
    title: 'AI Summaries',
    description:
      'Get the signal from the noise with automated weekly wrap-ups and action items.',
  },
];

const steps = [
  {
    title: 'Create Workspace',
    description: "Set up your private instance and define your team's core goals.",
  },
  {
    title: 'Invite Team',
    description: 'Import your roster from Slack, Google, or via direct email link.',
  },
  {
    title: 'Track & Improve',
    description: 'Watch patterns emerge and lead with confidence based on data.',
  },
];

const faqs = [
  {
    question: 'What is this platform used for?',
    answer:
      'It helps teams run structured weekly check-ins, track progress, and surface blockers without unnecessary meetings.',
  },
  {
    question: 'Who is it best suited for?',
    answer:
      "It's ideal for startups and teams that want better visibility into work without adding heavy processes.",
  },
  {
    question: 'How do check-ins work?',
    answer:
      'Managers create questions, and employees submit weekly updates. All responses are organized for easy review.',
  },
  {
    question: 'How are blockers identified?',
    answer:
      'The system analyzes responses to highlight common issues and delays so managers can take action quickly.',
  },
  {
    question: 'What insights does it provide?',
    answer:
      'You get team activity trends, blocker summaries, sentiment signals, and quick AI-generated summaries.',
  },
  {
    question: 'How do I invite my team?',
    answer:
      'Share your workspace link and join code. Team members can join and start submitting updates in minutes.',
  },
];

function Navbar({ isDarkMode, onToggleDarkMode }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-[#050817]/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="shrink-0 text-base font-extrabold tracking-tight text-slate-950 dark:text-white"
        >
          <img
            src={isDarkMode ? "/images/optivis-logo-dark.png" : "/images/optivis-logo.png"}
            alt="Optivis Logo"
            className={isDarkMode ? "h-8 w-auto" : "h-10 w-auto"}
          />
        </button>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-700 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
          >
            Login
          </button>
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/create-workspace')}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Create Workspace
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero({ isDarkMode }) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden bg-[#f8fafc] px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8 dark:bg-[#050817]">
      <div className="mx-auto max-w-6xl text-center">
        {/* <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Zap className="h-3.5 w-3.5" />
          Version 2.0 is now live
        </div> */}

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
          Understand Your Team.{' '}
          <span className="text-indigo-600 dark:text-indigo-400">Every Week.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-300">
          Simple check-ins, powerful insights, and smarter teams all in one
          place. Precision management for modern engineering teams.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/create-workspace')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 transition hover:bg-indigo-500 sm:w-auto"
          >
            Create Workspace
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/join')}
            className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          >
            Join Workspace
          </button>
        </div>

        <div className="mx-auto mt-14 max-w-5xl">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:border-indigo-500/25 dark:bg-slate-900/60 dark:shadow-indigo-700/20">
            
            <img
              src={isDarkMode ? adminDashboardDark : adminDashboardLight}
              alt="Dashboard Preview"
              className="w-full rounded-lg shadow-xl transition duration-500 hover:scale-[1.01]"
            />

          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8 dark:bg-[#050817]">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Precision-engineered features
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
            Everything you need to keep your team aligned, productive, and
            happy without the overhead.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-indigo-950/10 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:hover:shadow-indigo-950/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-8 text-lg font-black text-slate-950 dark:text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Insights() {
  return (
    <section className="bg-indigo-50/70 px-4 py-20 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-indigo-500 dark:text-indigo-400">
            Team Pulse
          </p>
          <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            See the big picture, without the small talk.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Stop guessing how your team is doing. Our high-fidelity dashboards
            turn qualitative feedback into quantitative growth metrics.
          </p>
          <ul className="mt-8 space-y-4">
            {['Real-time sentiment', 'Weekly engagement', 'Blocker alerts'].map(
              (item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-7 dark:border-slate-700 dark:bg-slate-900 dark:shadow-slate-950/30">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-black text-slate-950 dark:text-white">
              Team Status Summary
            </h3>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              Week of Oct 24
            </span>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-3 flex-1 rounded-full bg-indigo-100 dark:bg-slate-800">
              <div className="h-full w-[85%] rounded-full bg-indigo-600" />
            </div>
            <span className="text-sm font-black text-slate-800 dark:text-white">85% Health</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['Blockers', '12', 'text-rose-500'],
              ['Wins', '48', 'text-indigo-600'],
              ['Sentiment', '4.8', 'text-slate-950'],
            ].map(([label, value, color]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4 dark:bg-[#050817]">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{label}</p>
                <p className={`mt-2 text-xl font-black ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <div className="flex items-center gap-2 text-sm font-black text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-4 w-4" />
              AI Summary
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              The team is focused and shipping well. Morale is high, but three
              members reported dependency blockers that need attention.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Steps() {
  return (
    <section id="steps" className="bg-white px-4 py-20 sm:px-6 lg:px-8 dark:bg-[#050817]">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
          Get started in minutes
        </h2>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <article key={step.title} className="relative px-4">
              {index > 0 && (
                <div className="absolute right-1/2 top-6 hidden h-px w-full bg-slate-200 md:block dark:bg-slate-700" />
              )}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-xl border-2 border-indigo-400 bg-white text-lg font-black text-indigo-600 dark:bg-slate-900 dark:text-indigo-300 dark:shadow-lg dark:shadow-indigo-700/20">
                {index + 1}
              </div>
              <h3 className="mt-7 text-base font-black text-slate-950 dark:text-white">
                {step.title}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const navigate = useNavigate();

  return (
    <section className="bg-indigo-50/60 px-4 py-20 sm:px-6 lg:px-8 dark:bg-[#050817]">
      <div className="mx-auto max-w-5xl rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-14 text-center text-white shadow-2xl shadow-indigo-900/20 sm:px-10">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Start building a better team today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-semibold leading-6 text-indigo-100 sm:text-base">
          Join thousands of teams using Optivis to scale their culture and
          performance.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate('/create-workspace')}
            className="rounded-md bg-white px-6 py-3 text-sm font-black text-indigo-600 shadow-sm transition hover:bg-indigo-50"
          >
            Create Workspace
          </button>
          <button
            type="button"
            className="rounded-md border border-white/25 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10"
          >
            Book a Demo
          </button>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(0);

  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 lg:px-8 dark:bg-[#050817]">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-4xl font-black tracking-tight text-[#21103f] sm:text-5xl lg:text-6xl dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="mt-14 divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, index) => {
            const isOpen = openQuestion === index;

            return (
            <div
              key={faq.question}
              className={
                isOpen
                  ? 'rounded-md border border-indigo-500/40 px-5 py-6 dark:border-indigo-400/50'
                  : ''
              }
            >
              <button
                type="button"
                onClick={() => setOpenQuestion(isOpen ? null : index)}
                className={`flex w-full items-center justify-between gap-6 text-left transition hover:text-indigo-600 dark:hover:text-indigo-300 ${
                  isOpen ? 'pb-5' : 'py-7 sm:py-9'
                }`}
              >
                <span className="text-lg font-bold leading-7 text-slate-600 sm:text-2xl dark:text-slate-300">
                  {faq.question}
                </span>
                {isOpen ? (
                  <Minus className="h-5 w-5 shrink-0 text-slate-950 dark:text-white" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-slate-950 dark:text-white" />
                )}
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`max-w-5xl text-lg leading-8 text-slate-600 transition-opacity duration-300 sm:text-2xl dark:text-slate-300 ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer({ isDarkMode }) {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-[#050817]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <img
            src={isDarkMode ? "/images/optivis-logo-dark.png" : "/images/optivis-logo.png"}
            alt="Optivis Logo"
            className="h-8 w-auto"
          />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Optivis helps teams track performance and gain clarity every week.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-7 gap-y-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {['Privacy Policy', 'Terms', 'Contact', 'Twitter', 'LinkedIn'].map(
            (link) => (
              <a key={link} href="#faq" className="transition hover:text-indigo-600 dark:hover:text-indigo-300">
                {link}
              </a>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('landing-theme') === 'dark';
  });

  useEffect(() => {
    window.localStorage.setItem('landing-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen bg-white text-slate-950 ${isDarkMode ? 'dark' : ''}`}>
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((currentMode) => !currentMode)}
      />
      <main>
        <Hero isDarkMode={isDarkMode} />
        <Features />
        <Insights />
        <Steps />
        <CTA />
        <FAQ />
      </main>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default LandingPage;
