import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';

function Settings() {
  const { t, i18n } = useTranslation();
  const [themeMode, setThemeMode] = useState('light');
  const [fontSize, setFontSize] = useState(16);
  const [zoom, setZoom] = useState(100);

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const handleThemeChange = (checked) => {
    setThemeMode(checked ? 'dark' : 'light');
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('settings')}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>{t('language')}</InputLabel>
            <Select
              value={i18n.language}
              label={t('language')}
              onChange={handleLanguageChange}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ru">Русский</MenuItem>
              <MenuItem value="kk">Қазақша</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={(e) => handleThemeChange(e.target.checked)}
                />
              }
              label={t('theme')}
            />
          </FormControl>

          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>{t('fontSize')}</Typography>
            <Slider
              value={fontSize}
              onChange={(_, value) => setFontSize(value)}
              min={12}
              max={24}
              step={1}
              marks
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>{t('zoom')}</Typography>
            <Slider
              value={zoom}
              onChange={(_, value) => setZoom(value)}
              min={50}
              max={200}
              step={10}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Settings;