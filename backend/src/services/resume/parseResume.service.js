import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import { ApiError } from '../../utils/ApiError.js';

export async function parseResumeService(filePath) {
  if (!filePath) {
    throw new ApiError(400, 'Resume file path is required');
  }

  try {
    const pdfBuffer = await fs.readFile(filePath);
    const data = await pdfParse(pdfBuffer);
    const text = (data.text || '').replace(/\r/g, '').trim();

    if (!text) {
      throw new ApiError(400, 'Empty PDF: no text could be extracted');
    }

    return text;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, 'Corrupted PDF or unreadable file');
  }
}
