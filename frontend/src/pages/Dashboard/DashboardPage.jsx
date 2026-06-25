import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/common/Card';
import SkillChip from '../../components/common/SkillChip';
import useAuth from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { resumeService } from '../../services/resumeService';
import {
  ScoreCard,
  BulletCard,
  ProjectInsightCard,
} from '../../components/dashboard/Widgets';

const CARD_KEYS = {
  readiness: 'readiness',
  ats: 'ats',
  strengths: 'strengths',
  weaknesses: 'weaknesses',
  missing: 'missing',
  techLearn: 'techLearn',
  projects: 'projects',
  certifications: 'certifications',
  recommendations: 'recommendations',
  roadmap: 'roadmap',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const userId = user?._id || user?.id;
        const [dashboardResponse, resumeResponse] = await Promise.allSettled([
          userId ? dashboardService.getDashboard(userId) : Promise.resolve(null),
          resumeService.getLatestResume(),
        ]);
        if (!active) return;
        const dashboardData = dashboardResponse.status === 'fulfilled' ? dashboardResponse.value?.data || dashboardResponse.value : null;
        const latestResume = resumeResponse.status === 'fulfilled' ? resumeResponse.value?.data?.resume || resumeResponse.value?.resume || null : null;
        setPayload(mergePayload(dashboardData, latestResume));
        setError('');
      } catch (err) {
        if (active) setError(typeof err === 'string' ? err : 'Unable to fetch dashboard data.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?._id, user?.id]);

  const analysis = payload?.analysis || payload || {};
  const resume = payload?.resume || {};
  const normalizedResume = normalizeResume(resume);
  const readiness = analysis.readinessScore || 0;
  const ats = analysis.ats_analysis?.ats_score || 0;
  const strengths = normalizeList(analysis.strengths || []);
  const weaknesses = normalizeList(analysis.weaknesses || []);
  const missingSkills = normalizeList(analysis.skillGaps || []);
  const technologiesToLearn = normalizeList(analysis.technologiesToLearn || analysis.technologies_to_learn || analysis.recommendations?.technologiesToLearn || []);
  const suggestions = normalizeList(analysis.resumeImprovementSuggestions || analysis.resume_improvement_suggestions || analysis.recommendations?.resumeSuggestions || []);
  const suggestedProjects = normalizeProjectList(analysis.recommendations?.suggestedProjects || analysis.suggestedProjects || []);
  const resumeProjects = normalizeProjectList(normalizeProjectBuckets(analysis.projectInsights || analysis.projectInsightsBySource || {}, resume.projects || []).resumeDerived);
  const ragProjects = normalizeProjectList(normalizeProjectBuckets(analysis.projectInsights || analysis.projectInsightsBySource || {}, resume.projects || []).ragEnriched);
  const projects = [...resumeProjects, ...ragProjects].slice(0, 8);
  const certifications = normalizeCertifications(analysis.certificationInsights || resume.certifications || []);
  const roadmap = analysis.roadmap || [];

  const cards = useMemo(() => ([
    renderReadinessCard({ readiness, resume: normalizedResume, loading, error }),
    renderAtsCard({ ats, loading, error }),
    renderListCard({ title: 'Strengths', items: strengths, loading, error, cardKey: CARD_KEYS.strengths }),
    renderListCard({ title: 'Weaknesses', items: weaknesses, loading, error, cardKey: CARD_KEYS.weaknesses }),
    renderMissingSkillsCard({ missingSkills, loading, error }),
    renderTechLearnCard({ technologiesToLearn, loading, error }),
    renderProjectsCard({ projects, loading, error }),
    renderCertificationsCard({ certifications, loading, error }),
    renderRecommendationsCard({ technologiesToLearn, suggestions, suggestedProjects, loading, error }),
    renderRoadmapCard({ roadmap, loading, error }),
  ]), [readiness, ats, strengths, weaknesses, missingSkills, technologiesToLearn, projects, certifications, suggestions, suggestedProjects, roadmap, normalizedResume, loading, error]);

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <Sidebar />
      <div className="grid gap-5">
        {error ? <Card className="border-rose-200 bg-rose-50 text-rose-700">{error}</Card> : null}

        <div className="grid gap-5 xl:grid-cols-2">
          {cards.slice(0, 2)}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {cards.slice(2, 4)}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {cards.slice(4, 6)}
        </div>

        <div className="grid gap-5">
          {cards.slice(6, 7)}
        </div>

        <div className="grid gap-5">
          {cards.slice(7, 8)}
        </div>

        <div className="grid gap-5">
          {cards.slice(8, 9)}
        </div>

        <div className="grid gap-5">
          {cards.slice(9)}
        </div>
      </div>
    </div>
  );
}

