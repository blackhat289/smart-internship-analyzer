import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload, resumeUploadErrorHandler } from '../middlewares/upload.middleware.js';
import { uploadResume } from '../controllers/resume.controller.js';

const router = Router();

router.post(
  '/upload',
  authMiddleware,
  upload.single('resume'),
  resumeUploadErrorHandler,
  uploadResume
);

export default router;
