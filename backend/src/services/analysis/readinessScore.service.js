import { getRequiredSkillsForRole } from '../../utils/roleMappings.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export async function readinessScoreService({ selectedRole, skills = [] }) {
  const requiredSkills = getRequiredSkillsForRole(selectedRole);

  if (!requiredSkills.length) {
    return { score: 0 };
  }

  const candidateSkills = new Set(skills.map(normalize));
  const matchedSkills = requiredSkills.filter((skill) => candidateSkills.has(normalize(skill)));
  const score = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return { score };
}
