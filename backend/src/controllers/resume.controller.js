import fs from 'fs/promises';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadResumeService } from '../services/resume/uploadResume.service.js';
import { parseResumeService } from '../services/resume/parseResume.service.js';
import { extractResumeDataService } from '../services/resume/extractResumeData.service.js';
import { extractSkillsFromML } from '../services/ai/mlClient.service.js';

function uniqueStrings(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

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
    let mlExtraction = null;
    try {
      mlExtraction = await extractSkillsFromML(resumeText);
    } catch (error) {
      console.warn('ML skill extraction skipped during resume upload:', error?.message || error);
    }
    const mergedSkills = uniqueStrings([
      ...(Array.isArray(extractedData.skills) ? extractedData.skills : []),
      ...(Array.isArray(mlExtraction?.skills) ? mlExtraction.skills : []),
    ]);

    const resumeDocument = await Resume.create({
      userId,
      originalFileName: fileInfo.originalFileName,
      storedFilePath: fileInfo.storedFilePath,
      resumeText,
      personalInfo: extractedData.personalInfo,
      education: extractedData.education,
      skills: mergedSkills,
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
        projects: resumeDocument.projects,
        personalInfo: resumeDocument.personalInfo,
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

export async function getLatestResume(req, res, next) {
  try {
    const userId = req.user?.sub || req.user?.id;

    if (!userId) {
      throw new ApiError(401, 'Unauthorized request');
    }

    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!resume) {
      throw new ApiError(404, 'Resume not found for this user');
    }

    return res.json({
      success: true,
      message: 'Resume fetched successfully',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
}
