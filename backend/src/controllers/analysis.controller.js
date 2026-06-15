import Analysis from '../models/Analysis.js';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { readinessScoreService } from '../services/analysis/readinessScore.service.js';
import { skillGapService } from '../services/analysis/skillGap.service.js';
import { strengthsAnalysisService } from '../services/analysis/strengthsAnalysis.service.js';
import { analyzeResumeWithML, generateRecommendationsWithML } from '../services/ai/mlClient.service.js';
import env from '../config/env.js';

function validateAnalysisPayload(body) {
  const { selectedRole, skills, projects } = body || {};

  if (!selectedRole) {
    throw new ApiError(400, 'selectedRole is required');
  }

  if (skills !== undefined && !Array.isArray(skills)) {
    throw new ApiError(400, 'skills must be an array');
  }

  if (projects !== undefined && !Array.isArray(projects)) {
    throw new ApiError(400, 'projects must be an array');
  }
}

function resolveUserId(req) {
  return req.body?.userId || req.user?.sub || req.user?.id;
}

export async function generateAnalysis(req, res, next) {
  try {
    validateAnalysisPayload(req.body);

    const userId = resolveUserId(req);
    if (!userId) {
      throw new ApiError(401, 'User identification is required');
    }

    const { selectedRole, skills = [], projects = [] } = req.body;

    const mlPayload = { selectedRole, skills, projects };
    let mlAnalysis = null;
    let mlRecommendations = null;

    if (env.fastapiBaseUrl) {
      try {
        mlAnalysis = await analyzeResumeWithML(mlPayload);
      } catch (mlError) {
        console.warn('ML analysis skipped:', mlError?.response?.status || mlError?.message || mlError);
      }

      try {
        mlRecommendations = await generateRecommendationsWithML(mlPayload);
      } catch (mlError) {
        console.warn('ML recommendations skipped:', mlError?.response?.status || mlError?.message || mlError);
      }
    }

    const [readinessScoreResult, strengthsResult, skillGapResult] = mlAnalysis
      ? [
          {
            score: Number(mlAnalysis.readinessScore ?? mlAnalysis.readiness_score ?? 0),
          },
          {
            strengths: Array.isArray(mlAnalysis.strengths) ? mlAnalysis.strengths : [],
          },
          {
            skillGaps: Array.isArray(mlAnalysis.skillGaps)
              ? mlAnalysis.skillGaps
              : Array.isArray(mlAnalysis.skill_gaps)
                ? mlAnalysis.skill_gaps
                : [],
          },
        ]
      : await Promise.all([
          readinessScoreService({ selectedRole, skills, projects }),
          strengthsAnalysisService({ selectedRole, skills, projects }),
          skillGapService({ selectedRole, skills, projects }),
        ]);

    const weaknesses = Array.isArray(mlAnalysis?.weaknesses)
      ? mlAnalysis.weaknesses
      : skillGapResult.skillGaps.length
        ? [`Missing core skills for ${selectedRole}`, `Recommended focus areas: ${skillGapResult.skillGaps.slice(0, 3).join(', ')}`]
        : [];

    const technologiesToLearn = mlAnalysis?.roadmap?.technologiesToLearn || mlAnalysis?.roadmap?.technologies_to_learn || skillGapResult.skillGaps;
    const recommendedCourses =
      mlAnalysis?.roadmap?.recommendedCourses ||
      mlAnalysis?.roadmap?.recommended_courses ||
      mlAnalysis?.recommendedCourses ||
      mlAnalysis?.recommended_courses ||
      [];
    const suggestedProjects =
      mlAnalysis?.roadmap?.suggestedProjects ||
      mlAnalysis?.roadmap?.suggested_projects ||
      mlAnalysis?.suggestedProjects ||
      mlAnalysis?.suggested_projects ||
      [];
    const internshipRecommendations =
      mlRecommendations?.internship_recommendations ||
      mlAnalysis?.internshipRecommendations ||
      mlAnalysis?.internship_recommendations ||
      [];

    const ats_analysis = mlAnalysis?.ats_analysis || {
      ats_score: Math.min(100, Math.max(30, readinessScoreResult.score + 10)),
      breakdown: {
        domain_alignment: readinessScoreResult.score,
        skills_completeness: Math.min(100, (skills || []).length * 10),
        profile_structure: 75,
        contact_completeness: 80
      },
      strengths: ['Formatting parsed correctly', 'Section headers detected'],
      issues: skillGapResult.skillGaps.length ? ['Lacks domain-specific skills'] : []
    };

    const career_insights = mlAnalysis?.career_insights || {
      primary_domain: selectedRole,
      secondary_domains: [],
      domain_match_percentage: readinessScoreResult.score,
      confidence_score: readinessScoreResult.score
    };

    const recruiter_summary = mlAnalysis?.recruiter_summary || {
      strengths: strengthsResult.strengths,
      concerns: skillGapResult.skillGaps.length ? [`Missing key skills for ${selectedRole}`] : [],
      overall_feedback: `The candidate has a readiness score of ${readinessScoreResult.score}% for ${selectedRole} roles.`,
      role_suitability: readinessScoreResult.score >= 50 ? 'Suitable' : 'Needs Improvement',
      hire_recommendation: readinessScoreResult.score >= 70 ? 'Buy' : 'Hold'
    };
    const rag_summary = mlAnalysis?.rag_summary || mlAnalysis?.career_insights?.rag_summary || {};
    const context_preview = mlAnalysis?.context_preview || mlAnalysis?.career_insights?.context_preview || [];

    const resume_improvement_suggestions = mlAnalysis?.resume_improvement_suggestions || [
      `Learn required skills for ${selectedRole}: ${skillGapResult.skillGaps.slice(0, 3).join(', ')}`,
      'Quantify project achievements with metrics.'
    ];

    let analysis = null;
    try {
      analysis = await Analysis.create({
        userId,
        selectedRole,
        readinessScore: readinessScoreResult.score,
        strengths: strengthsResult.strengths,
        weaknesses,
        skillGaps: skillGapResult.skillGaps,
        technologiesToLearn,
        recommendedCourses,
        suggestedProjects,
        internshipRecommendations,
        ats_analysis,
        career_insights,
        recruiter_summary,
        rag_summary,
        context_preview,
        resume_improvement_suggestions,
      });
    } catch (saveError) {
      console.warn('Analysis persistence skipped:', saveError?.message || saveError);
    }

    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    return res.status(201).json(
      new ApiResponse(201, 'Analysis generated successfully', {
        analysisId: analysis?._id || null,
        selectedRole,
        readinessScore: readinessScoreResult.score,
        strengths: strengthsResult.strengths,
        weaknesses,
        skillGaps: skillGapResult.skillGaps,
        technologiesToLearn,
        recommendedCourses,
        suggestedProjects,
        internshipRecommendations,
        ats_analysis,
        career_insights,
        recruiter_summary,
        rag_summary,
        context_preview,
        resume_improvement_suggestions,
        resume: latestResume
          ? {
              personalInfo: latestResume.personalInfo || {},
              education: latestResume.education || [],
              skills: latestResume.skills || [],
              projects: latestResume.projects || [],
              experience: latestResume.experience || [],
              certifications: latestResume.certifications || [],
              resumeText: latestResume.resumeText || '',
            }
          : null,
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
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

    if (!analysis && !resume) {
      throw new ApiError(404, 'Analysis not found for this user');
    }

    return res.json(
      new ApiResponse(200, 'Analysis fetched successfully', {
        analysis,
        resume,
      })
    );
  } catch (error) {
    return next(error);
  }
}

export async function getAnalysisReportById(req, res, next) {
  try {
    const { analysisId } = req.params;

    if (!analysisId) {
      throw new ApiError(400, 'analysisId is required');
    }

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
