import Card from '../common/Card';

export default function ReadinessScoreCard({ score = 72 }) {
  return <Card><div className="text-sm text-slate-500">Readiness Score</div><div className="text-4xl font-black text-slate-900">{score}%</div></Card>;
}
