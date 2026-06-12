import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { generateRecommendation } from '../controllers/recommendation.controller.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { analyzeResumeSchema } from '../validators/resume.validator.js';

const router = Router();
router.post('/', authMiddleware, validationMiddleware(analyzeResumeSchema), generateRecommendation);
export default router;
