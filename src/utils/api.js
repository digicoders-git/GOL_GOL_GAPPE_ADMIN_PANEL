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
export const getUsers = () => api.get('/auth/users');
export const registerUser = (data) => api.post('/auth/register', data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);

// Product/Inventory APIs
export const getProducts = () => api.get('/products');
export const getUserInventory = () => api.get('/products/user-inventory');
export const addQuantity = (data) => api.post('/products/add-quantity', data);
export const transferStock = (data) => api.post('/products/transfer', data);
export const getTransferHistory = () => api.get('/products/transfer-history');
export const getStockLogs = () => api.get('/products/stock-logs');
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// Kitchen APIs
export const getKitchens = () => api.get('/kitchens');
export const createKitchen = (data) => api.post('/kitchens', data);
export const updateKitchen = (id, data) => api.put(`/kitchens/${id}`, data);
export const deleteKitchen = (id) => api.delete(`/kitchens/${id}`);

// Billing APIs
export const getBills = () => api.get('/billing');
export const getKitchenOrders = () => api.get('/billing/kitchen-orders');
export const createBill = (data) => api.post('/billing', data);
export const updateBill = (id, data) => api.put(`/billing/${id}`, data);
export const updateBillStatus = (id, status) => api.patch(`/billing/${id}/status`, { status });
export const deleteBill = (id) => api.delete(`/billing/${id}`);

export default api;
