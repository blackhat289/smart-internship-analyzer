import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import { authService } from '../../services/authService';
import ResetPasswordForm from '../../components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const onSubmit = async ({ password, confirmPassword }) => {
    if (!token) {
      toast.error('Reset token is missing or invalid.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    await authService.resetPassword(token, password, confirmPassword);
    toast.success('Password updated successfully.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-[color:var(--color-border)] bg-white p-6">
          <h1 className="mb-2 text-2xl font-black">Reset Password</h1>
          <p className="mb-6 text-sm text-[color:var(--color-text-secondary)]">Enter your new password below.</p>
          <ResetPasswordForm onSubmit={onSubmit} />
        </Card>
      </div>
    </div>
  );
}
