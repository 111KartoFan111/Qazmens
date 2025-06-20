// frontend/src/components/ValuationResults.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download as DownloadIcon, Share, Print, Assessment } from '@mui/icons-material';
import { exportApi } from '../services/api';
import { useNotifications } from './Notifications/NotificationSystem';

const COLORS = ['#FF6B35', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'];

function ValuationResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotifications();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем результаты из состояния навигации или localStorage
    const resultsFromState = location.state?.valuationResults;
    const storedResults = localStorage.getItem('valuationResults');
    
    if (resultsFromState) {
      setResults(resultsFromState);
      setLoading(false);
    } else if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing stored results:', error);
        navigate('/dashboard/valuations');
      }
    } else {
      // Нет результатов, перенаправляем на создание оценки
      navigate('/dashboard/valuations');
    }
  }, [navigate, location.state]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Результаты оценки не найдены. 
          <Button 
            onClick={() => navigate('/dashboard/valuations')} 
            sx={{ ml: 2 }}
          >
            Создать новую оценку
          </Button>
        </Alert>
      </Container>
    );
  }

  // Безопасное получение данных с проверками
  const subjectProperty = results.subject_property || {};
  const comparableProperties = results.comparable_properties || [];
  const adjustments = results.adjustments || {};
  const finalValuation = results.final_valuation || 0;
  const confidenceScore = results.confidence_score || 0;

  // Подготовка данных для графиков
  const chartData = comparableProperties.map((comp, index) => {
    const compAdjustments = adjustments[comp.id] || adjustments[comp.id?.toString()] || [];
    const totalAdjustment = Array.isArray(compAdjustments) 
      ? compAdjustments.reduce((sum, adj) => sum + (adj.value || 0), 0)
      : 0;
    
    return {
      name: `Объект ${index + 1}`,
      address: comp.address || `Объект ${index + 1}`,
      original: comp.price || 0,
      adjusted: (comp.price || 0) + totalAdjustment,
      adjustment: totalAdjustment
    };
  });

  // Данные для круговой диаграммы корректировок
  const adjustmentData = Object.entries(adjustments).flatMap(([propId, propAdjustments]) => {
    if (!Array.isArray(propAdjustments)) return [];
    
    return propAdjustments.map(adj => ({
      feature: adj.feature || 'Неизвестно',
      value: Math.abs(adj.value || 0)
    }));
  }).reduce((acc, curr) => {
    const existing = acc.find(item => item.feature === curr.feature);
    if (existing) {
      existing.value += curr.value;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const response = await exportApi.exportToPdf(results);
      
      // Создаем blob и скачиваем файл
      const blob = new Blob([atob(response.data.content)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.filename || 'valuation_report.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
      
      showSuccess('PDF отчет успешно экспортирован');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showError('Ошибка при экспорте PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await exportApi.exportToExcel(results);
      
      // Создаем blob и скачиваем файл
      const blob = new Blob([atob(response.data.content)], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.data.filename || 'valuation_report.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Excel отчет успешно экспортирован');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showError('Ошибка при экспорте Excel');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price ? `₸${price.toLocaleString()}` : '₸0';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 2 }}>
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
              Результаты оценки
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {results.created_at ? formatDate(results.created_at) : formatDate(new Date())}
            </Typography>
          </Box>
          <Assessment sx={{ fontSize: 48, color: '#FF6B35' }} />
        </Box>

        {/* Основные результаты */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center', bgcolor: '#FF6B35', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {formatPrice(finalValuation)}
                </Typography>
                <Typography variant="h6">
                  Итоговая оценочная стоимость
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#4CAF50' }}>
                  {(confidenceScore * 100).toFixed(1)}%
                </Typography>
                <Typography variant="h6">
                  Уровень достоверности
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, color: '#2196F3' }}>
                  {comparableProperties.length}
                </Typography>
                <Typography variant="h6">
                  Сравнимых объектов
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Информация об оцениваемом объекте */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Оцениваемый объект
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {subjectProperty.address || 'Адрес не указан'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Тип:</Typography>
                <Typography variant="body1">{subjectProperty.property_type || 'Не указан'}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Площадь:</Typography>
                <Typography variant="body1">{subjectProperty.area || 0} м²</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Этаж:</Typography>
                <Typography variant="body1">
                  {subjectProperty.floor_level || 0}/{subjectProperty.total_floors || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">Состояние:</Typography>
                <Typography variant="body1">{subjectProperty.condition || 'Не указано'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Графики */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {chartData.length > 0 && (
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Сравнение цен
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [formatPrice(value), name]}
                          labelFormatter={(label) => `Объект: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="original" name="Исходная цена" fill="#2196F3" />
                        <Bar dataKey="adjusted" name="Скорректированная цена" fill="#FF6B35" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {adjustmentData.length > 0 && (
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Структура корректировок
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={adjustmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ feature, percent }) => `${feature} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {adjustmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatPrice(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Таблица сравнимых объектов */}
        {comparableProperties.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Детальный анализ сравнимых объектов
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Адрес</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Исходная цена</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Корректировки</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Скорр. цена</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Влияние</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparableProperties.map((comp, index) => {
                      const compAdjustments = adjustments[comp.id] || adjustments[comp.id?.toString()] || [];
                      const totalAdjustment = Array.isArray(compAdjustments) 
                        ? compAdjustments.reduce((sum, adj) => sum + (adj.value || 0), 0)
                        : 0;
                      const adjustedPrice = (comp.price || 0) + totalAdjustment;
                      const influence = finalValuation > 0 ? (adjustedPrice / finalValuation) : 0;

                      return (
                        <TableRow key={comp.id || index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {comp.address || `Объект ${index + 1}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {comp.area || 0} м² • {comp.property_type || 'Тип не указан'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatPrice(comp.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: totalAdjustment >= 0 ? '#4CAF50' : '#f44336',
                                fontWeight: 'bold'
                              }}
                            >
                              {totalAdjustment >= 0 ? '+' : ''}{formatPrice(totalAdjustment)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                              {formatPrice(adjustedPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${(influence * 100).toFixed(1)}%`}
                              size="small"
                              color={influence > 0.5 ? 'primary' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Действия */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<Share />}
            onClick={() => showSuccess('Функция "Поделиться" будет добавлена')}
          >
            Поделиться
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
          >
            Печать
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            disabled={loading}
          >
            Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            disabled={loading}
            sx={{
              bgcolor: '#FF6B35',
              '&:hover': { bgcolor: '#E55A2B' }
            }}
          >
            PDF отчет
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ValuationResults;