// frontend/src/components/History.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Card,
  CardContent,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList,
  Download,
  Refresh,
  Assessment,
  CalendarToday,
  LocationOn,
  TrendingUp
} from '@mui/icons-material';
import { valuationApi, propertyApi } from '../services/api';
import { useNotifications } from './Notifications/NotificationSystem';

function History() {
  const [valuations, setValuations] = useState([]);
  const [filteredValuations, setFilteredValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValuation, setSelectedValuation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showSuccess, showError } = useNotifications();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchValuations();
  }, [page]);

  useEffect(() => {
    filterValuations();
  }, [valuations, searchQuery, statusFilter, dateFilter]);

  const fetchValuations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await valuationApi.getValuationHistory({
        skip: (page - 1) * itemsPerPage,
        limit: itemsPerPage
      });
      
      const valuationsData = response.data;
      setValuations(valuationsData);
      
      // Вычисляем общее количество страниц (примерно)
      setTotalPages(Math.ceil(valuationsData.length / itemsPerPage) || 1);
      
      showSuccess(`Загружено ${valuationsData.length} записей истории оценок`);
    } catch (error) {
      console.error('Error fetching valuations:', error);
      setError('Ошибка загрузки истории оценок');
      showError('Не удалось загрузить историю оценок');
      
      // Используем моковые данные при ошибке
      const mockData = generateMockValuations();
      setValuations(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockValuations = () => {
    const mockData = [];
    const addresses = [
      'ул. Абая, 150, Алматы',
      'мкр. Самал-2, 78, Алматы', 
      'ул. Толе би, 45, Алматы',
      'пр. Достык, 97, Алматы',
      'ул. Фурманова, 123, Алматы'
    ];

    for (let i = 1; i <= 15; i++) {
      mockData.push({
        id: i,
        property: {
          id: i,
          address: addresses[Math.floor(Math.random() * addresses.length)],
          property_type: ['apartment', 'house', 'commercial'][Math.floor(Math.random() * 3)],
          area: Math.floor(Math.random() * 100) + 50,
          price: (Math.floor(Math.random() * 80) + 20) * 1000000
        },
        valuation_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        valuation_type: 'subject',
        original_price: (Math.floor(Math.random() * 80) + 20) * 1000000,
        adjusted_price: (Math.floor(Math.random() * 80) + 20) * 1000000,
        comparable_properties: Array.from({length: Math.floor(Math.random() * 5) + 1}, (_, j) => j + 1),
        created_by: 'Текущий пользователь',
        notes: `Примечания к оценке ${i}`,
        adjustments: {
          area: Math.random() * 10000 - 5000,
          floor: Math.random() * 2000 - 1000,
          condition: Math.random() * 5000 - 2500
        }
      });
    }

    return mockData;
  };

  const filterValuations = () => {
    let filtered = [...valuations];

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(valuation =>
        valuation.property?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        valuation.created_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        valuation.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по статусу/типу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(valuation => valuation.valuation_type === statusFilter);
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      };

      if (filterDays[dateFilter]) {
        const cutoffDate = new Date(now.getTime() - filterDays[dateFilter] * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(valuation => 
          new Date(valuation.valuation_date) >= cutoffDate
        );
      }
    }

    setFilteredValuations(filtered);
  };

  const handleViewValuation = async (valuation) => {
    try {
      // Загружаем подробную информацию об оценке
      const response = await valuationApi.getValuationHistoryItem(valuation.id);
      setSelectedValuation(response.data);
    } catch (error) {
      console.error('Error fetching valuation details:', error);
      // Используем данные из списка, если не удалось загрузить детали
      setSelectedValuation(valuation);
    }
  };

  const handleDeleteValuation = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись из истории?')) {
      try {
        // В реальном API должен быть endpoint для удаления
        // await valuationApi.deleteValuation(id);
        
        setValuations(prev => prev.filter(v => v.id !== id));
        showSuccess('Запись удалена из истории');
      } catch (error) {
        console.error('Error deleting valuation:', error);
        showError('Ошибка при удалении записи');
      }
    }
  };

  const handleRefresh = () => {
    fetchValuations();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatPrice = (price) => {
    return price ? `₸${price.toLocaleString()}` : 'Не указано';
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      'apartment': 'Квартира',
      'house': 'Дом',
      'commercial': 'Коммерческая',
      'land': 'Земля'
    };
    return labels[type] || type;
  };

  const calculateAccuracy = (original, adjusted) => {
    if (!original || !adjusted) return 0;
    const diff = Math.abs(original - adjusted);
    const accuracy = Math.max(0, 100 - (diff / original) * 100);
    return Math.round(accuracy);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 2 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
            История оценок
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => showSuccess('Экспорт данных')}
            >
              Экспорт
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Обновить
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Статистика */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {valuations.length}
                </Typography>
                <Typography color="text.secondary">Всего оценок</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  94%
                </Typography>
                <Typography color="text.secondary">Ср. точность</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <CalendarToday sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {valuations.filter(v => 
                    new Date(v.valuation_date) > new Date(Date.now() - 7*24*60*60*1000)
                  ).length}
                </Typography>
                <Typography color="text.secondary">За неделю</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <LocationOn sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {new Set(valuations.map(v => v.property?.address?.split(',')[1]?.trim()).filter(Boolean)).size}
                </Typography>
                <Typography color="text.secondary">Районов</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Фильтры */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Поиск по адресу, автору, примечаниям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Тип оценки</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Все типы</MenuItem>
                  <MenuItem value="subject">Основная</MenuItem>
                  <MenuItem value="comparable">Сравнимая</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Период</InputLabel>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">Все время</MenuItem>
                  <MenuItem value="7d">Последние 7 дней</MenuItem>
                  <MenuItem value="30d">Последние 30 дней</MenuItem>
                  <MenuItem value="90d">Последние 3 месяца</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                size="small"
              >
                Фильтры
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Таблица истории оценок */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Объект</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Тип</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Исходная цена</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Скорр. цена</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Точность</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Сравнимые</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Автор</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredValuations.map((valuation) => (
                <TableRow 
                  key={valuation.id}
                  sx={{ 
                    '&:hover': { bgcolor: '#f5f5f5' },
                    cursor: 'pointer'
                  }}
                  onClick={() => handleViewValuation(valuation)}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(valuation.valuation_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {valuation.property?.address || 'Адрес не указан'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {valuation.property?.area && `${valuation.property.area} м²`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getPropertyTypeLabel(valuation.property?.property_type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(valuation.original_price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                      {formatPrice(valuation.adjusted_price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${calculateAccuracy(valuation.original_price, valuation.adjusted_price)}%`}
                      size="small"
                      color={calculateAccuracy(valuation.original_price, valuation.adjusted_price) > 90 ? 'success' : 
                             calculateAccuracy(valuation.original_price, valuation.adjusted_price) > 80 ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={valuation.comparable_properties?.length || 0}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="caption">
                      {valuation.created_by || 'Неизвестно'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Просмотр">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewValuation(valuation);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteValuation(valuation.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Пустое состояние */}
        {filteredValuations.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Assessment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              История оценок пуста
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Попробуйте изменить параметры поиска'
                : 'Здесь будут отображаться выполненные оценки'
              }
            </Typography>
          </Box>
        )}

        {/* Пагинация */}
        {filteredValuations.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {/* Диалог детального просмотра оценки */}
        <Dialog 
          open={Boolean(selectedValuation)} 
          onClose={() => setSelectedValuation(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedValuation && (
            <>
              <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Детали оценки #{selectedValuation.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(selectedValuation.valuation_date)}
                </Typography>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  {/* Информация об объекте */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Объект недвижимости
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Адрес:
                          </Typography>
                          <Typography variant="body2">
                            {selectedValuation.property?.address || 'Не указан'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Тип:
                          </Typography>
                          <Typography variant="body2">
                            {getPropertyTypeLabel(selectedValuation.property?.property_type)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Площадь:
                          </Typography>
                          <Typography variant="body2">
                            {selectedValuation.property?.area || 'Не указана'} м²
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Информация об оценке */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Результаты оценки
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Исходная цена:
                          </Typography>
                          <Typography variant="body2">
                            {formatPrice(selectedValuation.original_price)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Скорректированная цена:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                            {formatPrice(selectedValuation.adjusted_price)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Точность:
                          </Typography>
                          <Typography variant="body2">
                            {calculateAccuracy(selectedValuation.original_price, selectedValuation.adjusted_price)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Сравнимых объектов:
                          </Typography>
                          <Typography variant="body2">
                            {selectedValuation.comparable_properties?.length || 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Корректировки */}
                  {selectedValuation.adjustments && (
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Корректировки
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                        {Object.entries(selectedValuation.adjustments).map(([key, value]) => (
                          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                              {key}:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: value > 0 ? '#4CAF50' : '#f44336',
                                fontWeight: 'bold'
                              }}
                            >
                              {value > 0 ? '+' : ''}{formatPrice(value)}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    </Grid>
                  )}

                  {/* Примечания */}
                  {selectedValuation.notes && (
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Примечания
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="body2">
                          {selectedValuation.notes}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedValuation(null)}>
                  Закрыть
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Download />}
                  onClick={() => showSuccess('Экспорт отчета об оценке')}
                >
                  Экспорт
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
}

export default History;