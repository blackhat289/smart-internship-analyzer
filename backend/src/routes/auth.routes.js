import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();
router.post('/register', validationMiddleware(registerSchema), register);
router.post('/login', validationMiddleware(loginSchema), login);
export default router;
