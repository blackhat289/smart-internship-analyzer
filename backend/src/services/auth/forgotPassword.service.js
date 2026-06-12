import crypto from 'crypto';
import { ApiError } from '../../utils/ApiError.js';
import { userRepository } from '../../repositories/user.repository.js';
import { sendPasswordResetEmail } from '../../integrations/email/mailClient.js';
import env from '../../config/env.js';

export async function forgotPasswordService({ email }) {
  const normalizedEmail = email?.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) return { message: 'If the email exists, a reset link has been sent.' };

  const token = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await userRepository.updateById(user._id, { resetPasswordToken, resetPasswordExpires });

  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
  try {
    await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });
  } catch (error) {
    throw new ApiError(500, error?.message || 'Unable to send password reset email');
  }

  return { message: 'If the email exists, a reset link has been sent.' };
}
