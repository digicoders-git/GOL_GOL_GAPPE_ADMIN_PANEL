import axios from 'axios';

// Use production backend URL if available, otherwise localhost
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// console.log('Environment:', import.meta.env.MODE);
// console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
// console.log('Base URL:', baseUrl);
// console.log('Final API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        // console.log(`[API Response] ${response.config.url}`, response.status);
        return response;
    },
    (error) => {
        console.error(`[API Error] ${error.config?.url}`, error.response?.status, error.response?.data);
        
        // For 404 errors on billing routes, log more details
        if (error.response?.status === 404 && error.config?.url?.includes('/billing')) {
            console.error('Billing 404 - Full URL:', error.config.url);
            console.error('Billing 404 - Method:', error.config.method);
        }
        
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/otp-login');

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const otpLogin = (data) => api.post('/auth/otp-login', data);
export const directLogin = (data) => api.post('/auth/direct-login', data);
export const directRegister = (data) => api.post('/auth/direct-register', data);
export const sendOtp = (data) => api.post('/auth/send-otp', data);
export const getProfile = () => api.get('/auth/profile');
export const changePassword = (data) => api.post('/auth/change-password', data);
export const getUsers = () => api.get('/auth/users');
export const registerUser = (data) => api.post('/auth/register', data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);
export const updateProfile = (data) => api.put('/auth/profile', data);

// Product/Inventory APIs
export const getProducts = (params = '') => api.get(`/products${params ? `?${params}` : ''}`);
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const getUserInventory = (params = '') => api.get(`/products/user-inventory${params ? `?${params}` : ''}`);
export const addQuantity = (data) => api.post('/products/add-quantity', data);
export const transferStock = (data) => api.post('/products/transfer', data);
export const getTransferHistory = () => api.get('/products/transfer-history');
export const getStockLogs = () => api.get('/products/stock-logs');
export const deleteStockLog = (id) => api.delete(`/products/stock-logs/${id}`);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// Kitchen APIs
export const getKitchens = () => api.get('/kitchens');
export const createKitchen = (data) => api.post('/kitchens', data);
export const updateKitchen = (id, data) => api.put(`/kitchens/${id}`, data);
export const deleteKitchen = (id) => api.delete(`/kitchens/${id}`);
export const getKitchenInventory = (id) => api.get(`/kitchens/${id}/inventory`);

// Billing APIs
export const getBills = (page = 1, limit = 20) => api.get(`/billing?page=${page}&limit=${limit}`);
export const getBillById = (id) => api.get(`/billing/${id}`);
export const getUserOrders = () => api.get('/orders/my-orders');
export const getKitchenOrders = () => api.get('/billing/kitchen-orders');
export const getAllOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const createBill = (data) => api.post('/billing', data);
export const updateBill = (id, data) => api.put(`/billing/${id}`, data);
export const updateBillStatus = (id, status) => api.patch(`/billing/${id}/status`, { status });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteBill = (id) => api.delete(`/billing/${id}`);
export default api;
export const getOffers = () => api.get('/offers');
export const getActiveOffers = () => api.get('/offers/active');
export const createOffer = (data) => api.post('/offers', data);
export const updateOffer = (id, data) => api.put(`/offers/${id}`, data);
export const deleteOffer = (id) => api.delete(`/offers/${id}`);
export const validateOffer = (data) => api.post('/offers/validate', data);
export const applyOffer = (data) => api.post('/offers/apply', data);

// Admin Dashboard API
export const getAdminDashboard = () => api.get('/admin/dashboard');

// Billing Admin Analytics/Fleet APIs
export const getMyKitchen = () => api.get('/billing-admin/my-kitchen');
export const getMyKitchenOrders = () => api.get('/billing-admin/my-kitchen/orders');
export const getMyKitchenInventory = () => api.get('/billing-admin/my-kitchen/inventory');
