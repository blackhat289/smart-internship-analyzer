import api from './api';

export const resumeService = {
  uploadResume: async (formData) => {
    const { data } = await api.post('/resume/upload', formData);
    return data;
  },
  getLatestResume: async () => {
    const { data } = await api.get('/resume/latest');
    return data;
  },
  parseResume: async (payload) => {
    const { data } = await api.post('/resume/parse', payload);
    return data;
  },
  updateResume: async (payload) => {
    const { data } = await api.put('/resume/update', payload);
    return data;
  },
};
