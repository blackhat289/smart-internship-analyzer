import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BadgeCheck, FileUp, Sparkles, Search, Lightbulb, ChartNoAxesCombined, Download } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';
import useAuth from '../../hooks/useAuth';

const steps = [
  { title: 'Create Account', icon: BadgeCheck, description: 'Sign up and create your account.' },
  { title: 'Upload Resume', icon: FileUp, description: 'Upload your resume in PDF format.' },
  { title: 'AI Analysis', icon: Sparkles, description: 'Our AI analyzes your skills and experience.' },
  { title: 'Gap Detection', icon: Search, description: 'We identify skill gaps for your target role.' },
  { title: 'Recommendations', icon: Lightbulb, description: 'Get personalized learning and improvement tips.' },
  { title: 'Readiness Score', icon: ChartNoAxesCombined, description: 'View your internship readiness score.' },
  { title: 'Download Report', icon: Download, description: 'Download your complete readiness report.' },
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
  const { login: setAuthState } = useAuth();
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setLoading(true);
      const authData = await authService.login({
        email: String(form.get('email') || '').trim(),
        password: form.get('password'),
      });
      setAuthState(authData);
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
      const authData = await authService.register({
        name: String(form.get('name') || '').trim(),
        email: String(form.get('email') || '').trim(),
        password,
      });
      setAuthState(authData);
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
                    <div className="pt-1 text-center">
                      <Link
                        to="/forgot-password"
                        className="inline-flex rounded-full border border-slate-900/35 bg-[color:var(--color-primary)]/8 px-3 py-1.5 text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-primary)]/12 hover:border-slate-900/55"
                      >
                        Forgot Password?
                      </Link>
                    </div>
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
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,31,58,0.94),rgba(8,23,44,0.98))] px-5 py-6 text-white shadow-[0_30px_80px_-45px_rgba(15,45,82,0.8)] sm:px-8 sm:py-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(68,120,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(212,160,23,0.12),transparent_32%)]" />
            <div className="relative max-w-2xl">
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

            <div className="relative mt-8">
              <div className="absolute left-6 right-6 top-7 hidden h-px overflow-hidden md:block">
                <motion.div
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  whileInView={reduceMotion ? undefined : { scaleX: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="h-px origin-left bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-7 md:items-stretch md:gap-3">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isFirst = index === 0;

                  return (
                    <motion.div
                      key={step.title}
                      initial={reduceMotion ? false : { opacity: 0, y: 26 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
                      whileHover={reduceMotion ? undefined : { scale: 1.03, y: -4 }}
                      className="relative h-full"
                    >
                      <div className="absolute left-6 top-7 hidden h-1.5 w-full bg-gradient-to-r from-cyan-300/70 via-fuchsia-400/40 to-transparent md:block" />
                      <div className="absolute left-6 top-7 hidden h-1.5 w-1/2 bg-gradient-to-r from-[color:var(--color-accent)] to-transparent opacity-70 md:block" />

                      <div className="relative flex h-full min-h-[260px] flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="relative">
                            <motion.div
                              animate={reduceMotion ? undefined : { opacity: [0.75, 1, 0.75], scale: [1, 1.08, 1] }}
                              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                              className={`absolute inset-0 rounded-full blur-md ${
                                isFirst ? 'bg-[color:var(--color-accent)]/40' : 'bg-cyan-400/25'
                              }`}
                            />
                            <div
                              className={`relative flex h-11 w-11 items-center justify-center rounded-full border text-sm font-black shadow-[0_0_24px_rgba(255,255,255,0.08)] ${
                                isFirst
                                  ? 'border-[color:var(--color-accent)]/60 bg-[color:var(--color-accent)] text-[#091a33]'
                                  : 'border-white/15 bg-[#0d2140] text-white'
                              }`}
                            >
                              {index + 1}
                            </div>
                          </div>

                          {isFirst ? (
                            <span className="rounded-full border border-[color:var(--color-accent)]/35 bg-[color:var(--color-accent)]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                              Start Here
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                              Step {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="mb-3 flex items-center gap-2 text-white/85">
                          <Icon className={isFirst ? 'h-4 w-4 text-[color:var(--color-accent)]' : 'h-4 w-4 text-cyan-300'} />
                          <h3 className="text-sm font-bold">{step.title}</h3>
                        </div>

                        <p className="text-sm leading-6 text-white/70">{step.description}</p>

                        {!isFirst ? (
                          <div className="mt-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                            <ArrowRight className="h-3.5 w-3.5" />
                            Continue
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
