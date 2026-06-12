import { ApiResponse } from '../utils/ApiResponse.js';
import { readinessScoreService } from '../services/analysis/readinessScore.service.js';
import { skillGapService } from '../services/analysis/skillGap.service.js';
import { strengthsAnalysisService } from '../services/analysis/strengthsAnalysis.service.js';
import { resumeRepository } from '../repositories/resume.repository.js';

export async function calculateReadinessScore(req, res, next) {
  try {
    const resume = await resumeRepository.findByUserId(req.user.sub);
    const score = await readinessScoreService({
      skills: resume?.extractedData?.skills || [],
      gaps: [],
      strengths: [],
    });
    res.json(new ApiResponse(200, 'Readiness score calculated successfully', { readinessScore: score }));
  } catch (error) {
    next(error);
  }
}

export async function analyzeSkillGap(req, res, next) {
  try {
    const resume = await resumeRepository.findByUserId(req.user.sub);
    const gaps = await skillGapService(req.body.targetRole, resume?.extractedData || {});
    res.json(new ApiResponse(200, 'Skill gap analysis completed', { gaps }));
  } catch (error) {
    next(error);
  }
}

export async function analyzeStrengths(req, res, next) {
  try {
    const resume = await resumeRepository.findByUserId(req.user.sub);
    const strengths = await strengthsAnalysisService(resume?.extractedData || {});
    res.json(new ApiResponse(200, 'Strength analysis completed', { strengths }));
  } catch (error) {
    next(error);
  }
}
