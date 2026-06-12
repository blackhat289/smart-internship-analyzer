export async function internshipRecommendationService(targetRole) {
  return [
    { title: `${targetRole} Intern`, company: 'Sample Studio', location: 'Remote', url: '#' },
    { title: `Junior ${targetRole}`, company: 'Growth Labs', location: 'Bengaluru', url: '#' },
  ];
}
