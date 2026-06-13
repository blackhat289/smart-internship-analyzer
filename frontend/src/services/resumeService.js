import api from './api';

export const resumeService = {
  uploadResume: async (formData) => {
    const { data } = await api.post('/resume/upload', formData);
    return data;
  },
  parseResume: async (payload) => {
    const { data } = await api.post('/resume/parse', payload);
    return data;
  },
};
