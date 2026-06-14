export const ROLE_MAPPINGS = {
  'frontend developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'REST API', 'Tailwind CSS'],
  'backend developer': ['Node.js', 'Express.js', 'MongoDB', 'SQL', 'REST API', 'Git'],
  'full stack developer': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'Node.js',
    'Express.js',
    'MongoDB',
    'SQL',
    'REST API',
    'Git',
  ],
  'software engineer': ['Data Structures', 'Algorithms', 'JavaScript', 'Git', 'Testing', 'System Design'],
  'java developer': ['Java', 'Spring Boot', 'OOP', 'SQL', 'REST API', 'Git'],
  'python developer': ['Python', 'Django', 'Flask', 'SQL', 'REST API', 'Git'],
  'data analyst': ['SQL', 'Excel', 'Python', 'Pandas', 'Data Visualization', 'Statistics'],
  'machine learning engineer': ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Structures', 'Algorithms'],
  'devops engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Git'],
};

export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

export function getRequiredSkillsForRole(selectedRole) {
  return ROLE_MAPPINGS[normalizeRole(selectedRole)] || [];
}
