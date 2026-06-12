import { ApiResponse } from '../utils/ApiResponse.js';
import { loginService } from '../services/auth/login.service.js';
import { registerService } from '../services/auth/register.service.js';
import { forgotPasswordService } from '../services/auth/forgotPassword.service.js';
import { resetPasswordService } from '../services/auth/resetPassword.service.js';

export async function register(req, res, next) {
  try {
    const data = await registerService(req.body);
    res.status(201).json(new ApiResponse(201, 'Registered successfully', data));
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const data = await loginService(req.body);
    res.status(200).json(new ApiResponse(200, 'Logged in successfully', data));
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const data = await forgotPasswordService(req.body);
    res.status(200).json(new ApiResponse(200, data.message, data));
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const data = await resetPasswordService(req.body);
    res.status(200).json(new ApiResponse(200, data.message, data));
  } catch (error) {
    next(error);
  }
}
