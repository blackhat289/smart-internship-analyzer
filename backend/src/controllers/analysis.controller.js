import Analysis from '../models/Analysis.js';
import Resume from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { readinessScoreService } from '../services/analysis/readinessScore.service.js';
import { skillGapService } from '../services/analysis/skillGap.service.js';
import { strengthsAnalysisService } from '../services/analysis/strengthsAnalysis.service.js';
import { generateRecommendationsWithML } from '../services/ai/mlClient.service.js';
import { geminiJsonRequest } from '../integrations/gemini/geminiClient.js';
import { parseResumeService } from '../services/resume/parseResume.service.js';
import { extractResumeDataService } from '../services/resume/extractResumeData.service.js';

function flattenSkills(categories = {}) {
  return [...new Set(Object.values(categories).flatMap((value) => (Array.isArray(value) ? value : [])))];
}

function mapResume(resume) {
  if (!resume) return null;
  const resumeObj = resume.toObject ? resume.toObject() : resume;
  return {
    ...resumeObj,
    skillsFlat: flattenSkills(resumeObj.skills || {}),
  };
}

export async function generateAnalysis(req, res, next) {
  try {
    const userId = req.body?.userId || req.user?.sub || req.user?.id;
    if (!userId) throw new ApiError(401, 'User identification is required');
    const selectedRole = req.body?.selectedRole || 'Internship';
    let resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (!resume) throw new ApiError(404, 'Resume not found');
    if (shouldRefreshResume(resume)) {
      resume = await refreshResumeDocument(resume);
    }

    const { mapped, readinessScoreResult, skillGapResult, strengthsResult, ats_analysis, ragPayload } =
      await buildAnalysisArtifacts({ resume, selectedRole });

    const analysis = await Analysis.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          selectedRole,
          readinessScore: readinessScoreResult.score,
          strengths: ragPayload.strengths,
          weaknesses: ragPayload.weaknesses,
          skillGaps: skillGapResult.skillGaps,
          technologiesToLearn: ragPayload.technologiesToLearn,
          recommendedCourses: ragPayload.recommendations.technologiesToLearn.map((item) => ({ title: item, reason: `Learn ${item}` })),
          suggestedProjects: ragPayload.recommendations.suggestedProjects,
          internshipRecommendations: [],
          ats_analysis,
          career_insights: ragPayload.careerInsights,
          recruiter_summary: { strengths: strengthsResult.strengths, concerns: skillGapResult.skillGaps },
          rag_summary: ragPayload.ragSummary,
          context_preview: ragPayload.contextPreview,
          projectInsights: ragPayload.projectInsights,
          projectInsightsBySource: ragPayload.projectInsightsBySource,
          certificationInsights: ragPayload.certificationInsights,
          roadmap: ragPayload.roadmap,
          resume_improvement_suggestions: ragPayload.recommendations.resumeSuggestions,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(
      new ApiResponse(201, 'Analysis generated successfully', {
        analysis,
        resume: mapped,
        rag: ragPayload,
      })
    );
  } catch (error) {
    return next(error);
  }
}

function shouldRefreshResume(resume) {
  const personalInfo = resume.personalInfo || {};
  return !personalInfo.name || !personalInfo.email || !flattenSkills(resume.skills || {}).length;
}

async function refreshResumeDocument(resume) {
  const resumeText = resume.resumeText || (await parseResumeService(resume.storedFilePath));
  const extractedData = await extractResumeDataService(resumeText);
  const update = {
    resumeText,
    personalInfo: extractedData.personalInfo,
    skills: extractedData.skills,
    education: extractedData.education,
    projects: extractedData.projects,
    certifications: extractedData.certifications,
  };
  return Resume.findByIdAndUpdate(resume._id, { $set: update }, { new: true });
}

