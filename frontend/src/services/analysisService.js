import api from './api';
import axios from 'axios';

const analysisApi = axios.create({
  baseURL: import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000',
});

export const analysisService = {
  analyzeResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await analysisApi.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  getDashboardSnapshot: async () => {
    const raw = localStorage.getItem('sia_dashboard');
    return raw ? JSON.parse(raw) : null;
  },
  saveDashboardSnapshot: async (payload) => {
    localStorage.setItem('sia_dashboard', JSON.stringify(payload));
    return payload;
  },
  getLatestAnalysisByUserId: async () => {
    const raw = localStorage.getItem('sia_dashboard');
    return { data: raw ? JSON.parse(raw) : null };
  },
  generateAnalysis: async (payload) => {
    const { data } = await api.post('/analysis/generate', payload);
    return data;
  },
};
