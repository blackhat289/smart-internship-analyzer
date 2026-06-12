import fs from 'fs/promises';
export async function parseResumeService(filePath) {
  const buffer = await fs.readFile(filePath);
  return buffer.toString('utf8');
}
