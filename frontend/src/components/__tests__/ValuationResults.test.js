import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import ValuationResults from '../ValuationResults';
import { NotificationProvider } from '../Notifications/NotificationSystem';

const mockResults = {
  final_valuation: 45000000,
  confidence_score: 0.95,
  subject_property: {
    id: 1,
    address: 'Тестовый адрес, 123',
    property_type: 'apartment',
    area: 85,
    floor_level: 5,
    total_floors: 12,
    condition: 'good',
    price: 45000000
  },
  comparable_properties: [
    {
      id: 2,
      address: 'Сравнимый 1',
      property_type: 'apartment',
      area: 80,
      price: 42000000
    },
    {
      id: 3,
      address: 'Сравнимый 2',
      property_type: 'apartment',
      area: 90,
      price: 48000000
    }
  ],
  adjustments: {
    '2': [
      { feature: 'area', value: 500 },
      { feature: 'floor', value: -300 }
    ],
    '3': [
      { feature: 'area', value: -500 },
      { feature: 'condition', value: 1000 }
    ]
  },
  created_at: '2024-01-01T00:00:00Z'
};

// Мокаем localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(() => JSON.stringify(mockResults)),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

// Мокаем API
jest.mock('../../services/api', () => ({
  exportApi: {
    exportToPdf: jest.fn(),
    exportToExcel: jest.fn(),
  },
}));

const theme = createTheme();

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('ValuationResults', () => {
  test('отображает результаты оценки', () => {
    render(
      <TestWrapper>
        <ValuationResults />
      </TestWrapper>
    );

    expect(screen.getByText('Результаты оценки')).toBeInTheDocument();
    expect(screen.getByText('₸45,000,000')).toBeInTheDocument();
    expect(screen.getByText('95.0%')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Количество сравнимых объектов
  });

  test('отображает информацию об оцениваемом объекте', () => {
    render(
      <TestWrapper>
        <ValuationResults />
      </TestWrapper>
    );

    expect(screen.getByText('Оцениваемый объект')).toBeInTheDocument();
    expect(screen.getByText('Тестовый адрес, 123')).toBeInTheDocument();
    expect(screen.getByText('85 м²')).toBeInTheDocument();
    expect(screen.getByText('5/12')).toBeInTheDocument();
  });

  test('отображает таблицу сравнимых объектов', () => {
    render(
      <TestWrapper>
        <ValuationResults />
      </TestWrapper>
    );

    expect(screen.getByText('Детальный анализ сравнимых объектов')).toBeInTheDocument();
    expect(screen.getByText('Сравнимый 1')).toBeInTheDocument();
    expect(screen.getByText('Сравнимый 2')).toBeInTheDocument();
    expect(screen.getByText('₸42,000,000')).toBeInTheDocument();
    expect(screen.getByText('₸48,000,000')).toBeInTheDocument();
  });

  test('показывает кнопки экспорта', () => {
    render(
      <TestWrapper>
        <ValuationResults />
      </TestWrapper>
    );

    expect(screen.getByText('PDF отчет')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('Печать')).toBeInTheDocument();
  });
});