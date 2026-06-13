const ROLE_REQUIREMENTS = {
  'frontend developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'REST API', 'Tailwind CSS'],
  'backend developer': ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'REST API', 'Git'],
  'full stack developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'REST API', 'Git'],
  'software engineer': ['Data Structures', 'Algorithms', 'JavaScript', 'Git', 'Testing', 'System Design'],
  'java developer': ['Java', 'Spring Boot', 'OOP', 'SQL', 'REST API', 'Git'],
  'python developer': ['Python', 'Django', 'Flask', 'SQL', 'REST API', 'Git'],
  'data analyst': ['SQL', 'Excel', 'Python', 'Pandas', 'Data Visualization', 'Statistics'],
  'machine learning engineer': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Structures', 'Algorithms'],
  'devops engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Git'],
};

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export function getRequiredSkillsForRole(selectedRole) {
  return ROLE_REQUIREMENTS[normalize(selectedRole)] || [];
}

export async function readinessScoreService({ selectedRole, skills = [] }) {
  const requiredSkills = getRequiredSkillsForRole(selectedRole);
  if (!requiredSkills.length) {
    return { score: 0 };
  }

  const candidateSkills = skills.map(normalize);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(normalize(skill)));
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    score,
  };
}
