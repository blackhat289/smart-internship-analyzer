import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadResumeService } from '../services/resume/uploadResume.service.js';
import { resumeRepository } from '../repositories/resume.repository.js';

export async function uploadResume(req, res, next) {
  try {
    const data = await uploadResumeService({ userId: req.user.sub, file: req.file });
    res.status(201).json(new ApiResponse(201, 'Resume uploaded successfully', data));
  } catch (error) {
    next(error);
  }
}

export async function parseResume(req, res, next) {
  try {
    const resume = await resumeRepository.findByUserId(req.user.sub);
    res.json(new ApiResponse(200, 'Resume parsed successfully', { parsedText: resume?.parsedText || '' }));
  } catch (error) {
    next(error);
  }
}

export async function extractResumeData(req, res, next) {
  try {
    const resume = await resumeRepository.findByUserId(req.user.sub);
    res.json(new ApiResponse(200, 'Resume data extracted successfully', resume?.extractedData || {}));
  } catch (error) {
    next(error);
  }
}

export async function analyzeResume(req, res, next) {
  try {
    const resume = await resumeRepository.findByUserId(req.user.sub);
    res.json(
      new ApiResponse(200, 'Resume analysis prepared successfully', {
        parsedText: resume?.parsedText || '',
        extractedData: resume?.extractedData || {},
      })
    );
  } catch (error) {
    next(error);
  }
}
