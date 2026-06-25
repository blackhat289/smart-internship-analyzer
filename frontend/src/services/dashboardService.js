import api from './api';

export const dashboardService = {
  getDashboard: async (userId) => {
    const { data } = await api.get(`/analysis/${userId}`);
    return data;
  },
  generateAnalysis: async (payload) => {
    const { data } = await api.post('/analysis/generate', payload);
    return data;
  },
};