export async function getAnalysisByUserId(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId) throw new ApiError(400, 'userId is required');
    const analysis = await Analysis.findOne({ userId }).sort({ createdAt: -1 });
    let resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (resume && shouldRefreshResume(resume)) {
      resume = await refreshResumeDocument(resume);
    }
    if (!resume) throw new ApiError(404, 'Resume not found for this user');

    const needsRefresh = !analysis || !analysis.updatedAt || !resume.updatedAt || new Date(analysis.updatedAt).getTime() < new Date(resume.updatedAt).getTime();
    if (!needsRefresh) {
      return res.json(new ApiResponse(200, 'Analysis fetched successfully', { analysis, resume: mapResume(resume) }));
    }

    const selectedRole = analysis?.selectedRole || 'Internship';
    const { mapped, readinessScoreResult, skillGapResult, strengthsResult, ats_analysis, ragPayload } =
      await buildAnalysisArtifacts({ resume, selectedRole });
    const refreshed = await Analysis.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          selectedRole,
          readinessScore: readinessScoreResult.score,
          strengths: ragPayload.strengths,
          weaknesses: ragPayload.weaknesses,
          skillGaps: skillGapResult.skillGaps,
          technologiesToLearn: ragPayload.technologiesToLearn,
          recommendedCourses: ragPayload.recommendations.technologiesToLearn.map((item) => ({ title: item, reason: `Learn ${item}` })),
          suggestedProjects: ragPayload.recommendations.suggestedProjects,
          internshipRecommendations: [],
          ats_analysis,
          career_insights: ragPayload.careerInsights,
          recruiter_summary: { strengths: strengthsResult.strengths, concerns: skillGapResult.skillGaps },
          rag_summary: ragPayload.ragSummary,
          context_preview: ragPayload.contextPreview,
          projectInsights: ragPayload.projectInsights,
          projectInsightsBySource: ragPayload.projectInsightsBySource,
          certificationInsights: ragPayload.certificationInsights,
          roadmap: ragPayload.roadmap,
          resume_improvement_suggestions: ragPayload.recommendations.resumeSuggestions,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(new ApiResponse(200, 'Analysis fetched successfully', { analysis: refreshed, resume: mapped }));
  } catch (error) {
    return next(error);
  }
}

async function buildAnalysisArtifacts({ resume, selectedRole }) {
  const mapped = mapResume(resume);
  const skills = mapped.skillsFlat;
  const readinessScoreResult = await readinessScoreService({ selectedRole, skills, projects: mapped.projects });
  const skillGapResult = await skillGapService({ selectedRole, skills });
  const strengthsResult = await strengthsAnalysisService({ selectedRole, skills, projects: mapped.projects });
  const ats_analysis = buildAtsAnalysis(resume, selectedRole, skills, readinessScoreResult.score);
  const ragPayload = await buildRagInsights({ resume: mapped, selectedRole, skillGaps: skillGapResult.skillGaps });
  return { mapped, readinessScoreResult, skillGapResult, strengthsResult, ats_analysis, ragPayload };
}

function buildAtsAnalysis(resume, selectedRole, skills, readinessScore) {
  const contact = resume.personalInfo || {};
  const breakdown = {
    keywordDensity: Math.min(100, skills.length * 10),
    sectionCompleteness: Math.min(100, ((resume.education?.length ? 1 : 0) + (resume.projects?.length ? 1 : 0) + (resume.certifications?.length ? 1 : 0)) * 33),
    resumeFormatting: 80,
    actionVerbs: 70,
    skillMatchScore: readinessScore,
    contactInformationCompleteness: [contact.email, contact.phoneNumber, contact.github, contact.linkedin].filter(Boolean).length * 25,
  };
  const atsScore = Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0) / Object.keys(breakdown).length);
  return {
    ats_score: atsScore,
    breakdown,
    strengths: ['Clean contact data', 'Section structure detected'],
    issues: atsScore < 70 ? [`Add more ${selectedRole} keywords`] : [],
  };
}

