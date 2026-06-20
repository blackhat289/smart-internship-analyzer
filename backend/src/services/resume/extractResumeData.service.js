const SECTION_SPLITTER = /\n\s*\n/g;

const KNOWN_SECTION_HEADINGS = [
  'education',
  'academic details',
  'academics',
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
  return uniqueStrings(
    skillKeywords.filter((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
      return pattern.test(normalizedText);
    })
  );
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
  const lines = extractSectionLines(text, ['education', 'academic details', 'academics']);
  const records = [];
  let current = null;

  const degreeRe = /\b(?:b\.?tech\.?|m\.?tech\.?|b\.?sc\.?|m\.?sc\.?|b\.?e\.?|m\.?e\.?|bca|mca|mba|phd|bachelor[^,\n]*|master[^,\n]*)\b/i;
  const yearRangeRe = /\b(19\d{2}|20\d{2})\s*(?:-|to|–)\s*(19\d{2}|20\d{2}|present|current)\b/i;
  const yearRe = /\b(19\d{2}|20\d{2})\b/g;
  const cgpaRe = /\b(?:cgpa|gpa)\s*[:\-]?\s*(\d+(?:\.\d+)?)\b/i;
  const percentageRe = /\bpercentage\s*[:\-]?\s*(\d+(?:\.\d+)?)\b/i;

  for (const entry of lines) {
    const lower = entry.toLowerCase();
    const isDegreeLine = degreeRe.test(entry) || (!current && /in\s+[a-z]/i.test(entry));

    if (isDegreeLine) {
      if (current) records.push(current);
      const degreeMatch = entry.match(degreeRe);
      const degree = degreeMatch ? degreeMatch[0].replace(/\s+in\s+.*/i, '').trim() : entry;
      const specializationMatch = entry.match(/\b(?:in|of|for)\s+([^,()|]+)$/i);
      current = {
        degree,
        specialization: specializationMatch ? specializationMatch[1].trim() : '',
        institution: '',
        start_year: '',
        graduation_year: '',
        cgpa: '',
        percentage: '',
        title: degree,
        organization: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
      };
      continue;
    }

    if (!current) {
      current = {
        degree: entry,
        specialization: '',
        institution: '',
        start_year: '',
        graduation_year: '',
        cgpa: '',
        percentage: '',
        title: entry,
        organization: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
      };
      continue;
    }

    if (!current.institution && !yearRangeRe.test(entry) && !cgpaRe.test(entry) && !percentageRe.test(entry)) {
      current.institution = entry;
    }

    const rangeMatch = entry.match(yearRangeRe);
    if (rangeMatch) {
      current.start_year = rangeMatch[1];
      if (!/present|current/i.test(rangeMatch[2])) {
        current.graduation_year = rangeMatch[2];
      }
      current.startDate = rangeMatch[1];
      current.endDate = /present|current/i.test(rangeMatch[2]) ? '' : rangeMatch[2];
    } else {
      const years = entry.match(yearRe) || [];
      if (years.length) {
        if (!current.start_year) current.start_year = years[0];
        current.graduation_year = years[years.length - 1];
        current.startDate = current.startDate || years[0];
        current.endDate = current.endDate || years[years.length - 1];
      }
    }

    const cgpaMatch = entry.match(cgpaRe);
    if (cgpaMatch) current.cgpa = cgpaMatch[1];

    const percentageMatch = entry.match(percentageRe);
    if (percentageMatch) current.percentage = percentageMatch[1];

    if (!current.specialization && /\b(?:computer science|information technology|electronics|mechanical|civil|electrical|data science|engineering)\b/i.test(entry)) {
      current.specialization = entry;
    } else if (current.description) {
      current.description += ` | ${entry}`;
    } else {
      current.description = entry;
    }
  }

  if (current) records.push(current);
  return records.slice(0, 8);
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
