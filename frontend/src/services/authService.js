import api from './api';

const tokenKey = 'sia_token';
const userKey = 'sia_user';

export const authService = {
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    localStorage.setItem(tokenKey, data?.token || '');
    localStorage.setItem(userKey, JSON.stringify(data?.user || null));
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem(tokenKey, data?.token || '');
    localStorage.setItem(userKey, JSON.stringify(data?.user || null));
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },
  resetPassword: async (token, password, confirmPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, password, confirmPassword });
    return data;
  },
  logout: () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  },
  getToken: () => localStorage.getItem(tokenKey),
  getUser: () => {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  },
};
