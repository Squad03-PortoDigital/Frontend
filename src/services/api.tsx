import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const basicAuth = localStorage.getItem('auth');
  if (basicAuth && config.headers) {
    config.headers.Authorization = `Basic ${basicAuth}`;
  }
  return config;
});

export default api;
