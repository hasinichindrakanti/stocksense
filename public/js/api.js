// Centralized API Client
const API = {
  baseUrl: '',

  async request(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('stocksense_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      };

      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Server error occurred');
        }
        return data;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Network request failed');
      }

      return res;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      Toast.error(err.message);
      throw err;
    }
  },

  // Auth
  login: (creds) => API.request('/api/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
  register: (data) => API.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => API.request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload) => API.request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => API.request('/api/auth/me'),

  // Dashboard
  getStats: () => API.request('/api/dashboard/stats'),
  getFilteredDocuments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/dashboard/filtered?${q}`);
  },

  // Products & Categories
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/products?${q}`);
  },
  createProduct: (data) => API.request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => API.request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => API.request(`/api/products/${id}`, { method: 'DELETE' }),

  getCategories: () => API.request('/api/categories'),
  createCategory: (data) => API.request('/api/categories', { method: 'POST', body: JSON.stringify(data) }),

  getReorderingRules: () => API.request('/api/reordering-rules'),
  createDraftReceiptFromAlert: (productId) => API.request('/api/reordering-rules/create-draft-receipt', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId })
  }),

  // Operations
  getReceipts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/receipts?${q}`);
  },
  createReceipt: (data) => API.request('/api/receipts', { method: 'POST', body: JSON.stringify(data) }),
  validateReceipt: (id) => API.request(`/api/receipts/${id}/validate`, { method: 'POST' }),
  updateReceiptStatus: (id, status) => API.request(`/api/receipts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getDeliveries: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/deliveries?${q}`);
  },
  createDelivery: (data) => API.request('/api/deliveries', { method: 'POST', body: JSON.stringify(data) }),
  validateDelivery: (id) => API.request(`/api/deliveries/${id}/validate`, { method: 'POST' }),
  updateDeliveryStatus: (id, status) => API.request(`/api/deliveries/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getTransfers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/transfers?${q}`);
  },
  createTransfer: (data) => API.request('/api/transfers', { method: 'POST', body: JSON.stringify(data) }),
  validateTransfer: (id) => API.request(`/api/transfers/${id}/validate`, { method: 'POST' }),

  getAdjustments: () => API.request('/api/adjustments'),
  createAdjustment: (data) => API.request('/api/adjustments', { method: 'POST', body: JSON.stringify(data) }),

  // Ledger
  getLedger: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/ledger?${q}`);
  },

  // Warehouses & Locations
  getWarehouses: () => API.request('/api/warehouses'),
  createWarehouse: (data) => API.request('/api/warehouses', { method: 'POST', body: JSON.stringify(data) }),
  getLocations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return API.request(`/api/locations?${q}`);
  },
  createLocation: (data) => API.request('/api/locations', { method: 'POST', body: JSON.stringify(data) }),

  getSuppliers: () => API.request('/api/suppliers'),
  getCustomers: () => API.request('/api/customers'),

  // Search & Demo
  search: (q) => API.request(`/api/search?q=${encodeURIComponent(q)}`),
  resetDemo: () => API.request('/api/demo/reset', { method: 'POST' }),
  runGuidedStep: (step) => API.request('/api/demo/guided-step', { method: 'POST', body: JSON.stringify({ step }) })
};

window.API = API;
