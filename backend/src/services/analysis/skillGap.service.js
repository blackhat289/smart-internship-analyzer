import { getRequiredSkillsForRole } from './readinessScore.service.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export async function skillGapService({ selectedRole, skills = [] }) {
  const requiredSkills = getRequiredSkillsForRole(selectedRole);
  const candidateSkills = new Set(skills.map(normalize));

  const skillGaps = requiredSkills.filter((skill) => !candidateSkills.has(normalize(skill)));

  return {
    skillGaps,
  };
}
