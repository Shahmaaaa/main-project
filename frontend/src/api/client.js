import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const disasterAPI = {
  // Events
  createEvent: (formData) => apiClient.post('/events/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getEvent: (eventId) => apiClient.get(`/events/${eventId}`),
  listEvents: (page = 1, perPage = 10) => 
    apiClient.get('/events', { params: { page, per_page: perPage } }),
  verifyEvent: (eventId) => apiClient.post(`/events/${eventId}/verify`),

  // Funds
  createFund: (data) => apiClient.post('/funds/create', data),
  getFund: (fundId) => apiClient.get(`/funds/${fundId}`),
  distributeFund: (fundId, data) => apiClient.post(`/funds/${fundId}/distribute`, data),

  // Audit
  getAuditLogs: (page = 1, perPage = 20) =>
    apiClient.get('/audit-logs', { params: { page, per_page: perPage } }),

  // Health
  healthCheck: () => apiClient.get('/health'),
};

export default apiClient;
