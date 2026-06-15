import Card from '../common/Card';
import SkillChip from '../common/SkillChip';

export default function MissingSkillsCard({ skillGap = {} }) {
  const missing = uniqueList(skillGap.missing_skills || []);
  const important = uniqueList((skillGap.important_missing_skills || []).filter((item) => !missing.includes(item)));

  return (
    <Card className="p-5">
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Missing Skills</div>
      <div className="flex flex-wrap gap-2">
        {missing.length ? (
          missing.map((item) => <SkillChip key={item} tone="warning">{item}</SkillChip>)
        ) : (
          <p className="text-sm text-slate-500">No missing skills identified.</p>
        )}
      </div>
      {important.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {important.map((item) => <SkillChip key={item} tone="danger">{item}</SkillChip>)}
        </div>
      ) : null}
    </Card>
  );
}

function uniqueList(items = []) {
  return [...new Set((items || []).map((item) => (typeof item === 'string' ? item.trim() : item)).filter(Boolean))];
}
