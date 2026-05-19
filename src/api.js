import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.msg ||
      error.response?.data?.error ||
      (error.code === 'ECONNABORTED' ? 'The request took too long. Please try again.' : 'Something went wrong. Please try again.');

    error.userMessage = message;

    if (status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('budgetbrain-avatar');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default api;
