// frontend/src/components/FilterPanel.js
import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  ExpandMore,
  Close,
  TuneRounded,
  HomeRounded,
  LocationOnRounded,
  MonetizationOnRounded
} from '@mui/icons-material';

const FilterPanel = ({ filters, onFilterChange, onReset, onApply }) => {
  const [expanded, setExpanded] = useState({
    price: true,
    property: true,
    location: false,
    features: false
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  const formatPrice = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}М`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}К`;
    }
    return value.toString();
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== null && value !== undefined && 
    !(Array.isArray(value) && value.length === 0)
  ).length;

  return (
    <Paper 
      sx={{ 
        p: 0,
        height: 'fit-content', 
        position: 'sticky', 
        top: 20,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {/* Заголовок */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: '#FF6B35',
        color: 'white',
        borderRadius: '8px 8px 0 0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneRounded />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Фильтры
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={activeFiltersCount} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          )}
        </Box>
        <Button 
          size="small" 
          onClick={onReset} 
          sx={{ 
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
          }}
        >
          Сбросить
        </Button>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Быстрые фильтры */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Быстрый поиск
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Район, улица, ЖК..."
            value={filters.quickSearch || ''}
            onChange={(e) => onFilterChange('quickSearch', e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['Алмалинский', 'Медеуский', 'Бостандыкский'].map((district) => (
              <Chip
                key={district}
                label={district}
                size="small"
                clickable
                variant={filters.district === district ? 'filled' : 'outlined'}
                onClick={() => onFilterChange('district', 
                  filters.district === district ? '' : district
                )}
                sx={{
                  bgcolor: filters.district === district ? '#FF6B35' : 'transparent',
                  color: filters.district === district ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: filters.district === district ? '#E55A2B' : 'rgba(255, 107, 53, 0.1)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Цена */}
        <Accordion 
          expanded={expanded.price} 
          onChange={handleAccordionChange('price')}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MonetizationOnRounded sx={{ color: '#FF6B35' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Цена
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="От"
                  type="number"
                  value={filters.priceFrom || ''}
                  onChange={(e) => onFilterChange('priceFrom', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="До"
                  type="number"
                  value={filters.priceTo || ''}
                  onChange={(e) => onFilterChange('priceTo', e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                {formatPrice(filters.priceRange?.[0] || 0)} ₸ - {formatPrice(filters.priceRange?.[1] || 100000000)} ₸
              </Typography>
              <Slider
                value={filters.priceRange || [0, 100000000]}
                onChange={(e, value) => onFilterChange('priceRange', value)}
                min={0}
                max={100000000}
                step={1000000}
                sx={{ 
                  color: '#FF6B35',
                  '& .MuiSlider-thumb': {
                    backgroundColor: '#FF6B35'
                  }
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Тип недвижимости */}
        <Accordion 
          expanded={expanded.property} 
          onChange={handleAccordionChange('property')}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HomeRounded sx={{ color: '#FF6B35' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Недвижимость
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Тип недвижимости</InputLabel>
                              <Select
                value={filters.property_type || ''}
                onChange={(e) => onFilterChange('property_type', e.target.value)}
              >
                <MenuItem value="">Все типы</MenuItem>
                <MenuItem value="apartment">Квартира</MenuItem>
                <MenuItem value="house">Частный дом</MenuItem>
                <MenuItem value="commercial">Коммерческая</MenuItem>
                <MenuItem value="land">Земельный участок</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                Площадь: {filters.areaRange?.[0] || 0} - {filters.areaRange?.[1] || 500} м²
              </Typography>
              <Slider
                value={filters.areaRange || [0, 500]}
                onChange={(e, value) => onFilterChange('areaRange', value)}
                min={0}
                max={500}
                step={5}
                sx={{ color: '#FF6B35' }}
              />
            </Box>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Состояние</InputLabel>
              <Select
                value={filters.condition || ''}
                onChange={(e) => onFilterChange('condition', e.target.value)}
              >
                <MenuItem value="">Любое</MenuItem>
                <MenuItem value="excellent">Отличное</MenuItem>
                <MenuItem value="good">Хорошее</MenuItem>
                <MenuItem value="fair">Среднее</MenuItem>
                <MenuItem value="poor">Требует ремонта</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Этаж</InputLabel>
              <Select
                value={filters.floor || ''}
                onChange={(e) => onFilterChange('floor', e.target.value)}
              >
                <MenuItem value="">Любой</MenuItem>
                <MenuItem value="1">1 этаж</MenuItem>
                <MenuItem value="2-5">2-5 этаж</MenuItem>
                <MenuItem value="6-10">6-10 этаж</MenuItem>
                <MenuItem value="10+">Выше 10 этажа</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Расположение */}
        <Accordion 
          expanded={expanded.location} 
          onChange={handleAccordionChange('location')}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnRounded sx={{ color: '#FF6B35' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Расположение
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Район</InputLabel>
              <Select
                value={filters.district || ''}
                onChange={(e) => onFilterChange('district', e.target.value)}
              >
                <MenuItem value="">Все районы</MenuItem>
                <MenuItem value="Алмалинский">Алмалинский</MenuItem>
                <MenuItem value="Ауэзовский">Ауэзовский</MenuItem>
                <MenuItem value="Бостандыкский">Бостандыкский</MenuItem>
                <MenuItem value="Жетысуский">Жетысуский</MenuItem>
                <MenuItem value="Медеуский">Медеуский</MenuItem>
                <MenuItem value="Наурызбайский">Наурызбайский</MenuItem>
                <MenuItem value="Турксибский">Турксибский</MenuItem>
                <MenuItem value="Алатауский">Алатауский</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Улица или ЖК"
              value={filters.street || ''}
              onChange={(e) => onFilterChange('street', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                Удаленность от центра: до {filters.distanceFromCenter || 50} км
              </Typography>
              <Slider
                value={filters.distanceFromCenter || 50}
                onChange={(e, value) => onFilterChange('distanceFromCenter', value)}
                min={1}
                max={50}
                step={1}
                sx={{ color: '#FF6B35' }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Дополнительные параметры */}
        <Accordion 
          expanded={expanded.features} 
          onChange={handleAccordionChange('features')}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Дополнительно
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.withPhotos || false}
                  onChange={(e) => onFilterChange('withPhotos', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FF6B35'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FF6B35'
                    }
                  }}
                />
              }
              label="Только с фото"
              sx={{ mb: 1 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filters.withVirtualTour || false}
                  onChange={(e) => onFilterChange('withVirtualTour', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FF6B35'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FF6B35'
                    }
                  }}
                />
              }
              label="С виртуальным туром"
              sx={{ mb: 1 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={filters.newBuilding || false}
                  onChange={(e) => onFilterChange('newBuilding', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FF6B35'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FF6B35'
                    }
                  }}
                />
              }
              label="Новостройка"
              sx={{ mb: 1 }}
            />

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Статус ремонта</InputLabel>
              <Select
                value={filters.renovation_status || ''}
                onChange={(e) => onFilterChange('renovation_status', e.target.value)}
              >
                <MenuItem value="">Любой</MenuItem>
                <MenuItem value="recentlyRenovated">Евроремонт</MenuItem>
                <MenuItem value="partiallyRenovated">Косметический</MenuItem>
                <MenuItem value="needsRenovation">Требует ремонта</MenuItem>
                <MenuItem value="original">Без ремонта</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Год постройки</InputLabel>
              <Select
                value={filters.buildYear || ''}
                onChange={(e) => onFilterChange('buildYear', e.target.value)}
              >
                <MenuItem value="">Любой</MenuItem>
                <MenuItem value="2020+">После 2020</MenuItem>
                <MenuItem value="2010-2020">2010-2020</MenuItem>
                <MenuItem value="2000-2010">2000-2010</MenuItem>
                <MenuItem value="1990-2000">1990-2000</MenuItem>
                <MenuItem value="-1990">До 1990</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Кнопка применить */}
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onApply}
            sx={{
              bgcolor: '#FF6B35',
              color: 'white',
              fontWeight: 'bold',
              py: 1.2,
              '&:hover': {
                bgcolor: '#E55A2B'
              }
            }}
          >
            Применить фильтры
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FilterPanel;