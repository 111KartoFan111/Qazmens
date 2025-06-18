// frontend/src/components/PropertyCard.js
import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Badge
} from '@mui/material';
import {
  Star,
  StarBorder,
  Visibility,
  Edit,
  Delete,
  LocationOn,
  PhotoCamera
} from '@mui/icons-material';

const PropertyCard = ({ 
  property, 
  onSelect, 
  isSelected, 
  showActions = true,
  onEdit,
  onDelete,
  onToggleFavorite 
}) => {
  const handleCardClick = () => {
    if (onSelect) {
      onSelect(property);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VIP': return '#FF6B35';
      case 'Новое': return '#4CAF50';
      case 'Активно': return '#2196F3';
      case 'Архив': return '#9E9E9E';
      default: return '#2196F3';
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн ₸`;
    }
    return `${price.toLocaleString()} ₸`;
  };

  return (
    <Card 
      sx={{ 
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        },
        border: isSelected ? '2px solid #FF6B35' : '1px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'hidden'
      }}
      onClick={handleCardClick}
    >
      {/* Изображение объекта */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={property.image || '/api/placeholder/300/200'}
          alt={property.address}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Статус объекта */}
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Chip 
            label={property.status || 'Активно'} 
            size="small" 
            sx={{ 
              bgcolor: getStatusColor(property.status),
              color: 'white',
              fontWeight: 'bold'
            }} 
          />
        </Box>

        {/* Количество фото */}
        {property.photoCount && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 8, 
            right: 8,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1
          }}>
            <PhotoCamera fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{property.photoCount}</Typography>
          </Box>
        )}

        {/* Избранное */}
        <IconButton
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
          }}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(property);
          }}
        >
          {property.isFavorite ? 
            <Star sx={{ color: '#FF6B35' }} /> : 
            <StarBorder sx={{ color: '#666' }} />
          }
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Цена */}
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#FF6B35', 
            fontWeight: 'bold', 
            mb: 1,
            fontSize: '1.25rem'
          }}
        >
          {formatPrice(property.price)}
        </Typography>

        {/* Адрес */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5, mt: 0.2 }} />
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {property.address}
          </Typography>
        </Box>

        {/* Характеристики */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`${property.area} м²`} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip 
            label={`${property.floor_level}/${property.total_floors} эт`} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip 
            label={property.condition} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        {/* Цена за м² */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {Math.round(property.price / property.area).toLocaleString()} ₸/м²
        </Typography>

        {/* Нижняя панель */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 1
        }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(property.created_at).toLocaleDateString('ru-RU')}
          </Typography>
          
          {showActions && (
            <Box>
              <IconButton 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  // Открыть детальный просмотр
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
              {onEdit && (
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(property);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(property);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        {/* Индикатор выбора */}
        {isSelected && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 107, 53, 0.1)',
            border: '2px solid #FF6B35',
            borderRadius: 2,
            pointerEvents: 'none'
          }} />
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyCard;