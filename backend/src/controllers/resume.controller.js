import fs from 'fs/promises';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadResumeService } from '../services/resume/uploadResume.service.js';
import { parseResumeService } from '../services/resume/parseResume.service.js';
import { extractResumeDataService } from '../services/resume/extractResumeData.service.js';

function uniqueStrings(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function flattenSkills(categories = {}) {
  return uniqueStrings(
    Object.values(categories).flatMap((value) => (Array.isArray(value) ? value : []))
  );
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
    validateEducationRecords(extractedData.education);
    const flattenedSkills = flattenSkills(extractedData.skills);
    const parseQuality = assessParseQuality(extractedData);
    const resumePayload = {
      userId,
      originalFileName: fileInfo.originalFileName,
      storedFilePath: fileInfo.storedFilePath,
      resumeText,
      personalInfo: extractedData.personalInfo,
      education: extractedData.education,
      skills: extractedData.skills,
      projects: extractedData.projects,
      certifications: extractedData.certifications,
      parseQuality,
      uploadedAt: new Date(),
    };

    const resumeDocument = await Resume.findOneAndUpdate(
      { userId },
      { $set: resumePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeId: resumeDocument._id,
        fileName: resumeDocument.originalFileName,
        skills: flattenedSkills,
        projects: resumeDocument.projects,
        personalInfo: resumeDocument.personalInfo,
        parseQuality: resumeDocument.parseQuality,
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

    let resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!resume) {
      throw new ApiError(404, 'Resume not found for this user');
    }

    if (shouldRefreshResume(resume)) {
      resume = await refreshResumeDocument(resume);
    }

    const skills = flattenSkills(resume.skills);

    return res.json({
      success: true,
      message: 'Resume fetched successfully',
      data: {
        resume: {
          ...resume.toObject(),
          skills,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

function shouldRefreshResume(resume) {
  const personalInfo = resume.personalInfo || {};
  const skills = resume.skills || {};
  return !personalInfo.name || !personalInfo.email || !flattenSkills(skills).length || !resume.education?.length || !resume.projects?.length;
}

async function refreshResumeDocument(resume) {
  const resumeText = resume.resumeText || (await parseResumeService(resume.storedFilePath));
  const extractedData = extractResumeDataService(resumeText);
  validateEducationRecords(extractedData.education);
  const parseQuality = assessParseQuality(extractedData);
  const update = {
    resumeText,
    personalInfo: extractedData.personalInfo,
    skills: extractedData.skills,
    education: extractedData.education,
    projects: extractedData.projects,
    certifications: extractedData.certifications,
    parseQuality,
  };

  return Resume.findByIdAndUpdate(resume._id, { $set: update }, { new: true });
}

function assessParseQuality(extractedData = {}) {
  const notes = [];
  const personalInfo = extractedData.personalInfo || {};
  const skills = extractedData.skills || {};
  const education = extractedData.education || [];

  if (!personalInfo.name) notes.push('Name missing or inferred');
  if (!personalInfo.email) notes.push('Email missing or inferred');
  if (!flattenSkills(skills).length) notes.push('Skills parsed from fallback rules');
  if (!education.length) notes.push('Education section weak or missing');

  return {
    source: 'resume_pdf',
    status: notes.length ? 'fallback' : 'clean',
    notes,
  };
}

function validateEducationRecords(education = []) {
  for (const item of education) {
    const degree = String(item?.degree || '').trim();
    const institution = String(item?.institution || '').trim();
    if (!degree || !institution) {
      throw new ApiError(400, 'Education extraction failed validation');
    }
  }
}
