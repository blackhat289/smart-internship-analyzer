import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  generateAnalysis,
  getAnalysisByUserId,
  getAnalysisReportById,
} from '../controllers/analysis.controller.js';

const router = Router();

router.post('/generate', authMiddleware, generateAnalysis);
router.get('/report/:analysisId', authMiddleware, getAnalysisReportById);
router.get('/:userId', authMiddleware, getAnalysisByUserId);

export default router;
