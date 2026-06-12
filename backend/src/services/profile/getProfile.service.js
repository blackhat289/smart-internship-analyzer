import { ApiError } from '../../utils/ApiError.js';
import { userRepository } from '../../repositories/user.repository.js';

export async function getProfileService(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new ApiError(404, 'Profile not found');
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}
