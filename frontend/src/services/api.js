import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

// Interceptor to attach JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me')
};

export const publicAPI = {
  submitContactForm: (data) => API.post('/public/contact', data)
};

export const leadAPI = {
  getAll: (params) => API.get('/leads', { params }),
  getById: (id) => API.get(`/leads/${id}`),
  create: (data) => API.post('/leads', data),
  updateStatus: (id, status) => API.patch(`/leads/${id}/status`, { status }),
  addNote: (id, note) => API.post(`/leads/${id}/notes`, { note }),
  delete: (id) => API.delete(`/leads/${id}`),
  getAnalytics: () => API.get('/leads/analytics'),
  exportCSV: () => API.get('/leads/export', { responseType: 'blob' })
};

export default API;
