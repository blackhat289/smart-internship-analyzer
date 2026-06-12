import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '../../utils/ApiError.js';
import { userRepository } from '../../repositories/user.repository.js';

export async function resetPasswordService({ token, password }) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await userRepository.findByResetToken(hashedToken);
  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await userRepository.updateById(user._id, {
    passwordHash,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  return { message: 'Password reset successfully' };
}
