import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import SectionHeading from '../../components/common/SectionHeading';
import SkillChip from '../../components/common/SkillChip';
import ReadinessScoreCard from '../../components/dashboard/ReadinessScoreCard';
import AtsScoreCard from '../../components/dashboard/AtsScoreCard';
import KeyStrengthsCard from '../../components/dashboard/KeyStrengthsCard';
import MissingSkillsCard from '../../components/dashboard/MissingSkillsCard';
import { analysisService } from '../../services/analysisService';
import useAuth from '../../hooks/useAuth';

function SkeletonBlock() {
  return <div className="h-4 animate-pulse rounded bg-slate-200/80" />;
}

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await analysisService.getBackendDashboardSnapshot(user?._id || user?.id);
        if (!active) return;
        if (!response) {
          setAnalysis(null);
          setError('No analysis has been saved yet. Run a new resume analysis.');
          return;
        }
        setAnalysis(normalizeDashboardPayload(response));
        setError('');
      } catch (err) {
        if (!active) return;
        setError(typeof err === 'string' ? err : 'Unable to load dashboard data.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [location.key]);

  const sections = useMemo(() => analysis || {}, [analysis]);
  const skills = sections.skills?.detected_skills || sections.skills || [];
  const resumeImprove = sections.resume_improvement_suggestions || [];
  const roadmap = sections.learning_roadmap || [];
  const contextPreview = sections.context_preview || [];
  const ragSummary = sections.rag_summary || {};

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="grid gap-6">
        {error ? (
          <Card className="border-rose-200 bg-rose-50 text-rose-700">
            {error}
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <>
              <Card className="p-5"><SkeletonBlock /></Card>
              <Card className="p-5"><SkeletonBlock /></Card>
              <Card className="p-5"><SkeletonBlock /></Card>
            </>
          ) : (
            <>
              <ReadinessScoreCard readiness={sections.readiness_score || {}} />
              <AtsScoreCard ats={sections.ats_analysis || {}} />
              <KeyStrengthsCard strengths={sections.key_strengths || []} />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <SectionHeading title="Weaknesses" subtitle="Areas that need attention" />
            <div className="mt-4 space-y-2">
              {(sections.recruiter_summary?.concerns || []).length ? (
                sections.recruiter_summary.concerns.map((item) => (
                  <div key={item} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No major weaknesses flagged yet.</p>
              )}
            </div>
          </Card>

          <MissingSkillsCard skillGap={sections.skill_gap_analysis || {}} />
        </div>

        <Card className="p-6">
          <SectionHeading
            title="Resume Analysis"
            subtitle="Structured extraction from the uploaded PDF"
          />
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <SkeletonBlock />
              <SkeletonBlock />
            </div>
          ) : analysis ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Personal Information</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoField label="Name" value={sections.personal_information?.name} />
                  <InfoField label="Email" value={sections.personal_information?.email} />
                  <InfoField label="Phone" value={sections.personal_information?.phone} />
                  <InfoField label="Location" value={sections.personal_information?.location} />
                  <InfoField label="GitHub" value={sections.personal_information?.github} />
                  <InfoField label="LinkedIn" value={sections.personal_information?.linkedin} />
                  <InfoField label="Portfolio" value={sections.personal_information?.portfolio} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {skills.length ? skills.map((item) => <SkillChip key={item}>{item}</SkillChip>) : <span className="text-sm text-slate-500">None</span>}
                </div>
              </div>
              <AnalysisListSection
                title="RAG Context"
                items={contextPreview}
                renderItem={(item) => (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{item.title || 'Resource'}</div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {item.type || 'match'}
                        {item.score ? ` • ${item.score}%` : ''}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {item.description || 'Matched from your resume profile.'}
                    </div>
                  </div>
                )}
              />
              <AnalysisListSection title="Education" items={sections.education || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.degree || 'Education'}</div>
                  <div className="text-sm text-slate-600">{item.specialization || 'Specialization not available'}</div>
                  <div className="text-sm text-slate-600">{item.institution || 'Institution not available'}</div>
                  <div className="text-xs text-slate-500">{[item.start_year, item.graduation_year, item.cgpa, item.percentage].filter(Boolean).join(' • ') || 'No academic details available'}</div>
                </div>
              )} />
              <AnalysisListSection title="Projects" items={sections.projects || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.title || 'Project'}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.description || 'No description available'}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(item.technologies || []).map((tech) => <SkillChip key={tech} tone="primary">{tech}</SkillChip>)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">{item.complexity ? `Complexity: ${item.complexity}` : ''} {item.project_score != null ? `Score: ${item.project_score}` : ''}</div>
                </div>
              )} />
              <AnalysisListSection title="Experience" items={sections.experience || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.company || 'Company'}</div>
                  <div className="text-sm text-slate-600">{item.role || 'Role not available'}</div>
                  <div className="text-xs text-slate-500">{item.duration || 'Duration not available'}</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {(item.responsibilities || []).map((resp) => <li key={resp}>{resp}</li>)}
                  </ul>
                </div>
              )} />
              <AnalysisListSection title="Certifications" items={sections.certifications || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{typeof item === 'string' ? item : item.title || item.name || 'Certification'}</div>
                </div>
              )} />
            </div>
          ) : (
            <p className="text-sm text-slate-600">Run an analysis to populate the dashboard.</p>
          )}
        </Card>

        <Card className="p-6">
          <SectionHeading title="Resume Preview" subtitle="Structured sections extracted from the uploaded PDF" />
          {sections.resume_text ? (
            <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Show extracted text</summary>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">
                {sections.resume_text}
              </pre>
            </details>
          ) : (
            <p className="text-sm text-slate-600">The structured sections above are taken from your uploaded resume.</p>
          )}
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-6">
            <SectionHeading title="Career Insights" subtitle="Domain alignment and learning signals" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary Domain" value={sections.career_insights?.primary_domain} />
              <Field label="Secondary Domains" value={(sections.career_insights?.secondary_domains || []).join(', ')} />
              <Field label="Domain Match" value={`${sections.career_insights?.domain_match_percentage ?? 0}%`} />
              <Field label="Confidence" value={`${sections.career_insights?.confidence_score ?? 0}%`} />
            </div>
            {ragSummary.summary_bullets?.length ? (
              <div className="mt-6 space-y-2">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">RAG Summary</div>
                {ragSummary.summary_bullets.map((bullet) => (
                  <div key={bullet} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {bullet}
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <SectionHeading title="Recruiter Summary" subtitle="Shortlist-ready view" />
            <div className="space-y-3">
              <Field label="Strengths" value={(sections.recruiter_summary?.strengths || []).join(' • ')} />
              <Field label="Concerns" value={(sections.recruiter_summary?.concerns || []).join(' • ')} />
              <Field label="Feedback" value={sections.recruiter_summary?.overall_feedback} />
              <Field label="Hire Recommendation" value={sections.recruiter_summary?.hire_recommendation} />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <SectionHeading title="Recommendations" subtitle="Learning roadmap and suggested actions" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Technologies to Learn</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(sections.technologies_to_learn || []).length
                    ? sections.technologies_to_learn.map((item) => <SkillChip key={item} tone="primary">{item}</SkillChip>)
                    : <span className="text-sm text-slate-500">None</span>}
                </div>
              </div>
              <AnalysisListSection title="Learning Roadmap" items={roadmap} renderItem={(item) => (
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">{item.step}</div>
                  <div>
                    <div className="font-semibold text-slate-900">{item.technology || 'Technology'}</div>
                    <div className="text-sm text-slate-500">{item.reason || 'No reason provided.'}</div>
                  </div>
                </div>
              )} />
              <AnalysisListSection title="Resume Improvement Suggestions" items={resumeImprove} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">{item}</div>
              )} />
            </div>

            <div className="space-y-4">
              <AnalysisListSection title="Recommended Courses" items={sections.recommended_courses || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.title || item.course_name || 'Course'}</div>
                  <div className="text-sm text-slate-600">{item.provider || item.description || 'Recommended learning resource'}</div>
                  <div className="mt-2 text-xs text-slate-500">{item.reason || ''}</div>
                </div>
              )} />
              <AnalysisListSection title="Suggested Projects" items={sections.suggested_projects || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.title || item.project_name || 'Project'}</div>
                  <div className="text-sm text-slate-600">{item.difficulty || 'Project idea'}</div>
                  <div className="mt-2 text-xs text-slate-500">{item.reason || ''}</div>
                </div>
              )} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeading title="Internship Recommendations" subtitle="Role matches based on your profile" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(sections.internship_recommendations || []).length ? sections.internship_recommendations.map((item, index) => (
              <div key={`${item.role || 'role'}-${index}`} className="rounded-2xl border border-slate-200 p-4">
                <div className="font-semibold text-slate-900">{item.company || item.role || 'Internship'}</div>
                <div className="text-sm text-slate-600">{item.role || 'Role not available'}</div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-[color:var(--color-primary)]" style={{ width: `${item.match_score ?? 0}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-500">{item.match_score ?? 0}% match</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(item.required_skills_missing || []).map((skill) => <SkillChip key={skill} tone="warning">{skill}</SkillChip>)}
                </div>
              </div>
            )) : <p className="text-sm text-slate-500">No internship recommendations yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AnalysisListSection({ title, items = [], renderItem }) {
  return (
    <div>
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-3 grid gap-3">
        {items.length ? items.map((item, index) => <div key={index}>{renderItem(item, index)}</div>) : <p className="text-sm text-slate-500">No data available.</p>}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-sm text-slate-700">{value || 'Not available'}</div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 break-words text-sm font-medium text-slate-800">
        {value || 'Not available'}
      </div>
    </div>
  );
}

