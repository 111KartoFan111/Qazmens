import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppBar, Toolbar, Tabs, Tab, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <StyledAppBar position="static">
        <Toolbar>
          <StyledTabs
            value={activeTab}
            onChange={onTabChange}
            aria-label="navigation tabs"
          >
            <StyledTab label={t('home')} />
            <StyledTab label={t('results')} />
            <StyledTab label={t('settings')} />
          </StyledTabs>
        </Toolbar>
      </StyledAppBar>
    </Box>
  );
}

export default Navigation; 