import { geminiJsonRequest } from '../../integrations/gemini/geminiClient.js';

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

  const isTechLine = (line) =>
    /\b(technologies?|tech stack|built with|tools?|stack|languages?)\s*[:\-]/i.test(line) ||
    /^(technologies?|tech stack|built with|tools?)\s*:/i.test(line);

  const looksLikeTitle = (line) => {
    if (!line || line.length > 100) return false;
    // Bullet points are NOT titles
    if (/^[•\-\*►▶→]\s+/.test(line)) return false;
    // Lines that start with a lowercase word are likely descriptions
    if (/^[a-z]/.test(line)) return false;
    // Skip date-only lines, year ranges, URLs
    if (/^\d{4}[\s\-–—]\d{4}|^\d{4}$|^https?:/i.test(line)) return false;
    // A title is a short, capitalized line — likely a project name
    return true;
  };

  for (const line of section) {
    if (isLikelyHeading(line)) break;
    const clean = line.replace(/^[•\-\*►▶→]\s*/, '').trim();
    if (!clean) continue;

    if (looksLikeTitle(line) && (!current || current.achievements.length > 0 || current.summary)) {
      // Start a new project
      if (current && (current.title || current.summary)) projects.push(current);
      current = { title: clean, summary: '', technologies: [], achievements: [], complexity: '' };
      continue;
    }

    if (!current) {
      current = { title: clean, summary: '', technologies: [], achievements: [], complexity: '' };
      continue;
    }

    if (isTechLine(line)) {
      // Extract tech list from "Technologies: React, Node.js, ..." pattern
      const techPart = clean.replace(/^[^:]+:\s*/i, '');
      current.technologies = unique([
        ...current.technologies,
        ...techPart.split(/[,|\/]/).map((t) => t.trim()).filter((t) => t.length < 40),
      ]);
    } else {
      // It's a description / achievement bullet
      current.achievements.push(clean);
      current.summary = current.summary ? `${current.summary} ${clean}` : clean;
    }
  }

  if (current && (current.title || current.summary)) projects.push(current);

  // Post-process: remove entries where "title" is clearly a description sentence
  return projects
    .filter((p) => p.title && p.title.length < 100 && !/^[a-z]/.test(p.title))
    .slice(0, 8);
}


function parseCertifications(lines) {
  const section = sectionLines(lines, HEADING_ALIASES.certifications);
  return unique(section.map((line) => line.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)).slice(0, 12);
}

