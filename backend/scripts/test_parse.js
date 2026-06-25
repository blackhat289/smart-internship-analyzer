import fs from 'fs';
import { parseResumeService } from '../src/services/resume/parseResume.service.js';

async function run() {
  try {
    const text = await parseResumeService('uploads/resumes/1782414715165-MANSI_Resume.pdf');
    fs.writeFileSync('extracted_raw_text.txt', text);
    console.log("Raw text length:", text.length);
    console.log("Written to extracted_raw_text.txt");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
