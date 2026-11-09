import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('oka_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('oka_token');
      localStorage.removeItem('oka_user');
      // Only redirect when inside the /admin area
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login:         (data)  => api.post('/auth/login', data),
  getMe:         ()      => api.get('/auth/me'),
  updateProfile: (data)  => api.put('/auth/profile', data),
};

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaignApi = {
  getAll:    (params = {}) => api.get('/campaigns', { params }),
  getBySlug: (slug)        => api.get(`/campaigns/slug/${slug}`),
  getById:   (id)          => api.get(`/campaigns/${id}`),
  create:    (data)        => api.post('/campaigns', data),
  update:    (id, data)    => api.put(`/campaigns/${id}`, data),
  delete:    (id)          => api.delete(`/campaigns/${id}`),
  addUpdate: (id, data)    => api.post(`/campaigns/${id}/updates`, data),
};

// ─── Donations ────────────────────────────────────────────────────────────────
export const donationApi = {
  createPaymentIntent: (data)     => api.post('/donations/create-payment-intent', data),
  confirm:             (data)     => api.post('/donations/confirm', data),
  getReceipt:          (num)      => api.get(`/donations/receipt/${num}`),
  getAll:              (params)   => api.get('/donations', { params }),
  // Paystack
  initiatePaystack:    (data)     => api.post('/donations/initiate-paystack', data),
  verifyPaystack:      (ref, params) => api.get(`/donations/verify-paystack/${ref}`, { params }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  getDashboard:   ()  => api.get('/analytics/dashboard'),
  getPublicImpact: () => api.get('/analytics/public-impact'),
};

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadApi = {
  images: (formData) =>
    api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  single: (formData) =>
    api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (publicId) => api.delete(`/upload/${encodeURIComponent(publicId)}`),
};

export default api;
