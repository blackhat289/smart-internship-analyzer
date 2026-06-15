import api from './api';

export const dashboardService = {
  getAnalysis: async (role) => {
    const { data } = await api.get('/resume/latest', { params: { role } });
    return data;
  },
  getRoadmap: async (role) => {
    const { data } = await api.get('/recommendations', { params: { role } });
    return data;
  },
  getRecommendations: async (role) => {
    const { data } = await api.get('/recommendations', { params: { role } });
    return data;
  },
};
