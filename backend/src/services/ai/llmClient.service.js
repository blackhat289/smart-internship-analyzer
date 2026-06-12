import { openaiRequest } from '../../integrations/openai/openaiClient.js';
import { geminiRequest } from '../../integrations/gemini/geminiClient.js';
import env from '../../config/env.js';

export const llmClientService = {
  generate: async (prompt) => {
    if (env.aiProvider === 'openai') return openaiRequest(prompt);
    if (env.aiProvider === 'gemini') return geminiRequest(prompt);
    return { text: prompt };
  },
};
