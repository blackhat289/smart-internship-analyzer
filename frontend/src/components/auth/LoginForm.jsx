import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';

export default function LoginForm({ onSubmit, loading = false }) {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Email" {...register('email')} />
      <Input placeholder="Password" type="password" {...register('password')} />
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
  );
}
