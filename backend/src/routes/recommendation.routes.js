import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { generateRecommendation } from '../controllers/recommendation.controller.js';

const router = Router();
router.get('/', authMiddleware, generateRecommendation);
export default router;
