import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalyticsCharts from '../../Analytics/AnalyticsCharts';
import { NotificationProvider } from '../../Notifications/NotificationSystem';

// Мокаем API
jest.mock('../../../services/api', () => ({
  propertyApi: {
    getProperties: jest.fn(),
  },
  valuationApi: {
    getValuationHistory: jest.fn(),
  },
  analyticsApi: {
    getMarketTrends: jest.fn(),
  },
}));

const mockProperties = [
  {
    id: 1,
    address: 'Test Address 1, Алматы',
    property_type: 'apartment',
    area: 85,
    price: 45000000,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    address: 'Test Address 2, Алматы',
    property_type: 'house',
    area: 120,
    price: 65000000,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockValuations = [
  {
    id: 1,
    property_id: 1,
    adjusted_price: 46000000,
    valuation_date: '2024-01-01T00:00:00Z'
  }
];

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </BrowserRouter>
);

describe('AnalyticsCharts', () => {
  beforeEach(() => {
    const { propertyApi, valuationApi, analyticsApi } = require('../../../services/api');
    
    propertyApi.getProperties.mockResolvedValue({ data: mockProperties });
    valuationApi.getValuationHistory.mockResolvedValue({ data: mockValuations });
    analyticsApi.getMarketTrends.mockRejectedValue(new Error('API not available'));
  });

  test('отображает заголовок аналитики', async () => {
    render(
      <TestWrapper>
        <AnalyticsCharts />
      </TestWrapper>
    );

    expect(screen.getByText('Аналитика рынка')).toBeInTheDocument();
  });

  test('отображает метрики после загрузки данных', async () => {
    render(
      <TestWrapper>
        <AnalyticsCharts />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Всего объектов')).toBeInTheDocument();
      expect(screen.getByText('Средняя точность')).toBeInTheDocument();
      expect(screen.getByText('Активных районов')).toBeInTheDocument();
      expect(screen.getByText('Время на оценку')).toBeInTheDocument();
    });

    // Проверяем отображение количества объектов
    expect(screen.getByText('2')).toBeInTheDocument(); // Всего объектов
  });

  test('показывает индикатор загрузки', () => {
    const { propertyApi } = require('../../../services/api');
    propertyApi.getProperties.mockImplementation(() => new Promise(() => {})); // Никогда не резолвится

    render(
      <TestWrapper>
        <AnalyticsCharts />
      </TestWrapper>
    );

    expect(screen.getByText('Загрузка клиентов...')).toBeInTheDocument();
  });

  test('обрабатывает ошибки загрузки', async () => {
    const { propertyApi } = require('../../../services/api');
    propertyApi.getProperties.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <AnalyticsCharts />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ошибка загрузки данных аналитики/)).toBeInTheDocument();
    });
  });
});