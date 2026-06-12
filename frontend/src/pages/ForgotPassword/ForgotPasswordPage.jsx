import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import { authService } from '../../services/authService';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const onSubmit = async ({ email }) => {
    await authService.forgotPassword(email);
    toast.success('Reset link sent if the email exists.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Card className="border-[color:var(--color-border)] bg-white p-6">
          <h1 className="mb-2 text-2xl font-black">Forgot Password</h1>
          <p className="mb-6 text-sm text-[color:var(--color-text-secondary)]">We'll email you a reset link.</p>
          <ForgotPasswordForm onSubmit={onSubmit} />
        </Card>
      </div>
    </div>
  );
}
