import { useEffect, useMemo, useState } from 'react';
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

function SkeletonBlock() {
  return <div className="h-4 animate-pulse rounded bg-slate-200/80" />;
}

function SectionValue({ value, fallback = 'Not available' }) {
  return <span className="text-sm text-slate-700">{value || fallback}</span>;
}

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await analysisService.getDashboardSnapshot();
        if (!active) return;
        if (!response) {
          setAnalysis(null);
          setError('');
          return;
        }
        setAnalysis(response);
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
  }, []);

  const sections = useMemo(() => analysis || {}, [analysis]);
  const skills = sections.skills || {};
  const resumeImprove = sections.resume_improvement_suggestions || [];
  const roadmap = sections.learning_roadmap || [];

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

        <MissingSkillsCard skillGap={sections.skill_gap_analysis || {}} />

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
                <SectionValue value={sections.personal_information?.name} />
                <SectionValue value={sections.personal_information?.email} />
                <SectionValue value={sections.personal_information?.phone} />
                <SectionValue value={sections.personal_information?.location} />
                <SectionValue value={sections.personal_information?.github} />
                <SectionValue value={sections.personal_information?.linkedin} />
                <SectionValue value={sections.personal_information?.portfolio} />
              </div>
              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skills</div>
                {Object.entries(skills).map(([category, values]) => (
                  <div key={category}>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{category.replaceAll('_', ' ')}</div>
                    <div className="flex flex-wrap gap-2">
                      {(values || []).length ? values.map((item) => <SkillChip key={item}>{item}</SkillChip>) : <span className="text-sm text-slate-500">None</span>}
                    </div>
                  </div>
                ))}
              </div>
              <AnalysisListSection title="Education" items={sections.education || []} renderItem={(item) => (
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.degree || 'Education'}</div>
                  <div className="text-sm text-slate-600">{item.institution || 'Institution not available'}</div>
                  <div className="text-xs text-slate-500">{[item.cgpa, item.graduation_year].filter(Boolean).join(' • ') || 'No academic details available'}</div>
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
                  <div className="font-semibold text-slate-900">{item.certifications?.[0] || 'Certification'}</div>
                </div>
              )} />
            </div>
          ) : (
            <p className="text-sm text-slate-600">Run an analysis to populate the dashboard.</p>
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
