// frontend/src/components/Navigation.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings as SettingsIcon,
  Person,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(28, 28, 30, 0.8)',
  backdropFilter: 'blur(20px)',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  minWidth: 120,
  color: theme.palette.mode === 'light'
    ? 'rgba(0, 0, 0, 0.7)'
    : 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
}));

function Navigation({ activeTab, onTabChange }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'appraiser':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                mr: 4,
                fontWeight: 600,
                color: 'primary.main',
              }}
            >
              {t('realEstateValuation')}
            </Typography>
            
            <StyledTabs
              value={activeTab}
              onChange={onTabChange}
              aria-label="navigation tabs"
            >
              <StyledTab label={t('home')} />
              <StyledTab label={t('results')} />
              <StyledTab label={t('settings')} />
            </StyledTabs>
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 , color: 'text.primary' }}>
                {user?.full_name || user?.username}
              </Typography>
              <Chip
                label={t(user?.role || 'user')}
                size="small"
                color={getRoleColor(user?.role)}
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              aria-controls="account-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  fontSize: '1rem',
                }}
              >
                {getUserInitials(user?.full_name || user?.username)}
              </Avatar>
            </IconButton>

            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.full_name || user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              
              <Divider />
              
              <MenuItem onClick={handleMenuClose}>
                <Person fontSize="small" sx={{ mr: 1 }} />
                {t('profile')}
              </MenuItem>
              
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                {t('settings')}
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                {t('logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
    </Box>
  );
}

export default Navigation;