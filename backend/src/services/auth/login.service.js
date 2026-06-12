import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../config/jwt.js';
import { userRepository } from '../../repositories/user.repository.js';

export async function loginService({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ sub: user._id.toString(), email: user.email, name: user.name });
  return { user: { id: user._id, name: user.name, email: user.email }, token };
}
