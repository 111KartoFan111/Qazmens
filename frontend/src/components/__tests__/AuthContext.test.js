import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Мокаем axios
jest.mock('axios');
const mockedAxios = axios;

// Мокаем localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Тестовый компонент для проверки контекста
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-info">
          {user.email} - {user.role}
        </div>
      )}
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('изначально пользователь не аутентифицирован', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Проверяем, что токен не был сохранен
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('access_token', expect.anything());
  });

  test('выполняет выход из системы', async () => {
    const user = userEvent.setup();
    
    // Устанавливаем начальное состояние как аутентифицированный
    const mockUser = { id: 1, email: 'test@example.com', role: 'appraiser' };
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'access_token') return 'mock-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    mockedAxios.get.mockResolvedValue({ data: mockUser });
    mockedAxios.post.mockResolvedValue({}); // Для logout запроса

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Ждем загрузки пользователя
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Проверяем, что токены были удалены
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });
});