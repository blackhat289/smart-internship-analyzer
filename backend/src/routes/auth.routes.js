import { Router } from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';

const router = Router();
router.post('/register', validationMiddleware(registerSchema), register);
router.post('/login', validationMiddleware(loginSchema), login);
router.post('/forgot-password', validationMiddleware(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validationMiddleware(resetPasswordSchema), resetPassword);
export default router;
