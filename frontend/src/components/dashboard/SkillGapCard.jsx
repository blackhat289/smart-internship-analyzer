import Card from '../common/Card';

export default function SkillGapCard({ skills = [] }) {
  return <Card><h3 className="mb-3 font-semibold">Missing Skills</h3><div className="flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{skill}</span>)}</div></Card>;
}
