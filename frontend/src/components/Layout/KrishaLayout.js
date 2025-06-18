// frontend/src/components/Layout/KrishaLayout.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
  Breadcrumbs,
  Link,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home,
  Assessment,
  People,
  TrendingUp,
  Map as MapIcon,
  Notifications,
  Settings,
  Menu as MenuIcon,
  PersonAdd,
  CalendarToday,
  Search,
  LocationOn,
  Phone,
  Email,
  AccountCircle,
  Logout,
  NavigateNext,
  Add,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const KrishaLayout = ({ children, currentPage = 'dashboard', breadcrumbs = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  // Функция навигации
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false); // Закрываем мобильное меню при навигации
  };

  const navigationItems = [
    { 
      name: 'Дашборд', 
      icon: <Home />, 
      path: '/dashboard',
      current: location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    },
    { 
      name: 'Оценки', 
      icon: <Assessment />, 
      path: '/dashboard/valuations',
      current: location.pathname.includes('/valuations')
    },
    { 
      name: 'Клиенты', 
      icon: <People />, 
      path: '/dashboard/clients',
      current: location.pathname.includes('/clients')
    },
    { 
      name: 'Аналитика', 
      icon: <TrendingUp />, 
      path: '/dashboard/analytics',
      current: location.pathname.includes('/analytics')
    },
    { 
      name: 'Карта', 
      icon: <MapIcon />, 
      path: '/dashboard/map',
      current: location.pathname.includes('/map')
    }
  ];

  const notifications = [
    { id: 1, title: 'Новая заявка на оценку', time: '5 мин назад', unread: true },
    { id: 2, title: 'Отчет готов к отправке', time: '1 час назад', unread: true },
    { id: 3, title: 'Встреча с клиентом через 30 мин', time: '2 часа назад', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Верхняя панель */}
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar>
          {/* Логотип */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#FF6B35',
                mr: 1,
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('/dashboard')}
            >
              Qazmen's
            </Typography>
          </Box>

          {/* Навигация для десктопа */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.name}
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    color: item.current ? '#FF6B35' : '#666',
                    bgcolor: item.current ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                    fontWeight: item.current ? 'bold' : 'normal',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 107, 53, 0.1)',
                      color: '#FF6B35'
                    }
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}

          {/* Мобильное меню */}
          {isMobile && (
            <IconButton
              sx={{ mr: 2 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Быстрые действия */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleNavigation('/dashboard/valuations/new')}
              sx={{
                bgcolor: '#FF6B35',
                '&:hover': { bgcolor: '#E55A2B' },
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              {isMobile ? 'Добавить' : 'Новая оценка'}
            </Button>

            {/* Уведомления */}
            <IconButton 
              onClick={handleNotificationOpen}
              sx={{ color: '#666' }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Профиль пользователя */}
            <IconButton onClick={handleMenuOpen}>
              <Avatar 
                sx={{ 
                  bgcolor: '#FF6B35',
                  width: 36,
                  height: 36
                }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Хлебные крошки */}
      {breadcrumbs.length > 0 && (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
            sx={{ 
              '& .MuiBreadcrumbs-separator': { color: '#FF6B35' }
            }}
          >
            <Link 
              color="inherit" 
              onClick={() => handleNavigation('/dashboard')}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#666',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { color: '#FF6B35' }
              }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Главная
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <Typography 
                key={index}
                color={index === breadcrumbs.length - 1 ? '#FF6B35' : 'inherit'}
                sx={{ fontWeight: index === breadcrumbs.length - 1 ? 'bold' : 'normal' }}
              >
                {crumb}
              </Typography>
            ))}
          </Breadcrumbs>
        </Container>
      )}

      {/* Основной контент */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f8f9fa' }}>
        {children}
      </Box>

      {/* Меню профиля */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.full_name || 'Пользователь'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <Chip 
            label={user?.role === 'admin' ? 'Администратор' : 'Оценщик'}
            size="small"
            sx={{ 
              bgcolor: user?.role === 'admin' ? '#FF6B35' : '#2196F3',
              color: 'white',
              mt: 0.5
            }}
          />
        </Box>
        
        <Divider />
        
        <MenuItem onClick={() => { handleMenuClose(); handleNavigation('/dashboard/profile'); }}>
          <AccountCircle sx={{ mr: 1 }} />
          Профиль
        </MenuItem>
        
        <MenuItem onClick={() => { handleMenuClose(); handleNavigation('/dashboard/settings'); }}>
          <Settings sx={{ mr: 1 }} />
          Настройки
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <Logout sx={{ mr: 1 }} />
          Выйти
        </MenuItem>
      </Menu>

      {/* Меню уведомлений */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Уведомления
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {unreadCount} непрочитанных
            </Typography>
          )}
        </Box>
        
        {notifications.map((notification) => (
          <MenuItem 
            key={notification.id}
            onClick={handleNotificationClose}
            sx={{
              bgcolor: notification.unread ? 'rgba(255, 107, 53, 0.05)' : 'transparent',
              borderLeft: notification.unread ? '3px solid #FF6B35' : '3px solid transparent',
              py: 1.5,
              alignItems: 'flex-start'
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: notification.unread ? 'bold' : 'normal' }}>
                {notification.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        
        <Divider />
        <MenuItem onClick={handleNotificationClose} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            Посмотреть все
          </Typography>
        </MenuItem>
      </Menu>

      {/* Мобильное меню навигации */}
      {isMobile && mobileMenuOpen && (
        <Box 
          sx={{ 
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bgcolor: 'white',
            zIndex: 1200,
            borderBottom: '1px solid #e0e0e0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          {navigationItems.map((item) => (
            <Button
              key={item.name}
              fullWidth
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{
                justifyContent: 'flex-start',
                color: item.current ? '#FF6B35' : '#666',
                bgcolor: item.current ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                fontWeight: item.current ? 'bold' : 'normal',
                borderRadius: 0,
                py: 1.5,
                px: 3
              }}
            >
              {item.name}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default KrishaLayout;