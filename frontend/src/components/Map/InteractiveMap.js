// frontend/src/components/Map/InteractiveMap.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Switch,
  FormControlLabel,
  Slider,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Layers,
  MyLocation,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Close,
  LocationOn,
  Home,
  Business,
  School,
  LocalHospital,
  DirectionsBus,
  ShoppingCart,
  Park,
  Filter,
  Map as MapIcon,
  Satellite,
  Add,
  Search,
  Route,
  Refresh
} from '@mui/icons-material';
import { propertyApi } from '../../services/api';
import { useNotifications } from '../Notifications/NotificationSystem';

// Компонент маркера объекта с реальными данными
const PropertyMarker = ({ property, onClick, position, isSelected }) => (
  <Box
    onClick={() => onClick(property)}
    sx={{
      position: 'absolute',
      left: position.x - 12,
      top: position.y - 24,
      width: 24,
      height: 24,
      bgcolor: isSelected ? '#FF6B35' : '#2196F3',
      borderRadius: '50% 50% 50% 0',
      transform: 'rotate(-45deg)',
      cursor: 'pointer',
      border: '2px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'rotate(-45deg) scale(1.2)'
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(45deg)',
        width: 8,
        height: 8,
        bgcolor: 'white',
        borderRadius: '50%'
      }
    }}
  />
);