function renderReadinessCard({ readiness, resume, loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.readiness} title="Readiness Score" metricCount={2} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.readiness} title="Readiness Score" error={error} />;
  return (
    <ScoreCard
      key={CARD_KEYS.readiness}
      title="Readiness Score"
      score={readiness}
      subtitle="ML model output"
      metrics={[
        { label: 'Skills', value: countFlatSkills(resume.skills) },
      ]}
    />
  );
}

function renderAtsCard({ ats, loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.ats} title="ATS Score" metricCount={2} tone="warning" />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.ats} title="ATS Score" error={error} />;
  return <ScoreCard key={CARD_KEYS.ats} title="ATS Score" score={ats} subtitle="Resume formatting and keyword fit" tone="warning" metrics={[]} />;
}

function renderListCard({ title, items = [], loading, error, cardKey }) {
  if (loading) return <DashboardSkeleton key={cardKey} title={title} metricCount={2} />;
  if (error) return <DashboardErrorCard key={cardKey} title={title} error={error} />;
  return <BulletCard key={cardKey} title={title} items={items} compact />;
}

function renderMissingSkillsCard({ missingSkills = [], loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.missing} title="Missing Skills" metricCount={1} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.missing} title="Missing Skills" error={error} />;
  return (
    <Card className="h-auto p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Missing Skills</div>
        <div className="text-sm text-slate-500">{missingSkills.length}</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {missingSkills.map((skill) => <SkillChip key={skill} tone="warning">{skill}</SkillChip>)}
      </div>
    </Card>
  );
}

function renderTechLearnCard({ technologiesToLearn = [], loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.techLearn} title="Technologies To Learn" metricCount={2} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.techLearn} title="Technologies To Learn" error={error} />;
  return (
    <Card className="h-auto p-6">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Technologies To Learn</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {technologiesToLearn.map((tech) => <SkillChip key={tech}>{tech}</SkillChip>)}
      </div>
    </Card>
  );
}

function renderProjectsCard({ projects = [], loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.projects} title="Projects" metricCount={4} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.projects} title="Projects" error={error} />;
  return (
    <Card className="h-auto p-4">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Projects</div>
      <div className="mt-3 grid gap-3 md:grid-cols-1 xl:grid-cols-2">
        {projects.map((project) => <ProjectInsightCard key={`${project.sourceLabel}-${project.title}`} project={project} />)}
      </div>
    </Card>
  );
}

function renderCertificationsCard({ certifications = [], loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.certifications} title="Certifications" metricCount={4} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.certifications} title="Certifications" error={error} />;
  return (
    <Card className="h-auto p-4">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Certifications</div>
      <div className="mt-3 grid gap-2">
        {certifications.map((cert) => (
          <div key={cert.name} className="grid gap-1 rounded-xl bg-slate-50 px-3 py-2 md:grid-cols-[1.5fr_1fr_0.6fr_1.2fr] md:items-center">
            <div className="font-semibold text-slate-900">{cert.name}</div>
            <div className="text-sm text-slate-600">{cert.issuer}</div>
            <div className="text-sm text-slate-500">{cert.year}</div>
            <div className="text-sm text-slate-600">{cert.relevance}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function renderRecommendationsCard({ technologiesToLearn = [], suggestions = [], suggestedProjects = [], loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.recommendations} title="Recommendations" metricCount={3} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.recommendations} title="Recommendations" error={error} />;
  return (
    <Card className="h-auto p-4">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Recommendations</div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <RecommendationBlock title="Technologies to Learn" items={technologiesToLearn} />
        <RecommendationBlock title="Resume Improvements" items={suggestions} />
        <RecommendationBlock title="Suggested Projects" items={suggestedProjects.map((item) => item.title || item)} />
      </div>
    </Card>
  );
}

function RecommendationBlock({ title, items = [] }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => <SkillChip key={`${title}-${item}`}>{item}</SkillChip>)}
      </div>
    </div>
  );
}

