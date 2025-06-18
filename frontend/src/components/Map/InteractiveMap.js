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
  Avatar,
  Divider,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
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
  Restaurant,
  ShoppingCart,
  Park,
  Filter,
  Tune,
  Map as MapIcon,
  Satellite,
  Traffic,
  Timeline,
  Add,
  Search,
  Route
} from '@mui/icons-material';

// Компонент кластера маркеров
const ClusterMarker = ({ count, onClick, position }) => (
  <Box
    onClick={onClick}
    sx={{
      position: 'absolute',
      left: position.x - 20,
      top: position.y - 20,
      width: 40,
      height: 40,
      bgcolor: '#FF6B35',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      transform: 'scale(1)',
      transition: 'transform 0.2s ease',
      '&:hover': {
        transform: 'scale(1.1)'
      }
    }}
  >
    {count}
  </Box>
);

// Компонент маркера объекта
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

// Компонент боковой панели с информацией
const PropertyInfoPanel = ({ property, onClose, onContact, onViewDetails }) => {
  if (!property) return null;

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
        {/* Фото объекта */}
        <Box
          sx={{
            width: '100%',
            height: 200,
            backgroundImage: `url(${property.image || '/api/placeholder/400/200'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 2,
            mb: 2
          }}
        />

        {/* Основная информация */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF6B35', mb: 1 }}>
          ₸{property.price?.toLocaleString()}
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

        {/* Инфраструктура */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Ближайшая инфраструктура
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon><School fontSize="small" /></ListItemIcon>
            <ListItemText primary="Школа №15" secondary="350 м" />
          </ListItem>
          <ListItem>
            <ListItemIcon><LocalHospital fontSize="small" /></ListItemIcon>
            <ListItemText primary="Поликлиника" secondary="800 м" />
          </ListItem>
          <ListItem>
            <ListItemIcon><DirectionsBus fontSize="small" /></ListItemIcon>
            <ListItemText primary="Автобусная остановка" secondary="120 м" />
          </ListItem>
          <ListItem>
            <ListItemIcon><ShoppingCart fontSize="small" /></ListItemIcon>
            <ListItemText primary="ТРЦ Dostyk Plaza" secondary="1.2 км" />
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
  showTraffic, 
  onTrafficToggle,
  showHeatmap,
  onHeatmapToggle,
  priceRange,
  onPriceRangeChange
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
            <Tooltip title="Моё местоположение">
              <IconButton>
                <MyLocation />
              </IconButton>
            </Tooltip>
            <Tooltip title="Увеличить">
              <IconButton>
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Уменьшить">
              <IconButton>
                <ZoomOut />
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
                checked={showTraffic}
                onChange={onTrafficToggle}
                color="primary"
              />
            }
            label="Показать пробки"
            sx={{ mb: 1 }}
          />

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

// Компонент статистики на карте
const MapStatistics = ({ properties, selectedArea }) => (
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
        ₸{Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length).toLocaleString()}
      </Typography>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2">Цена за м²:</Typography>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        ₸{Math.round(properties.reduce((sum, p) => sum + (p.price / p.area), 0) / properties.length).toLocaleString()}
      </Typography>
    </Box>
    
    <Divider sx={{ my: 1 }} />
    
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip label="Квартиры" size="small" />
      <Chip label="Дома" size="small" />
      <Chip label="Коммерческая" size="small" />
    </Box>
  </Paper>
);

// Главный компонент интерактивной карты
const InteractiveMap = () => {
  const mapRef = useRef(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200000000]);
  const [zoom, setZoom] = useState(12);
  const [center, setCenter] = useState({ lat: 43.2220, lng: 76.8512 }); // Алматы

  // Моковые данные объектов
  const [properties] = useState([
    {
      id: 1,
      lat: 43.2220,
      lng: 76.8512,
      address: "ул. Абая, 150, Алматы",
      price: 45000000,
      area: 85,
      floor_level: 12,
      total_floors: 25,
      condition: "excellent",
      property_type: "apartment",
      image: "/api/placeholder/400/200"
    },
    {
      id: 2,
      lat: 43.2180,
      lng: 76.8480,
      address: "мкр. Самал-2, 78, Алматы",
      price: 38000000,
      area: 72,
      floor_level: 8,
      total_floors: 16,
      condition: "good",
      property_type: "apartment",
      image: "/api/placeholder/400/200"
    },
    {
      id: 3,
      lat: 43.2280,
      lng: 76.8580,
      address: "ул. Толе би, 45, Алматы",
      price: 65000000,
      area: 120,
      floor_level: 2,
      total_floors: 3,
      condition: "excellent",
      property_type: "house",
      image: "/api/placeholder/400/200"
    },
    {
      id: 4,
      lat: 43.2150,
      lng: 76.8420,
      address: "пр. Достык, 97, Алматы",
      price: 52000000,
      area: 95,
      floor_level: 15,
      total_floors: 20,
      condition: "good",
      property_type: "apartment",
      image: "/api/placeholder/400/200"
    },
    {
      id: 5,
      lat: 43.2300,
      lng: 76.8600,
      address: "ул. Фурманова, 123, Алматы",
      price: 42000000,
      area: 78,
      floor_level: 5,
      total_floors: 12,
      condition: "fair",
      property_type: "apartment",
      image: "/api/placeholder/400/200"
    }
  ]);

  // Фильтрация объектов по цене
  const filteredProperties = properties.filter(property => 
    property.price >= priceRange[0] && property.price <= priceRange[1]
  );

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
  };

  const handleClosePanel = () => {
    setSelectedProperty(null);
  };

  const handleContactAgent = (property) => {
    console.log('Связаться с агентом для объекта:', property);
  };

  const handleViewDetails = (property) => {
    console.log('Подробная информация об объекте:', property);
  };

  // SpeedDial действия
  const speedDialActions = [
    { icon: <Add />, name: 'Добавить объект' },
    { icon: <Search />, name: 'Поиск' },
    { icon: <Route />, name: 'Построить маршрут' },
    { icon: <Filter />, name: 'Фильтры' }
  ];

  return (
    <Box sx={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* Основная карта */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: '#f0f8ff',
          position: 'relative',
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #e3f2fd 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #f3e5f5 0%, transparent 50%),
            linear-gradient(45deg, #e8f5e8 0%, #f0f8ff 100%)
          `,
          backgroundSize: '400px 400px, 400px 400px, 100% 100%'
        }}
      >
        {/* Маркеры объектов */}
        {filteredProperties.map((property) => {
          // Простое преобразование координат в пиксели (заглушка)
          const x = ((property.lng - 76.8200) / 0.0500) * 800 + 200;
          const y = ((43.2400 - property.lat) / 0.0300) * 600 + 100;
          
          return (
            <PropertyMarker
              key={property.id}
              property={property}
              position={{ x, y }}
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
      </Box>

      {/* Элементы управления */}
      <MapControls
        mapType={mapType}
        onMapTypeChange={setMapType}
        showTraffic={showTraffic}
        onTrafficToggle={() => setShowTraffic(!showTraffic)}
        showHeatmap={showHeatmap}
        onHeatmapToggle={() => setShowHeatmap(!showHeatmap)}
        priceRange={priceRange}
        onPriceRangeChange={(e, value) => setPriceRange(value)}
      />

      {/* Статистика */}
      <MapStatistics properties={filteredProperties} />

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
          />
        ))}
      </SpeedDial>

      {/* Индикатор загрузки (если нужен) */}
      {showTraffic && (
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
          <Traffic sx={{ color: '#FF6B35' }} />
          <Typography variant="body2">Данные о пробках</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default InteractiveMap;