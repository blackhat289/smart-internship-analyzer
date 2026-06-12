import Card from '../common/Card';

export default function StrengthsCard({ strengths = [] }) {
  return <Card><h3 className="mb-3 font-semibold">Key Strengths</h3><ul className="space-y-2 text-sm text-slate-600">{strengths.map((s) => <li key={s}>• {s}</li>)}</ul></Card>;
}
