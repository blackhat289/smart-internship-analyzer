import { resumeRepository } from '../../repositories/resume.repository.js';
import { parseResumeService } from './parseResume.service.js';
import { extractResumeDataService } from './extractResumeData.service.js';

export async function uploadResumeService({ userId, file }) {
  const parsedText = await parseResumeService(file.path);
  const extractedData = await extractResumeDataService(parsedText);
  return resumeRepository.create({
    userId,
    originalName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    parsedText,
    extractedData,
    status: 'parsed',
  });
}
