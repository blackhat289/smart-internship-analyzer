const SECTION_SPLITTER = /\n\s*\n/g;

const KNOWN_SECTION_HEADINGS = [
  'education',
  'projects',
  'project',
  'experience',
  'work experience',
  'employment',
  'certifications',
  'certificates',
  'licenses',
  'skills',
  'technical skills',
  'personal details',
  'personal information',
];

function normalizeText(text = '') {
  return text.replace(/\u00a0/g, ' ').replace(/\r/g, '').trim();
}

function uniqueStrings(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function isNoiseLine(line = '') {
  const value = line.trim();
  if (!value) return true;
  if (/^(linkedin|github|portfolio|email|phone|mobile|contact)\b/i.test(value)) return true;
  if (/https?:\/\//i.test(value)) return true;
  if (/^[+()\d\s-]{7,}$/.test(value)) return true;
  if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(value)) return true;
  if (/^(present|current|education|projects?|experience|certifications?|skills?)$/i.test(value)) return true;
  return false;
}

function isHeadingLine(line = '') {
  const value = line.trim().toLowerCase();
  if (!value) return false;
  return KNOWN_SECTION_HEADINGS.some(
    (heading) => value === heading || value.startsWith(`${heading}:`) || value.startsWith(`${heading} `)
  );
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
    'JavaScript',
    'TypeScript',
    'Node.js',
    'Express',
    'MongoDB',
    'Mongoose',
    'React',
    'Next.js',
    'HTML',
    'CSS',
    'Tailwind CSS',
    'Python',
    'Java',
    'C++',
    'C#',
    'SQL',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'Git',
    'REST API',
    'GraphQL',
    'Redux',
    'Jest',
    'Mocha',
    'Chai',
    'GitHub Actions',
    'CI/CD',
    'Firebase',
    'FastAPI',
    'Django',
  ];

  const normalizedText = text.toLowerCase();
  return uniqueStrings(skillKeywords.filter((skill) => normalizedText.includes(skill.toLowerCase())));
}

function extractSectionLines(text, headings) {
  const lines = normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const headingMatches = headings.map((heading) => heading.toLowerCase());
  const startIndex = lines.findIndex((line) =>
    headingMatches.some((heading) => line.toLowerCase() === heading || line.toLowerCase().startsWith(`${heading}:`))
  );

  if (startIndex === -1) return [];

  const collected = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    const lower = line.toLowerCase();

    if (isHeadingLine(line) && !headingMatches.some((heading) => lower === heading || lower.startsWith(`${heading}:`))) {
      break;
    }

    const splitParts = line.split(/(?:^|\s)[•\-–]\s*/g).map((part) => part.trim()).filter(Boolean);
    for (const part of splitParts) {
      if (!isNoiseLine(part) && part.length >= 3 && !/^\d{1,2}\/\d{2,4}/.test(part)) {
        collected.push(part);
      }
    }
  }

  return uniqueStrings(collected).slice(0, 10);
}

export function extractEducation(text = '') {
  return extractSectionLines(text, ['education']).map((entry) => ({
    title: entry,
    organization: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  }));
}

export function extractProjects(text = '') {
  return extractSectionLines(text, ['projects', 'project']).map((entry) => ({
    title: entry,
    organization: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  }));
}

export function extractExperience(text = '') {
  return extractSectionLines(text, ['experience', 'work experience', 'employment']).map((entry) => ({
    title: entry,
    organization: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
  }));
}

export function extractCertifications(text = '') {
  return extractSectionLines(text, ['certifications', 'certificates', 'licenses']);
}

export function extractResumeDataService(text = '') {
  const normalizedText = normalizeText(text);
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const nameLine = lines.find((line) => {
    if (isNoiseLine(line)) return false;
    if (isHeadingLine(line)) return false;
    if (line.length > 70) return false;
    return /[a-zA-Z]/.test(line);
  });

  const personalInfo = {
    name: nameLine || '',
    email: extractEmail(normalizedText),
    phone: extractPhone(normalizedText),
    location: '',
  };

  const locationLine = lines.find((line) => /(?:location|address|city|state)/i.test(line));
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
