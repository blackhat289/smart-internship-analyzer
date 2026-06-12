import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';

export default function ResetPasswordForm({ onSubmit }) {
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
      <Input placeholder="New password" type="password" autoComplete="new-password" {...register('password')} />
      <Input
        placeholder="Confirm new password"
        type="password"
        autoComplete="new-password"
        {...register('confirmPassword')}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Updating...' : 'Reset Password'}
      </Button>
    </form>
  );
}
