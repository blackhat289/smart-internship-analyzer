import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sia_token');
  config.headers = config.headers || {};

  if (token) config.headers.Authorization = `Bearer ${token}`;

  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  } else if (!config.headers['Content-Type'] && !config.headers['content-type']) {
    config.headers['Content-Type'] = 'application/json';
  }

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
