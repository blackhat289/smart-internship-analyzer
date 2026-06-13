import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Analysis from '../models/Analysis.js';
import { readinessScoreService } from '../services/analysis/readinessScore.service.js';
import { skillGapService } from '../services/analysis/skillGap.service.js';
import { strengthsAnalysisService } from '../services/analysis/strengthsAnalysis.service.js';

function validateAnalysisPayload(body) {
  const { userId, selectedRole, skills, projects } = body || {};

  if (!userId || !selectedRole) {
    throw new ApiError(400, 'userId and selectedRole are required');
  }

  if (skills !== undefined && !Array.isArray(skills)) {
    throw new ApiError(400, 'skills must be an array');
  }

  if (projects !== undefined && !Array.isArray(projects)) {
    throw new ApiError(400, 'projects must be an array');
  }
}

export async function generateAnalysis(req, res, next) {
  try {
    validateAnalysisPayload(req.body);

    const { userId, selectedRole, skills = [], projects = [] } = req.body;

    const [readinessScoreResult, strengthsResult, skillGapResult] = await Promise.all([
      readinessScoreService({ selectedRole, skills, projects }),
      strengthsAnalysisService({ selectedRole, skills, projects }),
      skillGapService({ selectedRole, skills, projects }),
    ]);

    const analysis = await Analysis.create({
      userId,
      selectedRole,
      readinessScore: readinessScoreResult.score,
      strengths: strengthsResult.strengths,
      skillGaps: skillGapResult.skillGaps,
    });

    return res.status(201).json(
      new ApiResponse(201, 'Analysis generated successfully', {
        analysisId: analysis._id,
        selectedRole: analysis.selectedRole,
        readinessScore: analysis.readinessScore,
        strengths: analysis.strengths,
        skillGaps: analysis.skillGaps,
      })
    );
  } catch (error) {
    return next(error);
  }
}

export async function getAnalysisByUserId(req, res, next) {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(400, 'userId is required');
    }

    const analysis = await Analysis.findOne({ userId }).sort({ createdAt: -1 });

    if (!analysis) {
      throw new ApiError(404, 'Analysis not found for this user');
    }

    return res.json(
      new ApiResponse(200, 'Analysis fetched successfully', {
        analysis,
      })
    );
  } catch (error) {
    return next(error);
  }
}

export async function getAnalysisReportById(req, res, next) {
  try {
    const { analysisId } = req.params;

    const analysis = await Analysis.findById(analysisId);

    if (!analysis) {
      throw new ApiError(404, 'Analysis report not found');
    }

    return res.json(
      new ApiResponse(200, 'Analysis report fetched successfully', {
        analysis,
      })
    );
  } catch (error) {
    return next(error);
  }
}
