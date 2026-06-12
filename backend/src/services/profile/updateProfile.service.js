import { ApiError } from '../../utils/ApiError.js';
import { userRepository } from '../../repositories/user.repository.js';

export async function updateProfileService(userId, update) {
  const user = await userRepository.updateById(userId, update);
  if (!user) throw new ApiError(404, 'Profile not found');
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}
