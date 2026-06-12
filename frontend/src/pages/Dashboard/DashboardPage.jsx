import Sidebar from '../../components/layout/Sidebar';
import ReadinessScoreCard from '../../components/dashboard/ReadinessScoreCard';
import StrengthsCard from '../../components/dashboard/StrengthsCard';
import SkillGapCard from '../../components/dashboard/SkillGapCard';
import RoadmapCard from '../../components/dashboard/RoadmapCard';
import InternshipCard from '../../components/dashboard/InternshipCard';

export default function DashboardPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ReadinessScoreCard />
          <StrengthsCard strengths={['Problem solving', 'Communication', 'Project work']} />
        </div>
        <SkillGapCard skills={['React Query', 'System Design', 'SQL']} />
        <div className="grid gap-6 md:grid-cols-3">
          <RoadmapCard title="Technologies to Learn" items={['React', 'Node.js', 'Tailwind CSS']} />
          <RoadmapCard title="Recommended Courses" items={['Frontend Masters', 'Coursera', 'freeCodeCamp']} />
          <RoadmapCard title="Suggested Projects" items={['Portfolio site', 'ATS resume checker', 'Job tracker']} />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <InternshipCard internship={{ title: 'Frontend Intern', company: 'Acme Labs', location: 'Remote' }} />
          <InternshipCard internship={{ title: 'Product Design Intern', company: 'Design Studio', location: 'Bengaluru' }} />
        </div>
      </div>
    </div>
  );
}
