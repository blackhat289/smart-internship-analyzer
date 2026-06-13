const SECTION_SPLITTER = /\n\s*\n/g;

function normalizeText(text = '') {
  return text.replace(/\u00a0/g, ' ').replace(/\r/g, '').trim();
}

function uniqueStrings(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

export function extractEmail(text = '') {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : '';
}

export function extractPhone(text = '') {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}/);
  return match ? match[0].trim() : '';
}

export function extractSkills(text = '') {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'React', 'Next.js',
    'HTML', 'CSS', 'Tailwind CSS', 'Python', 'Java', 'C++', 'C#', 'SQL', 'PostgreSQL', 'MySQL',
    'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Git', 'REST API', 'GraphQL', 'Redux',
    'Jest', 'Mocha', 'Chai', 'GitHub Actions', 'CI/CD', 'Firebase', 'FastAPI', 'Django'
  ];

  const normalizedText = text.toLowerCase();
  return uniqueStrings(
    skillKeywords.filter((skill) => normalizedText.includes(skill.toLowerCase()))
  );
}

function sectionBlocks(text) {
  return normalizeText(text)
    .split(SECTION_SPLITTER)
    .map((block) => block.trim())
    .filter(Boolean);
}

function extractItemsFromSection(text, headings) {
  const blocks = sectionBlocks(text);
  const selectedBlock = blocks.find((block) =>
    headings.some((heading) => block.toLowerCase().includes(heading))
  );

  if (!selectedBlock) return [];

  return selectedBlock
    .split(/\n|•|- /g)
    .map((line) => line.trim())
    .filter((line) => line.length > 2)
    .slice(0, 10);
}

export function extractEducation(text = '') {
  return extractItemsFromSection(text, ['education']).map((entry) => ({
    title: entry,
    organization: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  }));
}

export function extractProjects(text = '') {
  return extractItemsFromSection(text, ['projects', 'project']).map((entry) => ({
    title: entry,
    organization: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  }));
}

export function extractExperience(text = '') {
  return extractItemsFromSection(text, ['experience', 'work experience', 'employment']).map((entry) => ({
    title: entry,
    organization: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  }));
}

export function extractCertifications(text = '') {
  const certificationLines = extractItemsFromSection(text, ['certifications', 'certificates', 'licenses']);
  return uniqueStrings(certificationLines);
}

export function extractResumeDataService(text = '') {
  const normalizedText = normalizeText(text);
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const personalInfo = {
    name: lines[0] || '',
    email: extractEmail(normalizedText),
    phone: extractPhone(normalizedText),
    location: '',
  };

  const locationLine = lines.find((line) =>
    /(?:location|address|city|state)/i.test(line)
  );
  if (locationLine) {
    personalInfo.location = locationLine.replace(/^(location|address)\s*:\s*/i, '').trim();
  }

  return {
    personalInfo,
    skills: extractSkills(normalizedText),
    education: extractEducation(normalizedText),
    projects: extractProjects(normalizedText),
    experience: extractExperience(normalizedText),
    certifications: extractCertifications(normalizedText),
  };
}
