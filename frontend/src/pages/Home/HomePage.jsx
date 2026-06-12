import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">Analyze internship readiness with clarity.</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">Upload a resume, choose a role, and get a recruiter-friendly breakdown of strengths, gaps, roadmap, and opportunities.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/resume-analysis"><Button>Analyze Resume</Button></Link>
            <Button variant="secondary">Login</Button>
            <Button variant="ghost">Register</Button>
          </div>
        </div>
        <Card className="shadow-glow">
          <div className="space-y-3 text-sm text-slate-600">
            <div>Professional dashboard</div>
            <div>Skill gap insights</div>
            <div>Learning roadmap</div>
            <div>Internship recommendations</div>
          </div>
        </Card>
      </section>
    </div>
  );
}
