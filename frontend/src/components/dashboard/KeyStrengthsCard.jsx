import Card from '../common/Card';
import SkillChip from '../common/SkillChip';

export default function KeyStrengthsCard({ strengths = [] }) {
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">Key Strengths</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {strengths.length ? strengths.map((item) => <SkillChip key={item} tone="primary">{item}</SkillChip>) : <p className="text-sm text-slate-500">No strengths detected yet.</p>}
      </div>
    </Card>
  );
}
