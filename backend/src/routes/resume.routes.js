import { Router } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadResume, parseResume, extractResumeData, analyzeResume } from '../controllers/resume.controller.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { analyzeResumeSchema } from '../validators/resume.validator.js';

const router = Router();
router.post('/upload', authMiddleware, uploadMiddleware.single('resume'), uploadResume);
router.get('/parse', authMiddleware, parseResume);
router.get('/extract', authMiddleware, extractResumeData);
router.post('/analyze', authMiddleware, validationMiddleware(analyzeResumeSchema), analyzeResume);
export default router;
