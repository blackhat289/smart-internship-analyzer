import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload, resumeUploadErrorHandler } from '../middlewares/upload.middleware.js';
import { uploadResume, getLatestResume } from '../controllers/resume.controller.js';

const router = Router();

router.post(
  '/upload',
  authMiddleware,
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  resumeUploadErrorHandler,
  uploadResume
);

router.get('/latest', authMiddleware, getLatestResume);

export default router;
