import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Public API calls
export const goldAPI = {
  getRates: () => api.get('/gold-rates'),
  refreshRates: () => api.post('/admin/gold-rates/refresh'),
};

export const calculatorAPI = {
  calculate: (data) => api.post('/calculator', data),
};

export const categoriesAPI = {
  getAll: (activeOnly = true) => api.get(`/categories?active_only=${activeOnly}`),
  getById: (id) => api.get(`/categories/${id}`),
  getDescendants: (id) => api.get(`/categories/${id}/descendants`),
  getFilterAttributes: (id) => api.get(`/categories/${id}/filter-attributes`),
};

export const filterAttributesAPI = {
  getByCategory: (categoryId) => api.get(`/categories/${categoryId}/filter-attributes`),
};

export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

export const customOrderAPI = {
  create: (data) => api.post('/custom-orders', data),
};

export const orderAPI = {
  track: (orderId) => api.get(`/track/${orderId}`),
  trackByPhone: (phone) => api.get('/track', { params: { phone } }),
};

export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
};

export const schemesAPI = {
  getAll: () => api.get('/schemes'),
  getById: (id) => api.get(`/schemes/${id}`),
  enroll: (data) => api.post('/scheme-enrollments', data),
};

export const schemeEnrollmentsAPI = {
  getByPhone: (phone) => api.get(`/scheme-enrollments/by-phone/${encodeURIComponent(phone)}`),
};

export const gemstonesAPI = {
  getAll: () => api.get('/gemstones'),
};

export const spiritualArticleTypesAPI = {
  getAll: () => api.get('/spiritual-article-types'),
};

export const spiritualInquiriesAPI = {
  create: (data) => api.post('/spiritual-inquiries', data),
};


// Admin API calls
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getMe: () => api.get('/admin/me'),
  
  dashboard: {
    getStats: () => api.get('/admin/dashboard'),
  },
  
  categories: {
    getAll: () => api.get('/admin/categories'),
    create: (data) => api.post('/admin/categories', data),
    update: (id, data) => api.put(`/admin/categories/${id}`, data),
    delete: (id) => api.delete(`/admin/categories/${id}`),
  },

  filterAttributes: {
    getByCategory: (categoryId) => api.get(`/admin/categories/${categoryId}/filter-attributes`),
    create: (data) => api.post('/admin/filter-attributes', data),
    update: (id, data) => api.put(`/admin/filter-attributes/${id}`, data),
    delete: (id) => api.delete(`/admin/filter-attributes/${id}`),
  },
  
  products: {
    getAll: (params = {}) => api.get('/products?active_only=false', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/admin/products', data),
    update: (id, data) => api.put(`/admin/products/${id}`, data),
    delete: (id) => api.delete(`/admin/products/${id}`),
  },
  
  orders: {
    getAll: () => api.get('/admin/orders'),
    create: (data) => api.post('/admin/orders', data),
    update: (id, data) => api.put(`/admin/orders/${id}`, data),
    updateStatus: (id, status, extra = {}) => api.put(`/admin/orders/${id}`, { order_status: status, ...extra }),
  },
  
  customers: {
    getAll: () => api.get('/admin/customers'),
    getById: (id) => api.get(`/admin/customers/${id}`),
  },
  
  customOrders: {
    getAll: () => api.get('/admin/custom-orders'),
    updateStatus: (id, status) => api.put(`/admin/custom-orders/${id}`, null, { params: { status } }),
    update: (id, data) => api.put(`/admin/custom-orders/${id}`, null, { params: data }),
    delete: (id) => api.delete(`/admin/custom-orders/${id}`),
  },

  schemes: {
    getAll: () => api.get('/admin/schemes'),
    create: (data) => api.post('/admin/schemes', data),
    update: (id, data) => api.put(`/admin/schemes/${id}`, data),
    delete: (id) => api.delete(`/admin/schemes/${id}`),
  },

  schemeEnrollments: {
    getAll: () => api.get('/admin/scheme-enrollments'),
    getById: (id) => api.get(`/admin/scheme-enrollments/${id}`),
    create: (payload) => api.post('/admin/scheme-enrollments', payload),
    updateStatus: (id, status) => api.put(`/admin/scheme-enrollments/${id}/status`, null, { params: { status } }),
    delete: (id) => api.delete(`/admin/scheme-enrollments/${id}`),
    logPayment: (id, payment) => api.post(`/admin/scheme-enrollments/${id}/payments`, payment),
    forfeitMonth: (id, payload) => api.post(`/admin/scheme-enrollments/${id}/forfeit-month`, payload),
  },

  gemstones: {
    getAll: () => api.get('/admin/gemstones'),
    create: (data) => api.post('/admin/gemstones', data),
    update: (id, data) => api.put(`/admin/gemstones/${id}`, data),
    delete: (id) => api.delete(`/admin/gemstones/${id}`),
  },

  spiritualArticleTypes: {
    getAll: () => api.get('/admin/spiritual-article-types'),
    create: (data) => api.post('/admin/spiritual-article-types', data),
    update: (id, data) => api.put(`/admin/spiritual-article-types/${id}`, data),
    delete: (id) => api.delete(`/admin/spiritual-article-types/${id}`),
  },

  spiritualInquiries: {
    getAll: () => api.get('/admin/spiritual-inquiries'),
    updateStatus: (id, status) => api.put(`/admin/spiritual-inquiries/${id}/status`, null, { params: { status } }),
    delete: (id) => api.delete(`/admin/spiritual-inquiries/${id}`),
  },
  
  settings: {
    get: () => api.get('/admin/settings'),
    update: (data) => api.put('/admin/settings', data),
    uploadLogo: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/admin/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },
};