async function buildRagInsights({ resume, selectedRole, skillGaps }) {
  const ragContext = [
    `Target Role: ${selectedRole}`,
    `Current Skills: ${resume.skillsFlat.join(', ') || 'None listed'}`,
    `Projects: ${(resume.projects || []).map((p) => {
      const desc = p.summary || p.description || '';
      return `${p.title}${desc ? ` — ${String(desc).slice(0, 80)}` : ''}`;
    }).join(' | ') || 'None listed'}`,
    `Education: ${(resume.education || []).map((e) => [e.degree, e.institution].filter(Boolean).join(' at ')).join(', ') || 'Not specified'}`,
    `Existing Certifications: ${(resume.certifications || []).join(', ') || 'None listed'}`,
    `Detected Skill Gaps: ${skillGaps.join(', ') || 'None identified'}`,
  ].join('\n');

  // Single comprehensive AI call — generates ALL non-score dashboard content
  const aiResult = await geminiJsonRequest(
    `You are an expert career advisor. Analyze the internship candidate profile below and return a JSON object with EXACTLY these keys:

{
  "strengths": ["3-5 specific, evidence-based strengths drawn from their actual skills and projects"],
  "weaknesses": ["3-5 honest, constructive weaknesses or skill gaps to address"],
  "technologiesToLearn": ["5-7 specific technologies the candidate should learn for ${selectedRole}"],
  "roadmap": [
    { "level": "Beginner", "month": "Month 1", "items": ["2-3 specific actionable tasks"] },
    { "level": "Intermediate", "month": "Month 2-3", "items": ["2-3 specific actionable tasks"] },
    { "level": "Advanced", "month": "Month 4-6", "items": ["2-3 tasks including a capstone project"] }
  ],
  "resumeSuggestions": ["4-6 specific, actionable resume improvement tips tailored to this candidate"],
  "suggestedProjects": [
    { "title": "Project name", "reason": "Why this strengthens the candidate's profile" }
  ],
  "certificationSuggestions": [
    { "name": "Certification name", "issuer": "Issuing organization", "year": "", "relevance": "Why this cert matters for ${selectedRole}" }
  ],
  "careerGuidance": ["3-5 personalized career advice bullets for this candidate"]
}

Be specific and tailored — reference the candidate's actual skills and projects, not generic advice.

Candidate Profile:
${ragContext}`
  ).catch(() => null);

  const ai = parseJsonPayload(aiResult?.text) || {};
  const arr = (val) => (Array.isArray(val) && val.length ? val.map(String).filter(Boolean) : null);

  const strengthsBullets  = arr(ai.strengths)  || [];
  const weaknessesBullets = arr(ai.weaknesses) || [];
  const technologiesToLearn = arr(ai.technologiesToLearn) || skillGaps.slice(0, 6);

  const roadmap = (Array.isArray(ai.roadmap) && ai.roadmap.length)
    ? ai.roadmap.map((step) => ({
        level: String(step.level || ''),
        month: String(step.month || ''),
        items: Array.isArray(step.items) ? step.items.map(String).filter(Boolean) : [],
      }))
    : [
        { level: 'Beginner',     month: 'Month 1',   items: ['Core fundamentals', technologiesToLearn[0] || 'Study the basics'] },
        { level: 'Intermediate', month: 'Month 2-3', items: technologiesToLearn.slice(1, 3) },
        { level: 'Advanced',     month: 'Month 4-6', items: ['Capstone project', 'Deployment', 'Interview prep'] },
      ];

  const resumeSuggestions = arr(ai.resumeSuggestions) || [
    'Quantify project impact with metrics.',
    'Add role-specific keywords throughout.',
    'Link GitHub and LinkedIn prominently.',
  ];

  const suggestedProjects = (Array.isArray(ai.suggestedProjects) && ai.suggestedProjects.length)
    ? ai.suggestedProjects.map((p) => ({ title: String(p.title || ''), reason: String(p.reason || '') })).filter((p) => p.title)
    : [{ title: `${selectedRole} capstone`, reason: 'Demonstrate applied skills' }];

  const certificationInsights = (Array.isArray(ai.certificationSuggestions) && ai.certificationSuggestions.length)
    ? ai.certificationSuggestions.map((c) => ({
        name:      String(c.name      || ''),
        issuer:    String(c.issuer    || ''),
        year:      String(c.year      || ''),
        relevance: String(c.relevance || 'Relevant to internship readiness'),
      })).filter((c) => c.name)
    : (resume.certifications || []).map((cert) => ({
        name: cert, issuer: '', year: '', relevance: 'Relevant to internship readiness',
      }));

  // ML service — enrich projects only
  const mlRecommendations = await generateRecommendationsWithML({
    selectedRole,
    selected_role: selectedRole,
    resumeText: resume.resumeText || '',
    skills: resume.skillsFlat,
    projects: resume.projects || [],
    skillGaps,
  }).catch(() => null);

  const resumeProjects = consolidateProjects(resume.projects || []);
  const ragProjects    = consolidateProjects(normalizeSuggestedProjects(mlRecommendations?.suggested_projects || []));
  const projectInsights = { resumeDerived: resumeProjects, ragEnriched: ragProjects, geminiNarrative: [] };

  return {
    strengths:  strengthsBullets,
    weaknesses: weaknessesBullets,
    projectInsights,
    projectInsightsBySource: projectInsights,
    certificationInsights,
    careerInsights: { primary_domain: selectedRole, secondary_domains: [], domain_match_percentage: 75, confidence_score: 78 },
    ragSummary:    { summary_bullets: strengthsBullets.slice(0, 3) },
    contextPreview: (resume.projects || []).slice(0, 3).map((p) => ({ title: p.title, type: 'project', description: p.summary || '' })),
    recommendations: {
      technologiesToLearn,
      resumeSuggestions,
      suggestedProjects,
      weeklyPlan:              [],
      monthlyPlan:             [],
      estimatedCompletionTime: '6 months',
    },
    roadmap,
    technologiesToLearn,
  };
}

