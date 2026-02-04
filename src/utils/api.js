import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');
export const changePassword = (data) => api.post('/auth/change-password', data);

// Product/Inventory APIs
export const getProducts = () => api.get('/products');
export const addQuantity = (data) => api.post('/products/add-quantity', data);
export const getStockLogs = () => api.get('/products/stock-logs');

// Kitchen APIs
export const getKitchens = () => api.get('/kitchens');
export const createKitchen = (data) => api.post('/kitchens', data);
export const updateKitchen = (id, data) => api.put(`/kitchens/${id}`, data);
export const deleteKitchen = (id) => api.delete(`/kitchens/${id}`);

// Billing APIs
export const getBills = () => api.get('/billing');
export const createBill = (data) => api.post('/billing', data);
export const updateBill = (id, data) => api.put(`/billing/${id}`, data);
export const deleteBill = (id) => api.delete(`/billing/${id}`);

export default api;
