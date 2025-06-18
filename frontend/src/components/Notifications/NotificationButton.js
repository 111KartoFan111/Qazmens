// frontend/src/components/Notifications/NotificationButton.js
import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Delete,
  Assignment,
  Person,
  Schedule,
  TrendingUp,
  Info
} from '@mui/icons-material';

// Компонент кнопки уведомлений
export const NotificationButton = ({ notifications = [], onMarkAsRead, onDelete, onAction }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read && onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
    });
  };

  const getIcon = (category) => {
    switch (category) {
      case 'valuation': return <Assignment />;
      case 'client': return <Person />;
      case 'reminder': return <Schedule />;
      case 'market': return <TrendingUp />;
      default: return <Info />;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ 
          color: '#666',
          '&:hover': {
            color: '#FF6B35'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActive sx={{ color: '#FF6B35' }} />
          ) : (
            <Notifications />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Заголовок */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Уведомления
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ color: '#FF6B35' }}
              >
                Прочитать все
              </Button>
            )}
          </Box>
          {unreadCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {unreadCount} непрочитанных
            </Typography>
          )}
        </Box>

        {/* Список уведомлений */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Нет уведомлений
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'rgba(255, 107, 53, 0.05)',
                      borderLeft: notification.read ? 'none' : '3px solid #FF6B35',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => !notification.read && onMarkAsRead && onMarkAsRead(notification.id)}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: notification.read ? '#e0e0e0' : '#FF6B35',
                          width: 40,
                          height: 40
                        }}
                      >
                        {getIcon(notification.category)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: notification.read ? 'normal' : 'bold',
                              flexGrow: 1
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {notification.priority === 'high' && (
                            <Chip
                              label="Важно"
                              size="small"
                              color="error"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getTimeAgo(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {notification.actionLabel && onAction && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAction(notification);
                            }}
                            sx={{ fontSize: '0.7rem', p: 0.5 }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                        {onDelete && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Футер */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
                fullWidth
                onClick={handleClose}
                sx={{ color: '#FF6B35' }}
              >
                Посмотреть все
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationButton;