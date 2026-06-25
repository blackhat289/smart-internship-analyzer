const HEADING_ALIASES = {
  skills: ['skills', 'technical skills', 'core competencies', 'technical competency', 'technologies'],
  education: ['education', 'academic details', 'academics', 'academics & education'],
  projects: ['projects', 'academic projects', 'personal projects', 'hands-on work', 'project experience'],
  certifications: ['certificates', 'certifications', 'achievements', 'credentials', 'certification'],
  experience: ['experience', 'work experience', 'professional experience', 'employment'],
};

const SKILL_BUCKETS = {
  programmingLanguages: ['python', 'java', 'javascript', 'typescript', 'c++', 'c', 'c#', 'go', 'rust', 'php'],
  frontend: ['react', 'next.js', 'vue', 'angular', 'html', 'css', 'tailwind', 'redux', 'webpack'],
  backend: ['node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'nestjs', 'rest api', 'graphql'],
  database: ['mongodb', 'mysql', 'postgresql', 'postgres', 'redis', 'sqlite', 'oracle', 'sql'],
  cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'firebase', 'vercel'],
  aiMl: ['machine learning', 'deep learning', 'nlp', 'computer vision', 'pytorch', 'tensorflow', 'scikit-learn', 'llm'],
  tools: ['git', 'github', 'jira', 'postman', 'linux', 'ci/cd', 'jenkins', 'figma', 'tableau', 'power bi'],
};

function normalizeText(text = '') {
  return String(text).replace(/\u00a0/g, ' ').replace(/\r/g, '');
}

function unique(items = []) {
  return [...new Set(items.map((item) => String(item || '').trim()).filter(Boolean))];
}

function normalizeUrl(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  if (/^(www\.|github\.com|linkedin\.com|leetcode\.com)/i.test(text)) return `https://${text.replace(/^www\./i, '')}`;
  return text;
}

function findHeadingIndex(lines, aliases) {
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());
  return lines.findIndex((line) => {
    const value = line.toLowerCase();
    return normalizedAliases.some((alias) => value === alias || value.startsWith(`${alias}:`) || value.startsWith(`${alias} `));
  });
}

function isLikelyHeading(line = '') {
  const value = line.trim().toLowerCase();
  if (!value) return false;
  if (value.length > 45) return false;
  return Object.values(HEADING_ALIASES).flat().some((alias) => value === alias || value.startsWith(`${alias}:`));
}

function sectionLines(lines, aliases) {
  const start = findHeadingIndex(lines, aliases);
  if (start === -1) return [];
  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    if (isLikelyHeading(line) && findHeadingIndex([line], aliases) === -1) break;
    collected.push(line);
  }
  return collected;
}

function extractContact(lines, text) {
  const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3,4}\)?[-.\s]?)\d{3,4}[-.\s]?\d{4}/);
  const github = lines.find((line) => /github\.com/i.test(line)) || '';
  const linkedin = lines.find((line) => /linkedin\.com/i.test(line)) || '';
  const leetcode = lines.find((line) => /leetcode\.com/i.test(line)) || '';
  const name = lines.find((line) => line && !/@/.test(line) && !/github\.com|linkedin\.com|leetcode\.com/i.test(line) && line.length < 80) || '';

  return {
    name,
    email: emailMatch ? emailMatch[0] : '',
    phoneNumber: phoneMatch ? phoneMatch[0].trim() : '',
    github: normalizeUrl(github),
    linkedin: normalizeUrl(linkedin),
    leetcode: normalizeUrl(leetcode),
  };
}

function parseSkills(text, lines) {
  const skillSet = new Set();
  const normalizedText = text.toLowerCase();
  for (const bucket of Object.values(SKILL_BUCKETS)) {
    for (const skill of bucket) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(`\\b${escaped}\\b`, 'i');
      if (rx.test(normalizedText)) skillSet.add(skill);
    }
  }
  const section = sectionLines(lines, HEADING_ALIASES.skills);
  for (const line of section) {
    line.split(/[,|/•;-]/).map((item) => item.trim()).filter(Boolean).forEach((item) => skillSet.add(item));
  }
  return categorizeSkills([...skillSet]);
}

