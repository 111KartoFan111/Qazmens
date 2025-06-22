import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/Notifications/NotificationSystem';

const theme = createTheme();

// Кастомный рендер с провайдерами
export const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Мок данные для тестов
export const mockProperty = {
  id: 1,
  address: 'Test Address, 123',
  property_type: 'apartment',
  area: 85,
  floor_level: 5,
  total_floors: 12,
  condition: 'good',
  renovation_status: 'recentlyRenovated',
  location: { lat: 43.2220, lng: 76.8512 },
  price: 45000000,
  features: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  role: 'appraiser',
  is_active: true
};

export const mockValuationResult = {
  final_valuation: 45000000,
  confidence_score: 0.95,
  subject_property: mockProperty,
  comparable_properties: [
    { ...mockProperty, id: 2, address: 'Comparable 1', price: 42000000 },
    { ...mockProperty, id: 3, address: 'Comparable 2', price: 48000000 }
  ],
  adjustments: {
    '2': [
      { feature: 'area', value: 500, description: 'Area adjustment' },
      { feature: 'floor', value: -300, description: 'Floor adjustment' }
    ],
    '3': [
      { feature: 'area', value: -500, description: 'Area adjustment' },
      { feature: 'condition', value: 1000, description: 'Condition adjustment' }
    ]
  },
  created_at: '2024-01-01T00:00:00Z'
};

// Хелперы для тестирования
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockApiResponse = (data, delay = 0) => 
  new Promise(resolve => 
    setTimeout(() => resolve({ data }), delay)
  );

export const mockApiError = (message = 'API Error', status = 500, delay = 0) =>
  new Promise((resolve, reject) =>
    setTimeout(() => reject({
      response: { 
        status, 
        data: { detail: message } 
      }
    }), delay)
  );

// Экспортируем все утилиты
export * from '@testing-library/react';
export { renderWithProviders as render };
