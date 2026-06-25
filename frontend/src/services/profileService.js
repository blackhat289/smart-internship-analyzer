import api from './api';

export const profileService = {
  getProfile: async () => {
    const { data } = await api.get('/profile');
    return data;
  },
  getResumeProfile: async () => {
    const { data } = await api.get('/resume/latest');
    return data;
  },
  updateProfile: async (payload) => {
    const { data } = await api.put('/profile', payload);
    return data;
  },
};