function categorizeSkills(skills) {
  const result = {
    programmingLanguages: [],
    frontend: [],
    backend: [],
    database: [],
    cloud: [],
    aiMl: [],
    tools: [],
  };
  for (const skill of unique(skills)) {
    const lower = skill.toLowerCase();
    if (SKILL_BUCKETS.programmingLanguages.some((item) => lower.includes(item))) result.programmingLanguages.push(skill);
    else if (SKILL_BUCKETS.frontend.some((item) => lower.includes(item))) result.frontend.push(skill);
    else if (SKILL_BUCKETS.backend.some((item) => lower.includes(item))) result.backend.push(skill);
    else if (SKILL_BUCKETS.database.some((item) => lower.includes(item))) result.database.push(skill);
    else if (SKILL_BUCKETS.cloud.some((item) => lower.includes(item))) result.cloud.push(skill);
    else if (SKILL_BUCKETS.aiMl.some((item) => lower.includes(item))) result.aiMl.push(skill);
    else result.tools.push(skill);
  }
  return result;
}

function parseEducation(lines) {
  const section = sectionLines(lines, HEADING_ALIASES.education);
  const records = [];
  let current = null;

  const pushCurrent = () => {
    if (!current) return;
    const normalized = normalizeEducationItem(current);
    if (normalized.degree || normalized.institution || normalized.cgpa || normalized.startYear || normalized.endYear) {
      records.push(normalized);
    }
    current = null;
  };

  for (let index = 0; index < section.length; index += 1) {
    const line = section[index].trim();
    if (!line || isLikelyHeading(line) || isEducationNoise(line)) continue;

    const yearLine = extractYearRange(line);
    const scoreLine = extractScore(line);
    const degreeLine = looksLikeEducationDegree(line);

    if (!current && !degreeLine && !yearLine && !scoreLine) {
      continue;
    }

    if (degreeLine) {
      pushCurrent();
      current = {
        degree: cleanEducationValue(stripDegreeNoise(line)),
        institution: '',
        cgpa: '',
        startYear: '',
        endYear: '',
      };
      continue;
    }

    if (!current) {
      current = {
        degree: '',
        institution: '',
        cgpa: '',
        startYear: '',
        endYear: '',
      };
    }

    if (!current.degree && looksLikeEducationDegree(line)) {
      current.degree = cleanEducationValue(stripDegreeNoise(line));
      continue;
    }

    if (!current.institution && !yearLine && !scoreLine && !isEducationNoise(line)) {
      current.institution = cleanEducationValue(line);
      continue;
    }

    if (yearLine) {
      current.startYear = current.startYear || yearLine.start;
      current.endYear = yearLine.end;
      continue;
    }

    if (scoreLine) {
      current.cgpa = scoreLine;
      continue;
    }
  }

  pushCurrent();
  const normalized = records
    .map((item) => normalizeEducationItem(item))
    .filter((item) => item.degree || item.institution || item.cgpa || item.startYear || item.endYear);
  return normalized.slice(0, 6);
}

function isEducationNoise(line = '') {
  const value = line.toLowerCase();
  return [
    'examination',
    'institute',
    'year',
    'cpi',
    'percentage',
    'aggregate',
    'marks',
    'subjects',
    'board',
  ].some((token) => value === token || value.includes(`${token}/`) || value.includes(`${token}%`) || value.includes(`${token}:`));
}

function looksLikeEducationDegree(line = '') {
  return /\b(b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?e|m\.?e|bca|mca|mba|phd|doctorate|intermediate|higher secondary|secondary|10th|12th|bachelor|master|diploma)\b/i.test(line);
}

