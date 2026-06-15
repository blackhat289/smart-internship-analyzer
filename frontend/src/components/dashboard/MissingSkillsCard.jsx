import Card from '../common/Card';
import SkillChip from '../common/SkillChip';

export default function MissingSkillsCard({ skillGap = {} }) {
  return (
    <Card className="p-5">
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Missing Skills</div>
      <div className="flex flex-wrap gap-2">
        {(skillGap.missing_skills || []).length ? (
          skillGap.missing_skills.map((item) => <SkillChip key={item} tone="warning">{item}</SkillChip>)
        ) : (
          <p className="text-sm text-slate-500">No missing skills identified.</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(skillGap.important_missing_skills || []).map((item) => <SkillChip key={item} tone="danger">{item}</SkillChip>)}
      </div>
    </Card>
  );
}
