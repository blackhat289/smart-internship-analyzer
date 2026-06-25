import Card from '../common/Card';
import SkillChip from '../common/SkillChip';

export function ScoreCard({ title, score = 0, subtitle = '', metrics = [], tone = 'primary' }) {
  const percent = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <Card className="h-auto p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{title}</div>
          <div className="mt-1 text-3xl font-black text-slate-900">{percent}</div>
          {subtitle ? <div className="mt-1 max-w-md text-sm text-slate-500">{subtitle}</div> : null}
        </div>
        <Ring percent={percent} tone={tone} />
      </div>
      {metrics.length ? (
        <div className="mt-5 grid gap-2">
          {metrics.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export function BulletCard({ title, items = [], emptyText = 'No data available.', compact = false }) {
  return (
    <Card className="h-auto p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{title}</div>
      <div className={compact ? 'mt-3 flex flex-wrap gap-2' : 'mt-3 space-y-2'}>
        {items.length
          ? items.map((item) => (
            compact
              ? <SkillChip key={item} tone="warning">{item}</SkillChip>
              : <div key={item} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</div>
          ))
          : <p className="text-sm text-slate-500">{emptyText}</p>}
      </div>
    </Card>
  );
}

export function ProjectInsightCard({ project }) {
  const badgeClass =
    project.sourceLabel === 'Resume Derived'
      ? 'bg-emerald-100 text-emerald-700'
      : project.sourceLabel === 'RAG Enriched'
        ? 'bg-sky-100 text-sky-700'
        : 'bg-slate-100 text-slate-700';
  const visibleTechnologies = (project.technologies || []).slice(0, 5);
  const visibleAchievements = (project.achievements || []).slice(0, 1);
  return (
    <Card className="h-auto p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold tracking-[-0.01em] text-slate-900">{project.title || 'Project'}</div>
          {project.duration ? <div className="mt-1 text-xs text-slate-500">{project.duration}</div> : null}
        </div>
        {project.sourceLabel ? <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${badgeClass}`}>{project.sourceLabel}</span> : null}
      </div>
      {project.summary ? <p className="mt-2 text-sm leading-5 text-slate-600 line-clamp-2">{project.summary}</p> : null}
      {visibleTechnologies.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleTechnologies.map((skill) => <SkillChip key={skill}>{skill}</SkillChip>)}
        </div>
      ) : null}
      {visibleAchievements.length ? (
        <div className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Key achievement:</span> {visibleAchievements[0]}
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {project.complexity ? <span>{project.complexity}</span> : null}
        {project.duration ? <span>• {project.duration}</span> : null}
      </div>
    </Card>
  );
}

export function CertificationCard({ certification }) {
  return (
    <Card className="h-auto p-4">
      <div className="font-semibold text-slate-900">{certification.name || certification}</div>
      <div className="mt-2 text-sm text-slate-600">{certification.industryRelevance || 'Industry relevance not available.'}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(certification.knowledgeAreas || []).map((item) => <SkillChip key={item} tone="warning">{item}</SkillChip>)}
      </div>
    </Card>
  );
}

export function Ring({ percent, tone = 'primary' }) {
  const colors = tone === 'warning' ? 'stroke-amber-500' : 'stroke-[color:var(--color-primary)]';
  const dash = 251;
  const offset = dash - (dash * percent) / 100;
  return (
    <svg viewBox="0 0 100 100" className="h-16 w-16 -rotate-90">
      <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-100" strokeWidth="10" />
      <circle cx="50" cy="50" r="40" className={`fill-none ${colors}`} strokeWidth="10" strokeDasharray={dash} strokeDashoffset={offset} strokeLinecap="round" />
      <text x="50" y="55" textAnchor="middle" className="rotate-90 fill-slate-700 text-[16px] font-bold">{percent}</text>
    </svg>
  );
}
