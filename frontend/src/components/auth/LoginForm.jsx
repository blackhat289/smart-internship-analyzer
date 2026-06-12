import { useForm } from 'react-hook-form';
import Button from '../common/Button';
import Input from '../common/Input';

export default function LoginForm({ onSubmit }) {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Email" {...register('email')} />
      <Input placeholder="Password" type="password" {...register('password')} />
      <Button type="submit" className="w-full">Login</Button>
    </form>
  );
}
