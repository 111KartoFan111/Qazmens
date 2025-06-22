import axios from 'axios';
import { propertyApi, valuationApi, authApi } from '../api';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('propertyApi', () => {
    test('createProperty отправляет POST запрос', async () => {
      const mockProperty = {
        address: 'Test Address',
        property_type: 'apartment',
        area: 85,
        price: 45000000
      };

      const mockResponse = {
        data: { id: 1, ...mockProperty }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await propertyApi.createProperty(mockProperty);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/properties/', mockProperty);
      expect(result).toEqual(mockResponse);
    });

    test('getProperties отправляет GET запрос с параметрами', async () => {
      const mockResponse = {
        data: [{ id: 1, address: 'Test' }]
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const params = { limit: 10, property_type: 'apartment' };
      const result = await propertyApi.getProperties(params);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/properties/', { params });
      expect(result).toEqual(mockResponse);
    });

    test('updateProperty отправляет PUT запрос', async () => {
      const propertyId = 1;
      const updateData = { price: 50000000 };
      const mockResponse = {
        data: { id: propertyId, price: 50000000 }
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await propertyApi.updateProperty(propertyId, updateData);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/api/properties/${propertyId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    test('deleteProperty отправляет DELETE запрос', async () => {
      const propertyId = 1;
      const mockResponse = {
        data: { message: 'Property deleted' }
      };

      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await propertyApi.deleteProperty(propertyId);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/properties/${propertyId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('valuationApi', () => {
    test('calculateValuation отправляет POST запрос', async () => {
      const valuationData = {
        subject_property: { id: 1 },
        comparable_properties: [{ id: 2 }, { id: 3 }]
      };

      const mockResponse = {
        data: {
          final_valuation: 45000000,
          confidence_score: 0.95
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await valuationApi.calculateValuation(valuationData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/valuation/calculate', valuationData);
      expect(result).toEqual(mockResponse);
    });

    test('getValuationHistory отправляет GET запрос', async () => {
      const mockResponse = {
        data: [{ id: 1, final_valuation: 45000000 }]
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await valuationApi.getValuationHistory();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/valuation/history', { params: {} });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('authApi', () => {
    test('login отправляет POST запрос с FormData', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = {
        data: {
          access_token: 'token123',
          user: { email, id: 1 }
        }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.login(email, password);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });

    test('register отправляет POST запрос', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        full_name: 'Test User',
        role: 'appraiser'
      };

      const mockResponse = {
        data: { id: 1, email: userData.email }
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await authApi.register(userData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });
  });
});
