import api from './api';

export const resumeService = {
  uploadResume: async (formData) => {
    const { data } = await api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  parseResume: async (payload) => {
    const { data } = await api.post('/resume/parse', payload);
    return data;
  },
};