export function extractResumeDataHeuristics(text = '') {
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

export async function extractResumeDataService(text = '') {
  console.log('[AI Parser] Starting AI resume extraction...');
  try {
    const prompt = `You are an expert resume parsing assistant. Extract structured information from the resume text below and return a JSON object with EXACTLY the following format:

{
  "personalInfo": {
    "name": "Full Name",
    "email": "Email address",
    "phoneNumber": "Phone number",
    "github": "GitHub URL or empty string",
    "linkedin": "LinkedIn URL or empty string",
    "leetcode": "LeetCode URL or empty string",
    "location": "Location (city, country) or empty string"
  },
  "skills": {
    "programmingLanguages": ["List of programming languages"],
    "frontend": ["Frontend technologies/frameworks"],
    "backend": ["Backend technologies/frameworks"],
    "database": ["Databases"],
    "cloud": ["Cloud technologies/platforms/devops"],
    "aiMl": ["AI/ML libraries/concepts"],
    "tools": ["Developer tools/utilities/other"]
  },
  "education": [
    {
      "degree": "Degree (e.g. B.Tech, Master of Science, High School, etc.)",
      "specialization": "Specialization/Branch (e.g. Computer Science)",
      "institution": "Name of school, college, or university",
      "cgpa": "CGPA, GPA or percentage (e.g. 8.5/10, 92%, 3.8/4.0)",
      "startYear": "Start year (YYYY)",
      "endYear": "End year/Graduation year (YYYY or Present)"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "summary": "Brief 1-2 sentence description of the project",
      "technologies": ["Technologies/skills used in this project"],
      "achievements": ["Key bullet points describing what was done or achieved"],
      "complexity": "Estimated complexity: 'High', 'Medium', or 'Low'"
    }
  ],
  "certifications": ["List of certifications obtained"]
}

Rules:
1. ONLY return the JSON object. Do not include markdown code block formatting or explanations.
2. Be accurate to the text. Do not invent details.
3. For education: every record MUST have both 'degree' and 'institution'. If one is missing or blank, omit the record or try to infer them from the line.
4. For projects: extract all projects listed in the resume. Keep the achievements specific to the resume.

Resume Text:
${text}`;

    const aiResult = await geminiJsonRequest(prompt);
    if (!aiResult?.text) {
      throw new Error('AI response was empty');
    }

    console.log('[AI Parser] AI response received. Parsing JSON payload...');

    let parsed;
    try {
      parsed = JSON.parse(aiResult.text);
    } catch (parseErr) {
      // Sometimes models put json inside markdown blocks even in json mode
      const match = aiResult.text.match(/```json\s*([\s\S]*?)\s*```/) || aiResult.text.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        throw parseErr;
      }
    }

    // Format fields to ensure structural compliance with expectations
    const personalInfo = parsed.personalInfo || {};
    const skills = parsed.skills || {};
    let education = Array.isArray(parsed.education) ? parsed.education : [];
    let projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    let certifications = Array.isArray(parsed.certifications) ? parsed.certifications : [];

    // Clean and validate education to prevent validation failures (degree and institution are required by schema validation)
    education = education
      .map(item => ({
        degree: String(item?.degree || '').trim(),
        specialization: String(item?.specialization || '').trim(),
        institution: String(item?.institution || '').trim(),
        cgpa: String(item?.cgpa || '').trim(),
        startYear: String(item?.startYear || item?.start_year || '').trim(),
        endYear: String(item?.endYear || item?.end_year || item?.graduation_year || '').trim(),
      }))
      .filter(item => item.degree && item.institution);

    projects = projects.map(item => ({
      title: String(item?.title || '').trim(),
      summary: String(item?.summary || '').trim(),
      technologies: Array.isArray(item?.technologies) ? item.technologies.map(String) : [],
      achievements: Array.isArray(item?.achievements) ? item.achievements.map(String) : [],
      complexity: String(item?.complexity || 'Medium').trim(),
    })).filter(item => item.title);

    certifications = certifications.map(String).filter(Boolean);

    console.log(`[AI Parser] AI parsing successful! Extracted:`);
    console.log(` - ${education.length} education items`);
    console.log(` - ${projects.length} projects:`, projects.map(p => p.title).join(', '));
    console.log(` - ${certifications.length} certifications`);

    return {
      personalInfo: {
        name: String(personalInfo.name || '').trim(),
        email: String(personalInfo.email || '').trim(),
        phoneNumber: String(personalInfo.phoneNumber || '').trim(),
        github: String(personalInfo.github || '').trim(),
        linkedin: String(personalInfo.linkedin || '').trim(),
        leetcode: String(personalInfo.leetcode || '').trim(),
        location: String(personalInfo.location || '').trim(),
      },
      skills: {
        programmingLanguages: Array.isArray(skills.programmingLanguages) ? skills.programmingLanguages.map(String) : [],
        frontend: Array.isArray(skills.frontend) ? skills.frontend.map(String) : [],
        backend: Array.isArray(skills.backend) ? skills.backend.map(String) : [],
        database: Array.isArray(skills.database) ? skills.database.map(String) : [],
        cloud: Array.isArray(skills.cloud) ? skills.cloud.map(String) : [],
        aiMl: Array.isArray(skills.aiMl) ? skills.aiMl.map(String) : [],
        tools: Array.isArray(skills.tools) ? skills.tools.map(String) : [],
      },
      education,
      projects,
      certifications,
    };
  } catch (error) {
    console.error('[AI Parser] AI resume parsing failed, falling back to heuristics:', error);
    return extractResumeDataHeuristics(text);
  }
}
