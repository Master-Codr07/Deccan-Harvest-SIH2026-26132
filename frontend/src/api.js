import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      const msg = (err.response?.data?.detail || '').toLowerCase();
      const isTokenError = msg.includes('token') || msg.includes('signature') || msg.includes('expired') || msg.includes('not authenticated');
      if (isTokenError) {
        localStorage.removeItem('dh_token');
        localStorage.removeItem('dh_user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login?expired=1';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  verifyRationCard: (cardNumber) => API.post('/auth/verify-ration-card', null, { params: { card_number: cardNumber } }),
  sendOtp: (phone) => API.post('/auth/otp/send', { phone }),
  verifyOtp: (phone, otp) => API.post('/auth/otp/verify', { phone, otp }),
};

export const crops = {
  list: (params) => API.get('/crops/', { params }),
  get: (id) => API.get(`/crops/${id}`),
  create: (data) => API.post('/crops/', data),
  verify: (id, status, notes) => API.post(`/crops/${id}/verify`, null, { params: { status, notes } }),
  delete: (id) => API.delete(`/crops/${id}`),
};

export const upload = {
  image: (formData) => API.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const auctions = {
  list: (params) => API.get('/auctions/', { params }),
  live: () => API.get('/auctions/live'),
  get: (id) => API.get(`/auctions/${id}`),
  create: (data) => API.post('/auctions/', data),
  start: (id) => API.post(`/auctions/${id}/start`),
  end: (id) => API.post(`/auctions/${id}/end`),
  bid: (id, amount) => API.post(`/auctions/${id}/bid`, { amount }),
  bids: (id) => API.get(`/auctions/${id}/bids`),
  won: () => API.get('/auctions/won'),
};

export const escrow = {
  list: () => API.get('/escrow/'),
  hold: (auctionId) => API.post(`/escrow/hold/${auctionId}`),
  release: (id) => API.post(`/escrow/${id}/release`),
  refund: (id) => API.post(`/escrow/${id}/refund`),
};

export const transport = {
  list: (params) => API.get('/transport/', { params }),
  book: (data) => API.post('/transport/', data),
  accept: (id, data) => API.put(`/transport/${id}/accept`, null, { params: data }),
  updateStatus: (id, status) => API.put(`/transport/${id}/status`, null, { params: { status } }),
};

export const warehouse = {
  list: (params) => API.get('/warehouse/', { params }),
  book: (data) => API.post('/warehouse/', data),
  confirm: (id) => API.put(`/warehouse/${id}/confirm`),
  store: (id) => API.put(`/warehouse/${id}/store`),
  release: (id) => API.put(`/warehouse/${id}/release`),
};

export const dashboard = {
  stats: () => API.get('/dashboard/stats'),
  supplyForecast: () => API.get('/dashboard/supply-forecast'),
  recentActivity: () => API.get('/dashboard/recent-activity'),
};

export const ml = {
  predictPrice: (data) => API.post('/ml/predict-price', data),
  recommendCrop: (data) => API.post('/ml/recommend-crop', data),
  assessQuality: (formData) => API.post('/ml/assess-quality', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const market = {
  livePrices: (params) => API.get('/market/live-prices', { params }),
  refresh: () => API.post('/market/refresh'),
};

export default API;
