import api from './api';

const tokenKey = 'sia_token';
const userKey = 'sia_user';

export const authService = {
  login: async (payload) => {
    const response = await api.post('/auth/login', {
      ...payload,
      email: String(payload?.email || '').trim().toLowerCase(),
    });
    const authData = response?.data?.data || {};
    localStorage.setItem(tokenKey, authData?.token || '');
    localStorage.setItem(userKey, JSON.stringify(authData?.user || null));
    return authData;
  },
  register: async (payload) => {
    const response = await api.post('/auth/register', {
      ...payload,
      email: String(payload?.email || '').trim().toLowerCase(),
    });
    const authData = response?.data?.data || {};
    localStorage.setItem(tokenKey, authData?.token || '');
    localStorage.setItem(userKey, JSON.stringify(authData?.user || null));
    return authData;
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
