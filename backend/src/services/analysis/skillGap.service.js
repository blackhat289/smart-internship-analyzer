import { ROLE_MAPPINGS } from '../../utils/roleMappings.js';

export async function skillGapService(targetRole, extractedData = {}) {
  const required = ROLE_MAPPINGS[targetRole?.toLowerCase()] || [];
  const skills = extractedData.skills || [];
  return required.filter((skill) => !skills.includes(skill));
}
