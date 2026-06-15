export async function internshipRecommendationService(targetRole) {
  const role = String(targetRole || 'Backend').trim();
  const normalized = role.toLowerCase();

  const missingSkillsByRole = {
    'frontend developer': ['TypeScript', 'Tailwind CSS'],
    'backend developer': ['Docker', 'PostgreSQL'],
    'full stack developer': ['Docker', 'System Design'],
    'data analyst': ['Tableau', 'Statistics'],
    'ai/ml intern': ['TensorFlow', 'PyTorch'],
    'ui/ux intern': ['Figma', 'Prototyping'],
  };

  const missingSkills = missingSkillsByRole[normalized] || ['Git', 'Communication'];

  return [
    {
      company: 'Sample Studio',
      role: `${role} Intern`,
      location: 'Remote',
      match_score: 92,
      required_skills_missing: missingSkills.slice(0, 2),
    },
    {
      company: 'Growth Labs',
      role: `Junior ${role}`,
      location: 'Bengaluru',
      match_score: 84,
      required_skills_missing: missingSkills.slice(0, 1),
    },
    {
      company: 'Launch Pad',
      role: `${role} Trainee`,
      location: 'Hybrid',
      match_score: 76,
      required_skills_missing: missingSkills,
    },
  ];
}
