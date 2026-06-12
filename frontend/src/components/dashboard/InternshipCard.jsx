import Card from '../common/Card';

export default function InternshipCard({ internship }) {
  return <Card><h3 className="font-semibold">{internship.title}</h3><p className="text-sm text-slate-500">{internship.company}</p><p className="mt-2 text-sm text-slate-600">{internship.location}</p></Card>;
}
