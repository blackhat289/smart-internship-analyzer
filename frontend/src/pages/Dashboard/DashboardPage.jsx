import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import ReadinessScoreCard from '../../components/dashboard/ReadinessScoreCard';
import StrengthsCard from '../../components/dashboard/StrengthsCard';
import SkillGapCard from '../../components/dashboard/SkillGapCard';
import RoadmapCard from '../../components/dashboard/RoadmapCard';
import InternshipCard from '../../components/dashboard/InternshipCard';
import Card from '../../components/common/Card';
import { resumeService } from '../../services/resumeService';
import { analysisService } from '../../services/analysisService';
import useAuth from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const sanitizeEntry = (value, fallback = '') => {
    const text = String(value || '').trim();
    if (!text) return fallback;
    if (/^(mansi|linkedin|github|education|projects?|experience|certifications?)$/i.test(text)) return fallback;
    if (/^[+()\d\s-]{7,}$/.test(text)) return fallback;
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(text)) return fallback;
    return text;
  };

  const sanitizeList = (items = []) =>
    items
      .map((item) => (typeof item === 'string' ? item : item?.title || item?.description || ''))
      .map((item) => sanitizeEntry(item, ''))
      .filter(Boolean);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [resumeResponse, analysisResponse] = await Promise.all([
          resumeService.getLatestResume(),
          analysisService.getLatestAnalysisByUserId(user?.sub || user?.id || user?._id),
        ]);

        if (!active) return;
        setResume(resumeResponse?.data?.resume || null);
        setAnalysis(analysisResponse?.data?.analysis || null);
      } catch {
        if (!active) return;
        setResume(null);
        setAnalysis(null);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user?.sub, user?.id, user?._id]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <ReadinessScoreCard score={analysis?.readinessScore ?? 0} />
          <StrengthsCard strengths={analysis?.strengths || []} />
        </div>
        <SkillGapCard skills={analysis?.skillGaps || []} />
        <Card>
          <h3 className="mb-3 font-semibold">Extracted Resume Information</h3>
          {resume ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="text-sm font-semibold text-slate-500">Personal Info</div>
                <p className="mt-2 text-sm text-slate-700">{sanitizeEntry(resume.personalInfo?.name, 'Name not found')}</p>
                <p className="text-sm text-slate-700">{sanitizeEntry(resume.personalInfo?.email, 'Email not found')}</p>
                <p className="text-sm text-slate-700">{sanitizeEntry(resume.personalInfo?.phone, 'Phone not found')}</p>
                <p className="text-sm text-slate-700">{sanitizeEntry(resume.personalInfo?.location, 'Location not found')}</p>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sanitizeList(resume.skills).map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Education</div>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {sanitizeList(resume.education).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Projects</div>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {sanitizeList(resume.projects).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Experience</div>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {sanitizeList(resume.experience).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Certifications</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sanitizeList(resume.certifications).map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No resume has been uploaded yet.</p>
          )}
        </Card>
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
