import axios from 'axios';
import env from '../../config/env.js';

export async function openaiRequest(prompt) {
  if (!env.openaiApiKey) return { text: prompt };
  const { data } = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    },
    { headers: { Authorization: `Bearer ${env.openaiApiKey}` } }
  );
  return { text: data?.choices?.[0]?.message?.content || '' };
}
