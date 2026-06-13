import fs from 'fs/promises';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadResumeService } from '../services/resume/uploadResume.service.js';
import { parseResumeService } from '../services/resume/parseResume.service.js';
import { extractResumeDataService } from '../services/resume/extractResumeData.service.js';

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Resume file is required');
    }

    if (!req.user?.sub) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const fileInfo = await uploadResumeService(req.file);
    const resumeText = await parseResumeService(fileInfo.storedFilePath);
    const extractedData = extractResumeDataService(resumeText);

    const resumeDocument = await Resume.create({
      userId: req.user.sub,
      originalFileName: fileInfo.originalFileName,
      storedFilePath: fileInfo.storedFilePath,
      resumeText,
      personalInfo: extractedData.personalInfo,
      education: extractedData.education,
      skills: extractedData.skills,
      projects: extractedData.projects,
      experience: extractedData.experience,
      certifications: extractedData.certifications,
      uploadedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeId: resumeDocument._id,
        fileName: resumeDocument.originalFileName,
        skills: resumeDocument.skills,
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
}
