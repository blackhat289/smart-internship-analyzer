import fs from 'fs/promises';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadResumeService } from '../services/resume/uploadResume.service.js';
import { parseResumeService } from '../services/resume/parseResume.service.js';
import { extractResumeDataService } from '../services/resume/extractResumeData.service.js';

export async function uploadResume(req, res, next) {
  try {
    const uploadedFile = req.file || req.files?.resume?.[0] || req.files?.file?.[0];

    if (!uploadedFile) {
      throw new ApiError(400, 'Resume file is required');
    }

    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const fileInfo = await uploadResumeService(uploadedFile);
    const resumeText = await parseResumeService(fileInfo.storedFilePath);
    const extractedData = extractResumeDataService(resumeText);

    const resumeDocument = await Resume.create({
      userId,
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
    const uploadedFile = req.file || req.files?.resume?.[0] || req.files?.file?.[0];
    if (uploadedFile?.path) {
      await fs.unlink(uploadedFile.path).catch(() => {});
    }
    next(error);
  }
}
