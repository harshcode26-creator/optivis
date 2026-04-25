import { CirclePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AdminPageLayout, StateCard, useDashboardTheme } from '../components/admin/AdminLayout';
import api from '../services/api';
import { getUserFromToken } from '../utils/auth';

function CreateCheckIn() {
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('WEEKLY');
  const [questions, setQuestions] = useState(['']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const user = getUserFromToken();
  const { isDarkMode, toggleDarkMode } = useDashboardTheme();

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleQuestionChange = (questionIndex, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => (index === questionIndex ? value : question)),
    );
  };

  const handleAddQuestion = () => {
    setQuestions((currentQuestions) => [...currentQuestions, '']);
  };

  const handleRemoveQuestion = (questionIndex) => {
    setQuestions((currentQuestions) =>
      currentQuestions.length > 1
        ? currentQuestions.filter((_, index) => index !== questionIndex)
        : currentQuestions,
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await api.post('/checkins/create', {
        title,
        period,
        questions: questions.filter((question) => question.trim()),
      });

      setSuccessMessage('Check-in created successfully.');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 700);
    } catch (requestError) {
      setError(requestError.message || 'Unable to create check-in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageLayout
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      pageTitle="Create Check-in"
      ctaLabel="View Check-ins"
      ctaTo="/admin/check-ins"
      ctaIcon={CirclePlus}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-black text-slate-950 dark:text-white">
            New Check-in
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create a weekly or monthly check-in for everyone in the workspace.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
              <label className="block">
                <span className="text-sm font-black text-slate-950 dark:text-white">Title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Weekly Team Reflection"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-slate-950 dark:text-white">Period</span>
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-indigo-300 focus:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-slate-950"
                >
                  <option value="WEEKLY">WEEKLY</option>
                  <option value="MONTHLY">MONTHLY</option>
                </select>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    Questions
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Keep prompts concise and answerable within a weekly check-in flow.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-black text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                >
                  <CirclePlus className="h-4 w-4" />
                  Add Question
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {questions.map((question, index) => (
                  <div
                    key={`${index + 1}`}
                    className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-indigo-600 dark:bg-slate-900 dark:text-indigo-300">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={question}
                      onChange={(event) => handleQuestionChange(index, event.target.value)}
                      placeholder="What went well this week?"
                      required
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      disabled={questions.length === 1}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>
            ) : null}

            {successMessage ? (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-[#6366F1] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition hover:bg-[#5855eb] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating Check-in...' : 'Create Check-in'}
            </button>
          </form>
        </section>

        <StateCard
          title="Publishing Notes"
          message="Each new check-in creates assignments for every employee in the current workspace."
        />
      </div>
    </AdminPageLayout>
  );
}

export default CreateCheckIn;
