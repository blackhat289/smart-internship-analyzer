export async function roadmapGeneratorService(skillGaps = []) {
  return skillGaps.length
    ? skillGaps.map((gap) => `Build proficiency in ${gap}`)
    : ['Maintain current learning momentum', 'Polish resume presentation', 'Apply to relevant internships'];
}
