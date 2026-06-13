import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resumesUploadDir = path.resolve(__dirname, '../../uploads/resumes');

if (!fs.existsSync(resumesUploadDir)) {
  fs.mkdirSync(resumesUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumesUploadDir);
  },
  filename: (_req, file, cb) => {
    const safeOriginalName = path.basename(file.originalname).replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (!isPdfMime || !isPdfExt) {
    return cb(new ApiError(400, 'Only PDF files are allowed'));
  }

  cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const upload = multerUpload;

export function resumeUploadErrorHandler(error, _req, _res, next) {
  if (!error) return next();

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(413, 'File size exceeds 5 MB limit'));
    }
    return next(new ApiError(400, error.message || 'Upload failed'));
  }

  if (error instanceof ApiError) {
    return next(error);
  }

  return next(new ApiError(400, error.message || 'Invalid upload request'));
}
