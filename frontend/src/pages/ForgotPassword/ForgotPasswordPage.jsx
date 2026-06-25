import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import { authService } from '../../services/authService';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import Button from '../../components/common/Button';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [devResetUrl, setDevResetUrl] = useState('');

  const onSubmit = async ({ email }) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response && response.resetUrl) {
        setDevResetUrl(response.resetUrl);
        toast.success('Reset link generated successfully (Dev Mode).');
      } else {
        toast.success('Reset link sent if the email exists.');
        navigate('/');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send password reset request.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-10 flex items-center justify-center">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-[color:var(--color-border)] bg-white p-8 rounded-3xl shadow-xl transition-all duration-300">
          <h1 className="mb-2 text-2xl font-black text-slate-800">Forgot Password</h1>
          
          {devResetUrl ? (
            <div className="mt-4 space-y-6">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-sm text-blue-900 leading-relaxed shadow-inner">
                <span className="font-bold block text-blue-950 mb-1">🛠️ Developer Local Sandbox</span>
                Since SMTP credentials are not configured or email delivery failed, the backend generated a sandbox reset link. You can use it below to update the account password:
                <a 
                  href={devResetUrl}
                  className="mt-4 block text-center font-bold bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
                >
                  Proceed to Reset Password
                </a>
              </div>
              <div className="flex justify-center">
                <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition duration-200">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-[color:var(--color-text-secondary)]">We'll email you a reset link.</p>
              <ForgotPasswordForm onSubmit={onSubmit} />
              <div className="mt-6 text-center">
                <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition duration-200">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
