import Card from '../common/Card';
import SkillChip from '../common/SkillChip';

export default function AtsScoreCard({ ats = {} }) {
  const breakdown = ats.breakdown || {};

  return (
    <Card className="p-5">
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">ATS Score</div>
      <div className="mt-2 text-4xl font-black text-slate-900">{ats.ats_score ?? 0}%</div>
      <div className="mt-4 grid gap-2">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{key.replaceAll('_', ' ')}</span>
            <span className="font-semibold text-slate-800">{Number(value) || 0}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(ats.strengths || []).slice(0, 4).map((item) => (
          <SkillChip key={item} tone="success">{item}</SkillChip>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(ats.issues || []).slice(0, 4).map((item) => (
          <SkillChip key={item} tone="warning">{item}</SkillChip>
        ))}
      </div>
    </Card>
  );
}
