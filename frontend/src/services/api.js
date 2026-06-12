import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sia_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data;
    const details = Array.isArray(payload?.details) ? payload.details.join(', ') : payload?.details;
    const message = payload?.message || error.message || 'Request failed';
    return Promise.reject(details ? `${message}: ${details}` : message);
  }
);

export default api;
