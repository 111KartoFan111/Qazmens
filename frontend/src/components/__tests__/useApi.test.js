import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

describe('useApi Hook', () => {
  test('изначально не имеет данных и не загружается', () => {
    const mockApiFunction = jest.fn();
    const { result } = renderHook(() => useApi(mockApiFunction));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('успешно выполняет API запрос', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockApiFunction = jest.fn().mockResolvedValue({ data: mockData });
    
    const { result } = renderHook(() => useApi(mockApiFunction));

    expect(result.current.loading).toBe(false);

    // Выполняем запрос
    result.current.execute();

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockApiFunction).toHaveBeenCalledTimes(1);
  });

  test('обрабатывает ошибки API запроса', async () => {
    const mockError = new Error('API Error');
    mockError.response = { data: { detail: 'Detailed error message' } };
    const mockApiFunction = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useApi(mockApiFunction));

    // Выполняем запрос
    result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Detailed error message');
  });

  test('передает аргументы в API функцию', async () => {
    const mockApiFunction = jest.fn().mockResolvedValue({ data: 'success' });
    const { result } = renderHook(() => useApi(mockApiFunction));

    const args = ['arg1', 'arg2', { param: 'value' }];
    await result.current.execute(...args);

    expect(mockApiFunction).toHaveBeenCalledWith(...args);
  });
});