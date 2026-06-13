import fs from 'fs/promises';
import { ApiError } from '../../utils/ApiError.js';

export async function parseResumeService(filePath) {
  if (!filePath) {
    throw new ApiError(400, 'Resume file path is required');
  }

  try {
    const pdfBuffer = await fs.readFile(filePath);
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: pdfBuffer });
    const data = await parser.getText();
    await parser.destroy().catch(() => {});
    const text = (data.text || '').replace(/\r/g, '').trim();

    if (!text) {
      throw new ApiError(
        400,
        'No readable text could be extracted from the PDF. If this is a scanned resume, please upload a text-based PDF.'
      );
    }

    return text;
  } catch (error) {
    console.error('Resume parsing failed:', error);
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, error?.message || 'Unable to parse the uploaded resume');
  }
}
