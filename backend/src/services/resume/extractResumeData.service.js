export async function extractResumeDataService(text = '') {
  const normalized = text.toLowerCase();
  const skills = ['react', 'node.js', 'mongodb', 'sql'].filter((skill) => normalized.includes(skill));
  return {
    skills,
    projects: [],
    education: [],
    certifications: [],
    experience: [],
  };
}
