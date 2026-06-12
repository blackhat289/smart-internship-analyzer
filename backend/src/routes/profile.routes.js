import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { updateProfileSchema } from '../validators/profile.validator.js';

const router = Router();
router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, validationMiddleware(updateProfileSchema), updateProfile);
export default router;
