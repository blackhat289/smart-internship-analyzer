import ScoreCard from '../common/ScoreCard';

export default function ReadinessScoreCard({ readiness = {} }) {
  return (
    <ScoreCard
      title="Readiness Score"
      value={readiness.overall ?? 0}
      progress={readiness.overall ?? 0}
      details={[
        { label: 'Skills', value: `${readiness.skills_score ?? 0}%` },
        { label: 'Projects', value: `${readiness.projects_score ?? 0}%` },
        { label: 'Experience', value: `${readiness.experience_score ?? 0}%` },
        { label: 'Certifications', value: `${readiness.certification_score ?? 0}%` },
      ]}
    />
  );
}
