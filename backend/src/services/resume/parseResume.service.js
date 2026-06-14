import fs from 'fs/promises';
import { createRequire } from 'module';
import { ApiError } from '../../utils/ApiError.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function parseResumeService(filePath) {
  if (!filePath) {
    throw new ApiError(400, 'Resume file path is required');
  }

  try {
    const pdfBuffer = await fs.readFile(filePath);
    const data = await pdfParse(pdfBuffer);
    const text = (data.text || '').replace(/\r/g, '').trim();

    if (!text) {
      throw new ApiError(
        400,
        'No readable text could be extracted from the PDF. If this is a scanned resume, please upload a text-based PDF.'
      );
    }

    return text;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, error?.message || 'Unable to parse the uploaded resume');
  }
}
