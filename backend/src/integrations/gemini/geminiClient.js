import env from '../../config/env.js';

function extractText(responseJson = {}) {
  const parts = responseJson?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part?.text || '').join('\n').trim();
}

async function requestGemini(prompt, { responseMimeType = 'text/plain' } = {}) {
  if (!env.geminiApiKey) {
    return { text: prompt, source: 'fallback' };
  }

  const model = env.geminiModel || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Gemini request failed (${response.status}): ${details || response.statusText}`);
  }

  const json = await response.json();
  return {
    text: extractText(json),
    raw: json,
    source: 'gemini',
  };
}

export async function geminiRequest(prompt) {
  return requestGemini(prompt);
}

export async function geminiJsonRequest(prompt) {
  return requestGemini(prompt, { responseMimeType: 'application/json' });
}
