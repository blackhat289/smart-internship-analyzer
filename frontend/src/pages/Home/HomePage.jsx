import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';

const steps = [
  'Create Account',
  'Upload Resume',
  'AI Analysis',
  'Gap Detection',
  'Recommendations',
  'Readiness Score',
  'Download Report',
];

function Field({ label, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[color:var(--color-text)]">{label}</span>
      <Input {...props} />
    </label>
  );
}

function getErrorMessage(error, fallback) {
  if (typeof error === 'string') return error;
  return error?.message || fallback;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setLoading(true);
      await authService.login({
        email: form.get('email'),
        password: form.get('password'),
      });
      toast.success('Logged in successfully.');
      navigate('/resume-analysis');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  const register = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        name: form.get('name'),
        email: form.get('email'),
        password,
      });
      toast.success('Account created successfully.');
      navigate('/resume-analysis');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[color:var(--color-text)]">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-6 lg:py-14">
        <header className="mx-auto w-full max-w-3xl text-center">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">SkillSprint</h1>
          <p className="mt-4 text-lg font-semibold text-[color:var(--color-primary)]">
            Analyze. Improve. Get Internship Ready.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-text-secondary)] sm:text-base">
            AI-powered internship readiness assessment for students.
          </p>
        </header>

        <section className="mx-auto mt-8 w-full max-w-[450px]">
          <Card className="border-[color:var(--color-border)] bg-white p-5 sm:p-6">
            <div className="rounded-2xl border border-[color:var(--color-primary)] bg-white p-4 shadow-sm">
              <div className="flex rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tab === 'login'
                      ? 'bg-[color:var(--color-primary)] text-white shadow-sm'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  aria-pressed={tab === 'login'}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    tab === 'register'
                      ? 'bg-[color:var(--color-primary)] text-white shadow-sm'
                      : 'bg-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  aria-pressed={tab === 'register'}
                >
                  Register
                </button>
              </div>

              <div className="mt-5">
                {tab === 'login' ? (
                  <form onSubmit={login} className="space-y-4">
                    <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
                    <Field
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={register} className="space-y-4">
                    <Field label="Full Name" name="name" type="text" placeholder="Your full name" autoComplete="name" />
                    <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
                    <Field
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      autoComplete="new-password"
                    />
                    <Field
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Registering...' : 'Register'}
                    </Button>
                  </form>
                )}

                <p className="mt-4 text-center text-sm text-[color:var(--color-text-secondary)]">
                  Turn your resume into internship opportunities with AI-powered insights.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mx-auto mt-8 w-full max-w-5xl">
          <div className="rounded-[2rem] border border-[#17395f] bg-[#0F2D52] px-5 py-6 text-white shadow-[0_30px_80px_-45px_rgba(15,45,82,0.8)] sm:px-8 sm:py-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                Your Journey to Internship Readiness
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                Transform your resume into actionable career insights using AI.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
                A simple timeline that shows how the platform turns a resume into a polished readiness report.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-sm font-bold text-[#0F2D52]">
                    {index + 1}
                  </div>
                  <div className="pt-1 text-sm font-medium leading-6 text-white/90">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
