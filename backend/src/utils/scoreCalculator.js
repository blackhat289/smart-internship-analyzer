export function calculateReadinessScore({ skills = [], gaps = [], strengths = [] }) {
  const base = 40;
  const skillBoost = Math.min(skills.length * 5, 30);
  const strengthBoost = Math.min(strengths.length * 3, 15);
  const gapPenalty = Math.min(gaps.length * 4, 25);
  return Math.max(0, Math.min(100, base + skillBoost + strengthBoost - gapPenalty));
}
