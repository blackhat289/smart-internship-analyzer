import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../config/jwt.js';
import { userRepository } from '../../repositories/user.repository.js';

export async function registerService({ name, email, password }) {
  const normalizedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  const existing = await userRepository.findByEmail(normalizedEmail);
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await userRepository.create({ name: normalizedName, email: normalizedEmail, passwordHash });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'Email already registered');
    }
    throw new ApiError(500, error?.message || 'Unable to register user');
  }
  const token = signToken({ sub: user._id.toString(), email: user.email, name: user.name });
  return { user: { id: user._id, name: user.name, email: user.email }, token };
}