// Компонент боковой панели с информацией о недвижимости
const PropertyInfoPanel = ({ property, onClose, onContact, onViewDetails }) => {
  if (!property) return null;

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₸`;
    }
    return `${price.toLocaleString()} ₸`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <Drawer
      anchor="right"
      open={Boolean(property)}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, p: 0 }
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Информация об объекте
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Фото объекта (заглушка) */}
        <Box
          sx={{
            width: '100%',
            height: 200,
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Home sx={{ fontSize: 64, color: '#ccc' }} />
        </Box>

        {/* Основная информация */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF6B35', mb: 1 }}>
          {formatPrice(property.price)}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {property.address}
        </Typography>

        {/* Характеристики */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={`${property.area} м²`} size="small" />
          <Chip label={`${property.floor_level}/${property.total_floors} эт`} size="small" />
          <Chip label={property.condition} size="small" />
          <Chip label={property.property_type} size="small" />
        </Box>

        {/* Цена за м² */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {Math.round(property.price / property.area).toLocaleString()} ₸/м²
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Дополнительная информация */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Дополнительная информация
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemText 
              primary="Статус ремонта" 
              secondary={property.renovation_status} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Дата добавления" 
              secondary={formatDate(property.created_at)} 
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Последнее обновление" 
              secondary={formatDate(property.updated_at)} 
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Действия */}
        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onViewDetails(property)}
            sx={{
              bgcolor: '#FF6B35',
              '&:hover': { bgcolor: '#E55A2B' }
            }}
          >
            Подробная информация
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => onContact(property)}
          >
            Связаться с агентом
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

// Компонент панели управления картой
const MapControls = ({ 
  mapType, 
  onMapTypeChange, 
  showHeatmap,
  onHeatmapToggle,
  priceRange,
  onPriceRangeChange,
  onRefresh
}) => {
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <>
      {/* Кнопки управления */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1000 }}>
        <Paper sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title="Слои карты">
              <IconButton onClick={() => setControlsOpen(true)}>
                <Layers />
              </IconButton>
            </Tooltip>
            <Tooltip title="Обновить данные">
              <IconButton onClick={onRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Моё местоположение">
              <IconButton>
                <MyLocation />
              </IconButton>
            </Tooltip>
            <Tooltip title="Полный экран">
              <IconButton>
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Box>

      {/* Панель настроек */}
      <Drawer
        anchor="left"
        open={controlsOpen}
        onClose={() => setControlsOpen(false)}
        PaperProps={{
          sx: { width: 320 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Настройки карты
            </Typography>
            <IconButton onClick={() => setControlsOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {/* Тип карты */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Тип карты
          </Typography>
          <ButtonGroup fullWidth sx={{ mb: 3 }}>
            <Button
              variant={mapType === 'roadmap' ? 'contained' : 'outlined'}
              onClick={() => onMapTypeChange('roadmap')}
              startIcon={<MapIcon />}
            >
              Карта
            </Button>
            <Button
              variant={mapType === 'satellite' ? 'contained' : 'outlined'}
              onClick={() => onMapTypeChange('satellite')}
              startIcon={<Satellite />}
            >
              Спутник
            </Button>
          </ButtonGroup>

          {/* Слои */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Слои
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={showHeatmap}
                onChange={onHeatmapToggle}
                color="primary"
              />
            }
            label="Тепловая карта цен"
            sx={{ mb: 3 }}
          />

          {/* Фильтр по цене */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Диапазон цен
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ₸{priceRange[0].toLocaleString()} - ₸{priceRange[1].toLocaleString()}
          </Typography>
          <Slider
            value={priceRange}
            onChange={onPriceRangeChange}
            valueLabelDisplay="auto"
            min={0}
            max={200000000}
            step={5000000}
            sx={{ color: '#FF6B35', mb: 3 }}
          />

          {/* Инфраструктура */}
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Показать инфраструктуру
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon><School /></ListItemIcon>
              <ListItemText primary="Школы" />
              <Switch size="small" />
            </ListItem>
            <ListItem>
              <ListItemIcon><LocalHospital /></ListItemIcon>
              <ListItemText primary="Больницы" />
              <Switch size="small" />
            </ListItem>
            <ListItem>
              <ListItemIcon><DirectionsBus /></ListItemIcon>
              <ListItemText primary="Транспорт" />
              <Switch size="small" />
            </ListItem>
            <ListItem>
              <ListItemIcon><ShoppingCart /></ListItemIcon>
              <ListItemText primary="ТРЦ" />
              <Switch size="small" />
            </ListItem>
            <ListItem>
              <ListItemIcon><Park /></ListItemIcon>
              <ListItemText primary="Парки" />
              <Switch size="small" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

// Компонент статистики на карте с реальными данными
const MapStatistics = ({ properties, selectedArea, loading }) => {
  if (loading) {
    return (
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 20, 
          right: 20, 
          p: 2, 
          minWidth: 280,
          zIndex: 1000 
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Загрузка данных...</Typography>
        </Box>
      </Paper>
    );
  }

  if (properties.length === 0) {
    return (
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 20, 
          right: 20, 
          p: 2, 
          minWidth: 280,
          zIndex: 1000 
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Нет данных
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Объекты не найдены
        </Typography>
      </Paper>
    );
  }

  const avgPrice = Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length);
  const avgPricePerSqm = Math.round(properties.reduce((sum, p) => sum + (p.price / p.area), 0) / properties.length);
  
  const propertyTypes = properties.reduce((acc, p) => {
    acc[p.property_type] = (acc[p.property_type] || 0) + 1;
    return acc;
  }, {});

  const typeLabels = {
    'apartment': 'Квартиры',
    'house': 'Дома',
    'commercial': 'Коммерческая',
    'land': 'Земля'
  };

  return (
    <Paper 
      sx={{ 
        position: 'absolute', 
        top: 20, 
        right: 20, 
        p: 2, 
        minWidth: 280,
        zIndex: 1000 
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Статистика {selectedArea || 'по всему городу'}
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Объектов:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {properties.length}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Средняя цена:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
          ₸{avgPrice.toLocaleString()}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2">Цена за м²:</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          ₸{avgPricePerSqm.toLocaleString()}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {Object.entries(propertyTypes).map(([type, count]) => (
          <Chip 
            key={type}
            label={`${typeLabels[type] || type}: ${count}`} 
            size="small" 
          />
        ))}
      </Box>
    </Paper>
  );
};

// Главный компонент интерактивной карты с исправленным спутниковым режимом
const InteractiveMap = () => {
  const mapRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200000000]);
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState({ lat: 43.2220, lng: 76.8512 }); // Алматы
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useNotifications();

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadPropertiesData();
  }, []);

  // Фильтрация объектов по цене
  useEffect(() => {
    const filtered = properties.filter(property => 
      property.price >= priceRange[0] && property.price <= priceRange[1]
    );
    setFilteredProperties(filtered);
  }, [properties, priceRange]);

  const loadPropertiesData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await propertyApi.getProperties({ limit: 100 });
      const propertiesData = response.data;

      // Фильтруем объекты с координатами и ценами
      const validProperties = propertiesData.filter(property => 
        property.location && 
        property.location.lat && 
        property.location.lng &&
        property.price &&
        property.area
      );

      setProperties(validProperties);

      // Если есть данные, центрируем карту
      if (validProperties.length > 0) {
        const avgLat = validProperties.reduce((sum, p) => sum + p.location.lat, 0) / validProperties.length;
        const avgLng = validProperties.reduce((sum, p) => sum + p.location.lng, 0) / validProperties.length;
        setCenter({ lat: avgLat, lng: avgLng });
      }

      showSuccess(`Загружено ${validProperties.length} объектов недвижимости`);

    } catch (error) {
      console.error('Error loading properties:', error);
      setError('Ошибка загрузки данных о недвижимости');
      showError('Не удалось загрузить данные о недвижимости');
      
      // Используем моковые данные при ошибке
      const mockProperties = generateMockProperties();
      setProperties(mockProperties);
    } finally {
      setLoading(false);
    }
  };

  // Генерация моковых данных при ошибке
  const generateMockProperties = () => {
    const mockData = [];
    const baseCoordinates = { lat: 43.2220, lng: 76.8512 };
    
    for (let i = 0; i < 20; i++) {
      mockData.push({
        id: i + 1,
        address: `ул. Примерная, ${i + 1}, Алматы`,
        property_type: ['apartment', 'house', 'commercial'][Math.floor(Math.random() * 3)],
        area: Math.floor(Math.random() * 100) + 50,
        floor_level: Math.floor(Math.random() * 20) + 1,
        total_floors: Math.floor(Math.random() * 25) + 5,
        condition: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
        renovation_status: ['recentlyRenovated', 'partiallyRenovated', 'needsRenovation', 'original'][Math.floor(Math.random() * 4)],
        price: (Math.floor(Math.random() * 80) + 20) * 1000000,
        location: {
          lat: baseCoordinates.lat + (Math.random() - 0.5) * 0.1,
          lng: baseCoordinates.lng + (Math.random() - 0.5) * 0.1
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return mockData;
  };

  // Конвертация координат в пиксели (упрощенная версия)
  const coordinatesToPixels = (lat, lng) => {
    const mapWidth = 800;
    const mapHeight = 600;
    
    // Примерные границы Алматы
    const bounds = {
      north: 43.35,
      south: 43.15,
      east: 76.95,
      west: 76.75
    };
    
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * mapWidth;
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * mapHeight;
    
    return { x: Math.max(0, Math.min(mapWidth, x)), y: Math.max(0, Math.min(mapHeight, y)) };
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const handleClosePanel = () => {
    setSelectedProperty(null);
  };

  const handleContactAgent = (property) => {
    showSuccess(`Запрос на связь с агентом по объекту: ${property.address}`);
  };

  const handleViewDetails = (property) => {
    showSuccess(`Переход к детальной информации: ${property.address}`);
  };

  const handleRefresh = () => {
    loadPropertiesData();
  };

  // Функция получения стиля карты в зависимости от типа
  const getMapStyle = (type) => {
    if (type === 'satellite') {
      return {
        backgroundImage: `
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="satellite" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="%23654321"/><circle cx="5" cy="5" r="1" fill="%23333"/><circle cx="15" cy="8" r="1" fill="%23333"/><circle cx="10" cy="15" r="1" fill="%23333"/></pattern></defs><rect width="100" height="100" fill="url(%23satellite)"/></svg>')
        `,
        backgroundColor: '#8B4513'
      };
    }
    return {
      backgroundImage: `
        radial-gradient(circle at 25% 25%, #e3f2fd 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, #f3e5f5 0%, transparent 50%),
        linear-gradient(45deg, #e8f5e8 0%, #f0f8ff 100%)
      `,
      backgroundColor: '#f0f8ff'
    };
  };

  // SpeedDial действия
  const speedDialActions = [
    { icon: <Add />, name: 'Добавить объект', onClick: () => showSuccess('Добавление нового объекта') },
    { icon: <Search />, name: 'Поиск', onClick: () => showSuccess('Открытие поиска') },
    { icon: <Route />, name: 'Построить маршрут', onClick: () => showSuccess('Построение маршрута') },
    { icon: <Filter />, name: 'Фильтры', onClick: () => showSuccess('Открытие фильтров') }
  ];

  if (error && properties.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleRefresh} startIcon={<Refresh />}>
          Повторить попытку
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* Основная карта */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          ...getMapStyle(mapType),
          backgroundSize: mapType === 'satellite' ? '200px 200px' : '400px 400px, 400px 400px, 100% 100%',
          transition: 'all 0.5s ease-in-out'
        }}
      >
        {/* Маркеры объектов */}
        {filteredProperties.map((property) => {
          const pixelPosition = coordinatesToPixels(property.location.lat, property.location.lng);
          
          return (
            <PropertyMarker
              key={property.id}
              property={property}
              position={pixelPosition}
              onClick={handlePropertyClick}
              isSelected={selectedProperty?.id === property.id}
            />
          );
        })}

        {/* Тепловая карта (если включена) */}
        {showHeatmap && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 30% 40%, rgba(255, 107, 53, 0.3) 0%, transparent 20%),
                radial-gradient(circle at 70% 60%, rgba(33, 150, 243, 0.3) 0%, transparent 25%),
                radial-gradient(circle at 50% 80%, rgba(76, 175, 80, 0.3) 0%, transparent 15%)
              `,
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Индикатор загрузки */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography>Загрузка объектов недвижимости...</Typography>
          </Box>
        )}

        {/* Индикатор спутникового режима */}
        {mapType === 'satellite' && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 120,
              left: 20,
              p: 1,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Satellite sx={{ fontSize: 16 }} />
            <Typography variant="body2">Спутниковый режим</Typography>
          </Box>
        )}
      </Box>

      {/* Элементы управления */}
      <MapControls
        mapType={mapType}
        onMapTypeChange={setMapType}
        showHeatmap={showHeatmap}
        onHeatmapToggle={() => setShowHeatmap(!showHeatmap)}
        priceRange={priceRange}
        onPriceRangeChange={(e, value) => setPriceRange(value)}
        onRefresh={handleRefresh}
      />

      {/* Статистика */}
      <MapStatistics 
        properties={filteredProperties} 
        loading={loading}
      />

      {/* Панель с информацией об объекте */}
      <PropertyInfoPanel
        property={selectedProperty}
        onClose={handleClosePanel}
        onContact={handleContactAgent}
        onViewDetails={handleViewDetails}
      />

      {/* Быстрые действия */}
      <SpeedDial
        ariaLabel="Действия карты"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        FabProps={{
          sx: {
            bgcolor: '#FF6B35',
            '&:hover': { bgcolor: '#E55A2B' }
          }
        }}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Информация о количестве объектов */}
      {!loading && (
        <Paper
          sx={{
            position: 'absolute',
            bottom: 80,
            left: 20,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocationOn sx={{ color: '#FF6B35' }} />
          <Typography variant="body2">
            Показано {filteredProperties.length} из {properties.length} объектов
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default InteractiveMap;