import mongoose from 'mongoose';
import env from '../src/config/env.js';
import Resume from '../src/models/Resume.js';
import { parseResumeService } from '../src/services/resume/parseResume.service.js';
import { extractResumeDataService } from '../src/services/resume/extractResumeData.service.js';

const args = new Set(process.argv.slice(2));
const applyChanges = args.has('--apply');

function flattenSkills(categories = {}) {
  return [...new Set(Object.values(categories).flatMap((value) => (Array.isArray(value) ? value : [])))];
}

function isBrokenEducation(education = []) {
  if (!Array.isArray(education) || !education.length) return true;
  return education.some((item) => {
    const degree = String(item?.degree || '').trim().toLowerCase();
    const institution = String(item?.institution || '').trim().toLowerCase();
    return !degree || !institution || /examination|institute|year|cpi|percentage/.test(`${degree} ${institution}`);
  });
}

function normalizeEducation(education = []) {
  return (Array.isArray(education) ? education : []).map((item) => ({
    degree: String(item?.degree || '').trim(),
    specialization: String(item?.specialization || '').trim(),
    institution: String(item?.institution || '').trim(),
    cgpa: String(item?.cgpa || '').trim(),
    startYear: String(item?.startYear || item?.start_year || '').trim(),
    endYear: String(item?.endYear || item?.end_year || item?.graduation_year || '').trim(),
    percentage: String(item?.percentage || '').trim(),
  }));
}

async function main() {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  });

  const resumes = await Resume.find({}).sort({ createdAt: -1 });
  let scanned = 0;
  let wouldUpdate = 0;
  let updated = 0;

  for (const resume of resumes) {
    scanned += 1;
    if (!isBrokenEducation(resume.education)) continue;
    if (!resume.storedFilePath) continue;

    try {
      const text = resume.resumeText || (await parseResumeService(resume.storedFilePath));
      const extracted = extractResumeDataService(text);
      const newEducation = normalizeEducation(extracted.education);
      const before = normalizeEducation(resume.education);

      if (!newEducation.length) {
        console.log(`\n[SKIP] ${resume._id} no structured education could be extracted.`);
        continue;
      }

      wouldUpdate += 1;
      console.log(`\n[${applyChanges ? 'APPLY' : 'DRY RUN'}] ${resume._id}`);
      console.log('Before:', JSON.stringify(before, null, 2));
      console.log('After :', JSON.stringify(newEducation, null, 2));

      if (!applyChanges) {
        continue;
      }

      const parseQuality = {
        source: 'backfill',
        status: 'fallback',
        notes: [
          !extracted.personalInfo?.name ? 'Name missing or inferred' : '',
          !extracted.personalInfo?.email ? 'Email missing or inferred' : '',
          !flattenSkills(extracted.skills).length ? 'Skills parsed from fallback rules' : '',
          'Education repaired by backfill',
        ].filter(Boolean),
      };

      await Resume.findByIdAndUpdate(resume._id, {
        $set: {
          resumeText: text,
          personalInfo: extracted.personalInfo,
          skills: extracted.skills,
          education: newEducation,
          projects: extracted.projects,
          certifications: extracted.certifications,
          parseQuality,
        },
      });

      updated += 1;
      console.log(`Updated resume ${resume._id}`);
    } catch (error) {
      console.warn(`Skipped resume ${resume._id}: ${error.message}`);
    }
  }

  console.log(
    `\nBackfill complete. Scanned ${scanned} resumes. ${applyChanges ? `Updated ${updated}` : `Would update ${wouldUpdate}`} resume documents.`
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