function normalizeSuggestedProjects(projects = []) {
  return (Array.isArray(projects) ? projects : []).map((project) => ({
    title: project.title || project.name || 'Project',
    summary: project.description || project.summary || '',
    technologies: Array.isArray(project.technologies)
      ? project.technologies
      : Array.isArray(project.skills)
        ? project.skills
        : [],
    achievements: Array.isArray(project.achievements)
      ? project.achievements
      : project.match_score
        ? [`Match score: ${project.match_score}`]
        : [],
    complexity: project.complexity || project.technicalComplexity || 'Medium',
    duration: project.duration || project.timeline || '',
  }));
}

function consolidateProjects(projects = []) {
  const grouped = new Map();

  for (const project of projects) {
    const title = String(project?.title || project?.name || '').trim();
    if (!title) continue;
    const key = title.toLowerCase();
    const existing = grouped.get(key) || {
      title,
      summary: '',
      technologies: [],
      achievements: [],
      complexity: '',
      duration: '',
    };

    if (!existing.summary) {
      existing.summary = String(project.summary || project.description || '').trim();
    }
    if (!existing.complexity && project.complexity) {
      existing.complexity = String(project.complexity).trim();
    }
    if (!existing.duration && project.duration) {
      existing.duration = String(project.duration).trim();
    }
    existing.technologies = uniqueList([...existing.technologies, ...(Array.isArray(project.technologies) ? project.technologies : [])]);
    existing.achievements = uniqueList([
      ...existing.achievements,
      ...(Array.isArray(project.achievements) ? project.achievements : []),
    ]);
    grouped.set(key, existing);
  }

  return [...grouped.values()].map((project) => ({
    ...project,
    summary: project.summary || 'No summary available.',
    technologies: project.technologies,
    achievements: project.achievements,
    complexity: project.complexity || 'Medium',
    duration: project.duration || '',
  }));
}

function uniqueList(values = []) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function normalizeProjectNarratives(narratives = []) {
  return (Array.isArray(narratives) ? narratives : []).map((item) => {
    if (typeof item === 'string') {
      return { text: item.trim(), source: 'gemini' };
    }
    return {
      title: String(item?.title || item?.name || 'Project Insight').trim(),
      summary: String(item?.summary || item?.text || item?.description || '').trim(),
      technologies: uniqueList(Array.isArray(item?.technologies) ? item.technologies : []),
      achievements: uniqueList(Array.isArray(item?.achievements) ? item.achievements : []),
      complexity: String(item?.complexity || 'Medium').trim(),
      duration: String(item?.duration || '').trim(),
      source: 'gemini',
    };
  });
}

function parseJsonPayload(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  const text = String(value).trim();
  if (!text) return null;
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function normalizeInsightList(value) {
  const parsed = parseJsonPayload(value);
  if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
  if (parsed && typeof parsed === 'object') {
    return Object.values(parsed)
      .flatMap((item) => (Array.isArray(item) ? item : [item]))
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return splitBullets(value).map((item) => item.replace(/^[\s•\-]+/, '').trim()).filter(Boolean);
}

function splitBullets(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(/\n|\u2022|-/)
    .map((item) => item.trim())
    .filter(Boolean);
}
