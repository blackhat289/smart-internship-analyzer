import fs from 'fs/promises';
import { ApiError } from '../../utils/ApiError.js';

export async function uploadResumeService(file) {
  if (!file) {
    throw new ApiError(400, 'Resume file is required');
  }

  try {
    await fs.access(file.path);
  } catch (_error) {
    throw new ApiError(500, 'Uploaded file could not be found on disk');
  }

  return {
    originalFileName: file.originalname,
    storedFilePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
  };
}
