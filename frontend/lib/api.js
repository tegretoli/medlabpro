import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Patients
export const patientsAPI = {
  getAll: (params) => api.get('/patients', { params }),
  getOne: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

// Analyses
export const analysesAPI = {
  getAll: (params) => api.get('/analyses', { params }),
  getOne: (id) => api.get(`/analyses/${id}`),
  create: (data) => api.post('/analyses', data),
  update: (id, data) => api.put(`/analyses/${id}`, data),
  delete: (id) => api.delete(`/analyses/${id}`),
};

// Results
export const resultsAPI = {
  getAll: (params) => api.get('/results', { params }),
  getOne: (id) => api.get(`/results/${id}`),
  create: (data) => api.post('/results', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  validate: (id, level) => api.post(`/results/${id}/validate`, { level }),
  downloadPdf: (id) => `${API_URL}/pdf/result/${id}`,
};

// Referrers
export const referrersAPI = {
  getAll: (params) => api.get('/referrers', { params }),
  getOne: (id) => api.get(`/referrers/${id}`),
  getStats: (id, params) => api.get(`/referrers/${id}/stats`, { params }),
  create: (data) => api.post('/referrers', data),
  update: (id, data) => api.put(`/referrers/${id}`, data),
};

// Departments
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Billing
export const billingAPI = {
  getReport: (params) => api.get('/billing/report', { params }),
  getCollaboratorInvoice: (referrerId, params) => api.get(`/billing/collaborator-invoice/${referrerId}`, { params }),
  createInvoice: (data) => api.post('/billing/invoices', data),
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
  uploadLogo: (formData) => api.post('/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Users
export const usersAPI = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Audit
export const auditAPI = {
  getAll: (params) => api.get('/audit', { params }),
};
