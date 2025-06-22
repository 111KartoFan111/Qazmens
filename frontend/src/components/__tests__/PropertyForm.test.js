import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import PropertyForm from '../PropertyForm';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../Notifications/NotificationSystem';

// Мокаем API вызовы
jest.mock('../../services/api', () => ({
  propertyApi: {
    createProperty: jest.fn(),
  },
  valuationApi: {
    calculateValuation: jest.fn(),
  },
}));

// Мокаем навигацию
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const theme = createTheme();

const TestWrapper = ({ children }) => (
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

describe('PropertyForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('рендерит форму оценки недвижимости', () => {
    render(
      <TestWrapper>
        <PropertyForm />
      </TestWrapper>
    );

    expect(screen.getByText('Новая оценка недвижимости')).toBeInTheDocument();
    expect(screen.getByText('Оцениваемый объект')).toBeInTheDocument();
    expect(screen.getByText('Сравнимые объекты')).toBeInTheDocument();
  });

  test('валидирует обязательные поля', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PropertyForm />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Рассчитать оценку');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Пожалуйста, заполните поле/)).toBeInTheDocument();
    });
  });

  test('добавляет сравнимый объект', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PropertyForm />
      </TestWrapper>
    );

    const addButton = screen.getByText('Добавить объект');
    await user.click(addButton);

    // Проверяем, что появился новый сравнимый объект
    const comparableObjects = screen.getAllByText(/Сравнимый объект/);
    expect(comparableObjects).toHaveLength(2); // Один изначальный + один добавленный
  });

  test('заполняет и отправляет форму', async () => {
    const user = userEvent.setup();
    const { propertyApi, valuationApi } = require('../../services/api');
    
    // Мокаем успешные ответы API
    propertyApi.createProperty.mockResolvedValue({
      data: { id: 1, address: 'Test Address' }
    });
    
    valuationApi.calculateValuation.mockResolvedValue({
      data: {
        final_valuation: 45000000,
        confidence_score: 0.95,
        adjustments: {},
        comparable_properties: []
      }
    });

    render(
      <TestWrapper>
        <PropertyForm />
      </TestWrapper>
    );

    // Заполняем основные поля
    await user.type(screen.getByLabelText('Адрес'), 'Тестовый адрес, 123');
    await user.type(screen.getByLabelText('Площадь'), '85');
    await user.type(screen.getByLabelText('Этаж'), '5');
    await user.type(screen.getByLabelText('Всего этажей'), '12');
    await user.type(screen.getByLabelText('Цена'), '45000000');

    // Выбираем состояние и ремонт
    await user.selectOptions(screen.getByLabelText('Состояние'), 'good');
    await user.selectOptions(screen.getByLabelText('Статус ремонта'), 'recentlyRenovated');

    // Заполняем данные для сравнимого объекта
    const comparableAddressInputs = screen.getAllByLabelText('Адрес');
    await user.type(comparableAddressInputs[1], 'Сравнимый адрес, 456');

    const comparableAreaInputs = screen.getAllByLabelText('Площадь');
    await user.type(comparableAreaInputs[1], '80');

    const comparableFloorInputs = screen.getAllByLabelText('Этаж');
    await user.type(comparableFloorInputs[1], '3');

    const comparableTotalFloorsInputs = screen.getAllByLabelText('Всего этажей');
    await user.type(comparableTotalFloorsInputs[1], '12');

    const comparablePriceInputs = screen.getAllByLabelText('Цена');
    await user.type(comparablePriceInputs[1], '42000000');

    // Отправляем форму
    const submitButton = screen.getByText('Рассчитать оценку');
    await user.click(submitButton);

    // Проверяем, что API был вызван
    await waitFor(() => {
      expect(propertyApi.createProperty).toHaveBeenCalled();
      expect(valuationApi.calculateValuation).toHaveBeenCalled();
    });
  });

  test('показывает ошибки API', async () => {
    const user = userEvent.setup();
    const { propertyApi } = require('../../services/api');
    
    // Мокаем ошибку API
    propertyApi.createProperty.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <PropertyForm />
      </TestWrapper>
    );

    // Заполняем минимальные данные и отправляем
    await user.type(screen.getByLabelText('Адрес'), 'Test');
    const submitButton = screen.getByText('Рассчитать оценку');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Ошибка при расчете оценки/)).toBeInTheDocument();
    });
  });
});