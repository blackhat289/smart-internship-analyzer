import api from './api';

export const aiService = {
  getFeedback: async (payload) => {
    const { data } = await api.post('/ai/feedback', payload);
    return data;
  },
  getSuggestions: async (payload) => {
    const { data } = await api.post('/ai/suggestions', payload);
    return data;
  },
  getCareerGuidance: async (payload) => {
    const { data } = await api.post('/ai/guidance', payload);
    return data;
  },
};
