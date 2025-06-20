// frontend/src/services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired, redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authApi = {
    login: (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        return api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    me: () => api.get('/auth/me'),
    refresh: () => api.post('/auth/refresh'),
};

// Property API calls
export const propertyApi = {
    createProperty: (propertyData) => api.post('/api/properties/', propertyData),
    getProperties: (params = {}) => api.get('/api/properties/', { params }),
    getProperty: (propertyId) => api.get(`/api/properties/${propertyId}`),
    updateProperty: (propertyId, propertyData) => api.put(`/api/properties/${propertyId}`, propertyData),
    deleteProperty: (propertyId) => api.delete(`/api/properties/${propertyId}`),
    searchProperties: (query, params = {}) => api.get('/api/properties/', { params: { ...params, search: query } }),
};

// Valuation API calls
export const valuationApi = {
    calculateValuation: (valuationData) => api.post('/api/valuation/calculate', valuationData),
    getValuationHistory: (params = {}) => api.get('/api/valuation/history', { params }),
    getValuationHistoryItem: (historyId) => api.get(`/api/valuation/history/${historyId}`),
};

// Analytics API calls
export const analyticsApi = {
    getMarketTrends: (params = {}) => api.get('/api/analytics/market-trends', { params }),
    getPropertyComparison: (propertyId, params = {}) => api.get(`/api/analytics/comparison/${propertyId}`, { params }),
    getAdjustmentAnalysis: (propertyId) => api.get(`/api/analytics/adjustments/${propertyId}`),
};

// Export API calls
export const exportApi = {
    exportToPdf: (valuationData) => api.post('/api/export/pdf', valuationData),
    exportToExcel: (valuationData) => api.post('/api/export/excel', valuationData),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;