function stripDegreeNoise(line = '') {
  return String(line)
    .replace(/\b(?:graduation|education|examination|institute|year|cpi|percentage)\b.*$/i, '')
    .split(/\s+in\s+/i)[0]
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractYearRange(line = '') {
  const match = line.match(/\b(?<start>19\d{2}|20\d{2})\s*(?:-|to|–|—)\s*(?<end>19\d{2}|20\d{2}|present|current)\b/i);
  if (!match?.groups) return null;
  return {
    start: match.groups.start,
    end: /present|current/i.test(match.groups.end) ? 'Present' : match.groups.end,
  };
}

function extractScore(line = '') {
  const match = line.match(/\b(?:cgpa|gpa|cpi|percentage)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  if (match) return match[1];
  const loneScore = line.match(/^\d{1,3}(?:\.\d+)?$/);
  return loneScore ? loneScore[0] : '';
}

function extractSpecialization(line = '') {
  const match = line.match(/\b(?:in|of|for)\s+([^,()\n]+)/i);
  return match ? cleanEducationValue(match[1]) : '';
}

function extractInstitution(line = '') {
  const knownStops = ['2020', '2021', '2022', '2023', '2024', 'present', 'current', 'cgpa', 'gpa', 'cpi', 'percentage'];
  const parts = line.split(/[,|]/).map((part) => part.trim()).filter(Boolean);
  const candidate = parts.find((part) => !knownStops.some((stop) => part.toLowerCase().includes(stop)) && part.length > 3 && !/\b(b\.?tech|m\.?tech|b\.?sc|m\.?sc|b\.?e|m\.?e|bca|mca|mba|phd|bachelor|master|diploma)\b/i.test(part));
  return candidate ? cleanEducationValue(candidate) : '';
}

function cleanEducationValue(value = '') {
  return String(value).replace(/\s{2,}/g, ' ').replace(/[|]+/g, ' ').trim();
}

function normalizeEducationItem(item = {}) {
  const degree = cleanEducationValue(item.degree || '');
  const specialization = cleanEducationValue(item.specialization || '');
  const institution = cleanEducationValue(item.institution || '');
  const startYear = cleanEducationValue(item.startYear || '');
  const endYear = cleanEducationValue(item.endYear || '');
  const cgpa = cleanEducationValue(item.cgpa || '');
  return { degree, specialization, institution, startYear, endYear, cgpa };
}

function parseProjects(lines) {
  const section = sectionLines(lines, HEADING_ALIASES.projects);
  const projects = [];
  let current = null;
  for (const line of section) {
    if (isLikelyHeading(line)) break;
    const titleLike = !/^[•\-*]\s*/.test(line) && line.length < 120;
    if (titleLike || !current) {
      if (current) projects.push(current);
      current = { title: line, summary: '', technologies: [], achievements: [], complexity: '' };
      continue;
    }
    const clean = line.replace(/^[•\-*]\s*/, '').trim();
    if (/technology|stack|built with|using/i.test(clean)) {
      current.technologies = unique([...current.technologies, ...clean.split(/[,|/]/).map((item) => item.trim())]);
    } else if (clean) {
      current.achievements.push(clean);
      current.summary = current.summary ? `${current.summary} ${clean}` : clean;
    }
  }
  if (current) projects.push(current);
  return projects.slice(0, 8);
}

function parseCertifications(lines) {
  const section = sectionLines(lines, HEADING_ALIASES.certifications);
  return unique(section.map((line) => line.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)).slice(0, 12);
}

export function extractResumeDataService(text = '') {
  const normalizedText = normalizeText(text);
  const lines = normalizedText.split('\n').map((line) => line.trim()).filter(Boolean);
  const personalInfo = extractContact(lines, normalizedText);
  return {
    personalInfo,
    skills: parseSkills(normalizedText, lines),
    education: parseEducation(lines),
    projects: parseProjects(lines),
    certifications: parseCertifications(lines),
  };
}
