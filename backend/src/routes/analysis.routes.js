import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { calculateReadinessScore, analyzeSkillGap, analyzeStrengths } from '../controllers/analysis.controller.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { analyzeResumeSchema } from '../validators/resume.validator.js';

const router = Router();
router.get('/readiness-score', authMiddleware, calculateReadinessScore);
router.post('/skill-gap', authMiddleware, validationMiddleware(analyzeResumeSchema), analyzeSkillGap);
router.get('/strengths', authMiddleware, analyzeStrengths);
export default router;
