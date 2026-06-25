import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  generateAnalysis,
  getAnalysisByUserId,
} from '../controllers/analysis.controller.js';

const router = Router();

router.post('/generate', authMiddleware, generateAnalysis);
router.get('/:userId', authMiddleware, getAnalysisByUserId);

export default router;
