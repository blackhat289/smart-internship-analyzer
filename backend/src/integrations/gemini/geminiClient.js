/**
 * OpenRouter integration for the backend.
 * Drop-in replacement for geminiClient.js — exports the same
 * `geminiRequest` and `geminiJsonRequest` function signatures so
 * the rest of the codebase needs zero changes.
 */

import env from '../../config/env.js';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

/**
 * Parse the text content from an OpenRouter chat/completions response.
 */
function extractText(responseJson = {}) {
  return responseJson?.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Core fetch wrapper for OpenRouter /chat/completions.
 * @param {string} prompt
 * @param {{ jsonMode?: boolean }} options
 */
async function requestOpenRouter(prompt, { jsonMode = false } = {}) {
  if (!env.openrouterApiKey) {
    // Graceful fallback — return empty string so callers don't break
    console.warn('[OpenRouter] openrouterApiKey is not set; returning empty fallback.');
    return { text: '', source: 'fallback' };
  }

  const model = env.openrouterModel || 'openai/gpt-4o-mini';

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  };

  // Ask for JSON output when the caller needs structured data
  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.openrouterApiKey}`,
      'HTTP-Referer': env.clientUrl || 'http://localhost:5173',
      'X-Title': 'Smart Internship Analyzer',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`OpenRouter request failed (${response.status}): ${details || response.statusText}`);
  }

  const json = await response.json();
  return {
    text: extractText(json),
    raw: json,
    source: 'openrouter',
  };
}

/**
 * Plain-text generation — mirrors geminiRequest().
 */
export async function geminiRequest(prompt) {
  return requestOpenRouter(prompt);
}

/**
 * JSON-mode generation — mirrors geminiJsonRequest().
 * The caller already does JSON.parse on `.text`, so we just enable
 * json_object mode and return the raw text string.
 */
export async function geminiJsonRequest(prompt) {
  return requestOpenRouter(prompt, { jsonMode: true });
}
