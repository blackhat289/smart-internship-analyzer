import { ApiResponse } from '../utils/ApiResponse.js';
import { getProfileService } from '../services/profile/getProfile.service.js';
import { updateProfileService } from '../services/profile/updateProfile.service.js';

export async function getProfile(req, res, next) {
  try {
    const data = await getProfileService(req.user.sub);
    res.json(new ApiResponse(200, 'Profile fetched successfully', data));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const data = await updateProfileService(req.user.sub, req.body);
    res.json(new ApiResponse(200, 'Profile updated successfully', data));
  } catch (error) {
    next(error);
  }
}
