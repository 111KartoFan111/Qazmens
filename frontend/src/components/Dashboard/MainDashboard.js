// frontend/src/components/Dashboard/MainDashboard.js
import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import KrishaLayout from '../Layout/KrishaLayout';
import PropertyForm from '../PropertyForm';
import ValuationResults from '../ValuationResults';
import History from '../History';
import Settings from '../Settings';
import AnalyticsCharts from '../Analytics/AnalyticsCharts';
import ClientManagement from '../Clients/ClientManagement';
import InteractiveMap from '../Map/InteractiveMap';
import EnhancedValuationForm from '../Valuation/EnhancedValuationForm';

const MainDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Определяем текущую страницу на основе пути
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/valuations')) return 'valuations';
    if (path.includes('/clients')) return 'clients';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/map')) return 'map';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/history')) return 'history';
    return 'dashboard';
  };

  // Генерируем хлебные крошки
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [];
    
    if (path.includes('/valuations')) {
      breadcrumbs.push('Оценки');
      if (path.includes('/new')) breadcrumbs.push('Новая оценка');
      if (path.includes('/enhanced')) breadcrumbs.push('Расширенная оценка');
    } else if (path.includes('/clients')) {
      breadcrumbs.push('Клиенты');
    } else if (path.includes('/analytics')) {
      breadcrumbs.push('Аналитика');
    } else if (path.includes('/map')) {
      breadcrumbs.push('Карта');
    } else if (path.includes('/settings')) {
      breadcrumbs.push('Настройки');
    } else if (path.includes('/history')) {
      breadcrumbs.push('История');
    } else if (path !== '/dashboard') {
      breadcrumbs.push('Дашборд');
    }
    
    return breadcrumbs;
  };

  // Простой компонент дашборда
  const DashboardHome = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box>
        <h1>Добро пожаловать в систему оценки недвижимости</h1>
        <p>Выберите раздел для работы из навигационного меню.</p>
      </Box>
    </Container>
  );

  return (
    <KrishaLayout 
      currentPage={getCurrentPage()} 
      breadcrumbs={getBreadcrumbs()}
    >
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/valuations" element={<PropertyForm />} />
          <Route path="/valuations/new" element={<PropertyForm />} />
          <Route path="/valuations/enhanced" element={<EnhancedValuationForm />} />
          <Route path="/results" element={<ValuationResults />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="/analytics" element={<AnalyticsCharts />} />
          <Route path="/map" element={<InteractiveMap />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Container>
    </KrishaLayout>
  );
};

export default MainDashboard;