function normalizeDashboardPayload(payload = {}) {
  const data = payload?.data || payload || {};
  const analysis = data.analysis || {};
  const resume = data.resume || {};

  const education = (resume.education || []).map((item) => ({
    degree: item.degree || item.title || 'Education',
    specialization: item.specialization || '',
    institution: item.institution || item.organization || '',
    start_year: item.start_year || item.startDate || '',
    graduation_year: item.graduation_year || item.year || '',
    cgpa: item.cgpa || item.score || '',
    percentage: item.percentage || '',
  }));

  const projects = (resume.projects || []).map((item) => ({
    title: item.title || 'Project',
    description: item.description || '',
    technologies: Array.isArray(item.technologies) ? item.technologies : [],
  }));

  const experience = (resume.experience || []).map((item) => ({
    company: item.company || item.organization || '',
    role: item.role || item.title || 'Role',
    duration: item.duration || `${item.startDate || ''}${item.endDate ? ` - ${item.endDate}` : ''}`.trim(),
    responsibilities: Array.isArray(item.responsibilities)
      ? item.responsibilities
      : item.description
        ? String(item.description).split(' | ').filter(Boolean)
        : [],
  }));

  return {
    selectedRole: analysis.selectedRole || '',
    readiness_score: {
      overall: analysis.readinessScore ?? 0,
      skills_score: analysis.readinessScore ?? 0,
      projects_score: analysis.readinessScore ?? 0,
      experience_score: 0,
      certification_score: 0,
    },
    ats_analysis: analysis.ats_analysis || {},
    key_strengths: uniqueList(analysis.strengths || []),
    weaknesses: analysis.weaknesses || [],
    skill_gap_analysis: {
      missing_skills: uniqueList(analysis.skillGaps || []),
      important_missing_skills: [],
    },
    personal_information: resume.personalInfo || {},
    skills: { detected_skills: resume.skills || [] },
    projects,
    education,
    experience,
    certifications: resume.certifications || [],
    career_insights: analysis.career_insights || {},
    recruiter_summary: analysis.recruiter_summary || {},
    technologies_to_learn: analysis.technologiesToLearn || analysis.technologies_to_learn || analysis.skillGaps || [],
    recommended_courses: analysis.recommendedCourses || analysis.recommended_courses || [],
    suggested_projects: analysis.suggestedProjects || analysis.suggested_projects || [],
    internship_recommendations: analysis.internshipRecommendations || analysis.internship_recommendations || [],
    learning_roadmap: buildRoadmapSteps(analysis.technologiesToLearn || analysis.skillGaps || []),
    rag_summary: analysis.rag_summary || analysis.career_insights?.rag_summary || {},
    context_preview: analysis.context_preview || analysis.career_insights?.context_preview || [],
    resume_improvement_suggestions: analysis.resume_improvement_suggestions || [],
    resume_text: resume.resumeText || '',
  };
}

function buildRoadmapSteps(items = []) {
  return (items || []).slice(0, 5).map((technology, index) => ({
    step: index + 1,
    technology,
    reason: `Learn ${technology}`,
  }));
}

function uniqueList(items = []) {
  return [...new Set((items || []).map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean))];
}
