import Card from '../common/Card';

export default function RoadmapCard({ title, items = [] }) {
  return <Card><h3 className="mb-3 font-semibold">{title}</h3><ul className="space-y-2 text-sm text-slate-600">{items.map((item) => <li key={item}>• {item}</li>)}</ul></Card>;
}
