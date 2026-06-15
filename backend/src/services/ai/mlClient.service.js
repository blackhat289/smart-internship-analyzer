import axios from 'axios';
import env from '../../config/env.js';

function buildClient() {
  return axios.create({
    baseURL: env.fastapiBaseUrl || '',
    timeout: 120000,
  });
}

function isEnabled() {
  return Boolean(env.fastapiBaseUrl);
}

async function postIfEnabled(path, payload) {
  if (!isEnabled()) return null;
  const client = buildClient();
  const { data } = await client.post(path, payload);
  return data;
}

export async function extractSkillsFromML(resumeText) {
  return postIfEnabled('/extract-skills', { resumeText });
}

export async function analyzeResumeWithML(payload) {
  return postIfEnabled('/analyze', payload);
}

export async function generateRecommendationsWithML(payload) {
  return postIfEnabled('/recommendations', payload);
}
