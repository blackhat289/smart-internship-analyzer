import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import Input from '../common/Input';

export default function ForgotPasswordForm({ onSubmit }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const submit = async (values) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input placeholder="Email" type="email" autoComplete="email" {...register('email')} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
      <p className="text-center text-xs text-slate-500">
        <Link to="/" className="font-semibold text-[color:var(--color-primary)] hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
