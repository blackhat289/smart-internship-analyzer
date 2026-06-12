import api from './api';

export const dashboardService = {
  getAnalysis: async (role) => {
    const { data } = await api.get('/dashboard/analysis', { params: { role } });
    return data;
  },
  getRoadmap: async (role) => {
    const { data } = await api.get('/dashboard/roadmap', { params: { role } });
    return data;
  },
  getRecommendations: async (role) => {
    const { data } = await api.get('/dashboard/recommendations', { params: { role } });
    return data;
  },
};
