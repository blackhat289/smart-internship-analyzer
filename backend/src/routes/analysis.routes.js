import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  generateAnalysis,
  getAnalysisByUserId,
  getAnalysisReportById,
} from '../controllers/analysis.controller.js';

const router = Router();

router.post('/generate', authMiddleware, generateAnalysis);
router.get('/:userId', authMiddleware, getAnalysisByUserId);
router.get('/report/:analysisId', authMiddleware, getAnalysisReportById);

export default router;
