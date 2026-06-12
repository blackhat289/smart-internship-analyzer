import axios from 'axios';
import env from '../../config/env.js';

export async function fastapiRequest(path, payload) {
  if (!env.fastapiBaseUrl) return { data: payload };
  const { data } = await axios.post(`${env.fastapiBaseUrl}${path}`, payload);
  return { data };
}
