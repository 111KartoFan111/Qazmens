import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Property API calls
export const propertyApi = {
    createProperty: (propertyData) => api.post('/api/properties/', propertyData),
    getProperties: (params) => api.get('/api/properties/', { params }),
    getProperty: (propertyId) => api.get(`/api/properties/${propertyId}`),
    updateProperty: (propertyId, propertyData) => api.put(`/api/properties/${propertyId}`, propertyData),
    deleteProperty: (propertyId) => api.delete(`/api/properties/${propertyId}`),
};

// Valuation API calls
export const valuationApi = {
    calculateValuation: (valuationData) => api.post('/api/valuation/calculate', valuationData),
    getValuationHistory: (params) => api.get('/api/valuation/history', { params }),
    getValuationHistoryItem: (historyId) => api.get(`/api/valuation/history/${historyId}`),
};

// Export API calls
export const exportApi = {
    exportToPdf: (valuationData) => api.post('/api/export/pdf', valuationData),
    exportToExcel: (valuationData) => api.post('/api/export/excel', valuationData),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api; 