import api from './api';
import { resumeService } from './resumeService';

export const analysisService = {
  analyzeResume: async (file, selectedRole) => {
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await resumeService.uploadResume(formData);
    const resumeData = uploadResponse?.data || {};
    const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];
    const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];

    if (!selectedRole) {
      throw new Error('Target role is required for analysis.');
    }

    const { data } = await api.post('/analysis/generate', {
      selectedRole,
      skills,
      projects,
    });

    return normalizeAnalysisResponse({
      ...resumeData,
      ...data?.data,
      selectedRole,
      skills,
      projects,
    });
  },
  getStoredDashboard: () => {
    try {
      const raw = localStorage.getItem('sia_dashboard');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  getDashboardSnapshot: async () => {
    return analysisService.getStoredDashboard();
  },
  getBackendDashboardSnapshot: async (userId) => {
    if (!userId) return null;
    const { data } = await api.get(`/analysis/${userId}`);
    return data?.data || null;
  },
  saveDashboardSnapshot: async (payload) => {
    const compact = compactDashboardPayload(payload);
    localStorage.setItem('sia_dashboard', JSON.stringify(compact));
    return compact;
  },
  getLatestAnalysisByUserId: async () => {
    const raw = localStorage.getItem('sia_dashboard');
    return { data: raw ? JSON.parse(raw) : null };
  },
  generateAnalysis: async (payload) => {
    const { data } = await api.post('/analysis/generate', payload);
    return data;
  },
};

function uniqueList(items = []) {
  return [...new Set((items || []).filter(Boolean).map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean))];
}

function normalizeAnalysisResponse(payload) {
  const analysis = payload?.analysis || {};
  const resume = payload?.resume || {};
  const readinessScore = Number(payload?.readinessScore ?? payload?.readiness_score?.overall ?? 0);
  const skillGaps = Array.isArray(payload?.skillGaps)
    ? payload.skillGaps
    : Array.isArray(payload?.skill_gaps)
      ? payload.skill_gaps
      : [];
  const roadmap = payload?.roadmap || {};
  const technologies = roadmap.technologiesToLearn || roadmap.technologies_to_learn || skillGaps;
  const recommendedCourses = payload?.recommendedCourses || roadmap.recommendedCourses || roadmap.recommended_courses || [];
  const suggestedProjects = payload?.suggestedProjects || roadmap.suggestedProjects || roadmap.suggested_projects || [];
  const ragSummary = payload?.career_insights?.rag_summary || {};
  const contextPreview = payload?.career_insights?.context_preview || [];

  return {
    success: true,
    selectedRole: payload?.selectedRole || analysis.selectedRole || '',
    personal_information: payload?.personalInfo || payload?.personal_information || resume.personalInfo || {},
    skills: {
      detected_skills: payload?.skills || resume.skills || [],
    },
    projects: payload?.projects || resume.projects || [],
    education: payload?.education || resume.education || [],
    experience: payload?.experience || resume.experience || [],
    certifications: payload?.certifications || resume.certifications || [],
    readiness_score: {
      overall: readinessScore,
      skills_score: readinessScore,
      projects_score: readinessScore,
      experience_score: 0,
      certification_score: 0,
    },
    ats_analysis: payload?.ats_analysis || {},
    key_strengths: uniqueList(payload?.strengths || payload?.key_strengths || analysis.strengths || []),
    weaknesses: payload?.weaknesses || payload?.key_weaknesses || analysis.weaknesses || [],
    skill_gap_analysis: {
      missing_skills: uniqueList(skillGaps),
      important_missing_skills: [],
    },
    learning_roadmap: buildRoadmapSteps(technologies),
    technologies_to_learn: technologies,
    recommended_courses: recommendedCourses,
    suggested_projects: suggestedProjects,
    internship_recommendations: payload?.internshipRecommendations || payload?.internship_recommendations || [],
    recruiter_summary: payload?.recruiter_summary || {},
    career_insights: payload?.career_insights || {},
    rag_summary: ragSummary,
    context_preview: contextPreview,
    resume_improvement_suggestions: payload?.resume_improvement_suggestions || [],
  };
}

function buildRoadmapSteps(technologies = []) {
  const steps = (technologies || []).slice(0, 5).map((technology, index) => ({
    step: index + 1,
    technology,
    reason: `Build confidence in ${technology}`,
  }));

  if (!steps.length) {
    steps.push({
      step: 1,
      technology: 'Resume Polish',
      reason: 'Review achievements and tailor the resume to the selected role.',
    });
  }

  return steps;
}

function compactDashboardPayload(payload) {
  const trim = (value, max = 300) => {
    if (typeof value !== 'string') return value;
    const text = value.trim();
    return text.length > max ? `${text.slice(0, max)}...` : text;
  };

  const compactArray = (items, maxItems = 25) => (Array.isArray(items) ? items.slice(0, maxItems) : []);
  const roadmap = payload?.roadmap || {};
  const technologiesToLearn = payload?.technologies_to_learn || roadmap.technologiesToLearn || roadmap.technologies_to_learn || [];
  const recommendedCourses = payload?.recommended_courses || roadmap.recommendedCourses || roadmap.recommended_courses || [];
  const suggestedProjects = payload?.suggested_projects || roadmap.suggestedProjects || roadmap.suggested_projects || [];

  return {
    ...payload,
    personal_information: payload?.personal_information || {},
    skills: payload?.skills || { detected_skills: [] },
    education: compactArray(payload?.education, 10).map((item) => ({ ...item })),
    projects: compactArray(payload?.projects, 8).map((item) => ({
      ...item,
      title: trim(item?.title, 120),
      description: trim(item?.description, 220),
      technologies: compactArray(item?.technologies, 10),
      impact_metrics: compactArray(item?.impact_metrics, 5),
    })),
    experience: compactArray(payload?.experience, 8).map((item) => ({
      ...item,
      company: trim(item?.company, 120),
      role: trim(item?.role, 120),
      duration: trim(item?.duration, 80),
      responsibilities: compactArray(item?.responsibilities, 8).map((entry) => trim(entry, 140)),
    })),
    certifications: compactArray(payload?.certifications, 10),
    key_strengths: uniqueList(compactArray(payload?.key_strengths, 20).map((item) => trim(item, 120))),
    career_insights: payload?.career_insights || {},
    rag_summary: payload?.rag_summary || payload?.career_insights?.rag_summary || {},
    context_preview: compactArray(payload?.context_preview || payload?.career_insights?.context_preview, 10),
    skill_gap_analysis: payload?.skill_gap_analysis || {},
    learning_roadmap: compactArray(payload?.learning_roadmap, 15),
    technologies_to_learn: compactArray(technologiesToLearn, 15),
    resume_improvement_suggestions: compactArray(payload?.resume_improvement_suggestions, 20).map((item) => trim(item, 180)),
    recommended_courses: compactArray(recommendedCourses, 10),
    suggested_projects: compactArray(suggestedProjects, 10),
    internship_recommendations: compactArray(payload?.internship_recommendations, 10),
    recruiter_summary: payload?.recruiter_summary || {},
  };
}
