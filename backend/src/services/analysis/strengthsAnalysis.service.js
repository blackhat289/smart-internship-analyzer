import { getRequiredSkillsForRole } from '../../utils/roleMappings.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export async function strengthsAnalysisService({ selectedRole, skills = [], projects = [] }) {
  const requiredSkills = getRequiredSkillsForRole(selectedRole);
  const candidateSkills = skills.map(normalize);
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.includes(normalize(skill)));

  const strengths = [];

  const frontendSignals = ['react', 'angular', 'vue', 'html', 'css', 'javascript', 'tailwind css'];
  const backendSignals = ['node.js', 'express.js', 'mongodb', 'sql', 'rest api'];
  const dataSignals = ['python', 'sql', 'excel', 'pandas', 'data visualization', 'statistics'];
  const devopsSignals = ['linux', 'docker', 'kubernetes', 'ci/cd', 'aws', 'git'];

  if (matchedSkills.some((skill) => frontendSignals.includes(normalize(skill)))) {
    strengths.push('Strong Frontend Development Skills');
    strengths.push('Good Frontend Fundamentals');
  }

  if (matchedSkills.some((skill) => backendSignals.includes(normalize(skill)))) {
    strengths.push('Solid Backend and API Fundamentals');
  }

  if (matchedSkills.some((skill) => dataSignals.includes(normalize(skill)))) {
    strengths.push('Strong Analytical and Data Handling Skills');
  }

  if (matchedSkills.some((skill) => devopsSignals.includes(normalize(skill)))) {
    strengths.push('Practical DevOps and Deployment Awareness');
  }

  if (matchedSkills.length >= Math.max(3, Math.ceil(requiredSkills.length * 0.5))) {
    strengths.push('Good Match for the Target Role');
  }

  if (Array.isArray(projects) && projects.length > 0) {
    strengths.push('Relevant Academic Projects');
  }

  if (!strengths.length && matchedSkills.length > 0) {
    strengths.push('Demonstrates Transferable Technical Skills');
  }

  return {
    strengths: [...new Set(strengths)],
  };
}
