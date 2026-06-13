import { getRequiredSkillsForRole } from './readinessScore.service.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export async function strengthsAnalysisService({ selectedRole, skills = [], projects = [] }) {
  const requiredSkills = getRequiredSkillsForRole(selectedRole);
  const candidateSkills = skills.map(normalize);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(normalize(skill)));

  const strengths = [];

  if (matchedSkills.some((skill) => ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'tailwind css'].includes(normalize(skill)))) {
    strengths.push('Strong Frontend Development Skills');
  }

  if (matchedSkills.some((skill) => ['node.js', 'express.js', 'mongodb', 'sql', 'rest api'].includes(normalize(skill)))) {
    strengths.push('Solid Backend and API Fundamentals');
  }

  if (matchedSkills.length >= Math.max(3, Math.ceil(requiredSkills.length * 0.5))) {
    strengths.push('Good Match for the Target Role');
  }

  if (Array.isArray(projects) && projects.length > 0) {
    strengths.push('Relevant Academic or Portfolio Projects');
  }

  if (!strengths.length && matchedSkills.length > 0) {
    strengths.push('Demonstrates Transferable Technical Skills');
  }

  return {
    strengths: [...new Set(strengths)],
  };
}
