// frontend/src/App.js
import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTranslation } from 'react-i18next';
import { Box, Container, Fade } from '@mui/material';

// Import components
import Navigation from './components/Navigation';
import PropertyForm from './components/PropertyForm';
import ValuationResults from './components/ValuationResults';
import Settings from './components/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';

import './i18n';
import './styles/global.css';

function AppContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [themeMode, setThemeMode] = useState('light');
  const [fontSize, setFontSize] = useState(16);
  const [zoom, setZoom] = useState(100);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: themeMode === 'light' ? '#007AFF' : '#0A84FF',
            light: themeMode === 'light' ? '#47A3FF' : '#5E5CE6',
            dark: themeMode === 'light' ? '#0055B3' : '#3E3D96',
          },
          background: {
            default: themeMode === 'light' ? '#F5F5F7' : '#1C1C1E',
            paper: themeMode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 28, 30, 0.8)',
          },
        },
        typography: {
          fontSize: fontSize,
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backdropFilter: 'blur(20px)',
                backgroundImage: 'none',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: 'none',
                fontWeight: 500,
                padding: '8px 24px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
              contained: {
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0, 122, 255, 0.3)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 20,
                backdropFilter: 'blur(20px)',
                background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 28, 30, 0.8)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  backdropFilter: 'blur(10px)',
                  background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(28, 28, 30, 0.6)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(28, 28, 30, 0.8)',
                  },
                  '&.Mui-focused': {
                    background: themeMode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(28, 28, 30, 0.9)',
                  },
                },
              },
            },
          },
        },
      }),
    [themeMode, fontSize]
  );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Fade in={activeTab === 0} timeout={500}>
            <Box>
              <PropertyForm />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={activeTab === 1} timeout={500}>
            <Box>
              <ValuationResults />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={activeTab === 2} timeout={500}>
            <Box>
              <Settings
                themeMode={themeMode}
                onThemeChange={setThemeMode}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Box
                sx={{
                  minHeight: '100vh',
                  background: themeMode === 'light'
                    ? 'linear-gradient(135deg, #F5F5F7 0%, #E5E5EA 100%)'
                    : 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                  {renderContent()}
                </Container>
              </Box>
            </ProtectedRoute>
          }
        />
        
        {/* Redirect root to home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;