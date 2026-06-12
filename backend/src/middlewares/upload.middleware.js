import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/resumes'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${path.basename(file.originalname)}`),
});

export const uploadMiddleware = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});