function renderRoadmapCard({ roadmap = [], loading, error }) {
  if (loading) return <DashboardSkeleton key={CARD_KEYS.roadmap} title="Roadmap" metricCount={3} />;
  if (error) return <DashboardErrorCard key={CARD_KEYS.roadmap} title="Roadmap" error={error} />;
  return (
    <Card className="h-auto p-4">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Roadmap</div>
      <div className="mt-3 space-y-2">
        {roadmap.map((item) => (
          <div key={item.level} className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-4">
              <div className="font-semibold text-slate-900">{item.level}</div>
              <div className="text-sm text-slate-500">{item.month}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(item.items || []).map((entry) => <SkillChip key={`${item.level}-${entry}`}>{entry}</SkillChip>)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DashboardSkeleton({ title, metricCount = 3, tone = 'primary' }) {
  return (
    <Card className="h-auto p-4">
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-10 w-20 rounded bg-slate-200" />
            <div className="h-4 w-40 rounded bg-slate-200" />
          </div>
          <div className={`h-20 w-20 rounded-full ${tone === 'warning' ? 'bg-amber-100' : 'bg-slate-100'}`} />
        </div>
        <div className="mt-4 grid gap-2">
          {Array.from({ length: metricCount }).map((_, index) => (
            <div key={index} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div className="h-3 w-24 rounded bg-slate-200" />
              <div className="h-3 w-12 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="mt-3 text-sm text-slate-400">{title} loading...</div>
      </div>
    </Card>
  );
}

function DashboardErrorCard({ title, error }) {
  return (
    <Card className="h-auto border-rose-200 bg-rose-50 p-4 text-rose-700">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-rose-400">{title}</div>
      <div className="mt-2 text-sm">{error || 'Unable to load this section.'}</div>
    </Card>
  );
}

function normalizeList(items = []) {
  return [...new Set(items.map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean))];
}

function normalizeProjectBuckets(projectInsights = {}, fallbackProjects = []) {
  if (Array.isArray(projectInsights)) {
    return { resumeDerived: normalizeProjectList(projectInsights), ragEnriched: [], geminiNarrative: [] };
  }
  return {
    resumeDerived: normalizeProjectList(projectInsights.resumeDerived || fallbackProjects || []),
    ragEnriched: normalizeProjectList(projectInsights.ragEnriched || []),
    geminiNarrative: normalizeProjectList(projectInsights.geminiNarrative || []),
  };
}

function normalizeProjectList(projects = []) {
  return (Array.isArray(projects) ? projects : []).map((project) => ({
    title: project.title || project.name || 'Project',
    summary: project.summary || project.description || '',
    technologies: normalizeList(project.technologies || project.techStack || project.skills || []),
    achievements: normalizeList(project.achievements || project.metrics || project.results || []),
    complexity: project.complexity || project.technicalComplexity || '',
    duration: project.duration || project.timeline || project.period || '',
    sourceLabel: project.sourceLabel || project.source || '',
  }));
}

function normalizeCertifications(certifications = []) {
  return (Array.isArray(certifications) ? certifications : []).map((cert) => {
    if (typeof cert === 'string') {
      return { name: cert, issuer: '', year: '', relevance: '' };
    }
    return {
      name: cert.name || cert.title || '',
      issuer: cert.issuer || cert.organization || '',
      year: cert.year || cert.date || '',
      relevance: cert.relevance || cert.industryRelevance || '',
    };
  }).filter((cert) => cert.name);
}

function countFlatSkills(skills = {}) {
  if (Array.isArray(skills)) return skills.length;
  return Object.values(skills || {}).reduce((count, value) => count + (Array.isArray(value) ? value.length : 0), 0);
}

function mergePayload(dashboardData, latestResume) {
  const analysis = dashboardData?.analysis || dashboardData || {};
  const resume = normalizeResume(dashboardData?.resume || latestResume || {});
  return { analysis, resume };
}

function normalizeResume(resume = {}) {
  const personalInfo = resume.personalInfo || resume.personal_information || {};
  return {
    ...resume,
    personalInfo: {
      ...personalInfo,
      phoneNumber: personalInfo.phoneNumber || personalInfo.phone || '',
    },
    skills: resume.skills || {},
    education: Array.isArray(resume.education) ? resume.education : [],
    projects: Array.isArray(resume.projects) ? resume.projects : [],
    certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
  };
}
