// frontend/src/components/PropertyForm.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { propertyApi, valuationApi } from '../services/api';
import { useNotifications } from '../components/Notifications/NotificationSystem';

const conditionOptions = [
  { value: 'excellent', label: 'Отличное' },
  { value: 'good', label: 'Хорошее' },
  { value: 'fair', label: 'Среднее' },
  { value: 'poor', label: 'Требует ремонта' }
];

const renovationOptions = [
  { value: 'recentlyRenovated', label: 'Недавно отремонтировано' },
  { value: 'partiallyRenovated', label: 'Частично отремонтировано' },
  { value: 'needsRenovation', label: 'Требует ремонта' },
  { value: 'original', label: 'Без ремонта' }
];

const propertyTypeOptions = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Частный дом' },
  { value: 'commercial', label: 'Коммерческая недвижимость' },
  { value: 'land', label: 'Земельный участок' }
];

function PropertyForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [valuationResults, setValuationResults] = useState(null);

  const [subjectProperty, setSubjectProperty] = useState({
    address: '',
    property_type: 'apartment',
    area: '',
    floor_level: '',
    total_floors: '',
    condition: '',
    renovation_status: '',
    location: { lat: 43.2220, lng: 76.8512 }, // Default to Almaty
    price: '',
    features: [{ name: '', value: '', unit: '', description: '' }],
  });

  const [comparableProperties, setComparableProperties] = useState([
    {
      address: '',
      property_type: 'apartment',
      area: '',
      floor_level: '',
      total_floors: '',
      condition: '',
      renovation_status: '',
      location: { lat: 43.2220, lng: 76.8512 },
      price: '',
      features: [{ name: '', value: '', unit: '', description: '' }],
    },
  ]);

  const handleSubjectPropertyChange = (e) => {
    const { name, value } = e.target;
    setSubjectProperty((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComparablePropertyChange = (index, e) => {
    const { name, value } = e.target;
    setComparableProperties((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [name]: value,
      };
      return updated;
    });
  };

  const handleFeatureChange = (propertyIndex, featureIndex, field, value, isSubject = false) => {
    if (isSubject) {
      setSubjectProperty(prev => ({
        ...prev,
        features: prev.features.map((feature, idx) =>
          idx === featureIndex ? { ...feature, [field]: value } : feature
        )
      }));
    } else {
      setComparableProperties(prev => {
        const updated = [...prev];
        updated[propertyIndex] = {
          ...updated[propertyIndex],
          features: updated[propertyIndex].features.map((feature, idx) =>
            idx === featureIndex ? { ...feature, [field]: value } : feature
          )
        };
        return updated;
      });
    }
  };

  const addFeature = (propertyIndex, isSubject = false) => {
    const newFeature = { name: '', value: '', unit: '', description: '' };
    
    if (isSubject) {
      setSubjectProperty(prev => ({
        ...prev,
        features: [...prev.features, newFeature]
      }));
    } else {
      setComparableProperties(prev => {
        const updated = [...prev];
        updated[propertyIndex] = {
          ...updated[propertyIndex],
          features: [...updated[propertyIndex].features, newFeature]
        };
        return updated;
      });
    }
  };

  const removeFeature = (propertyIndex, featureIndex, isSubject = false) => {
    if (isSubject) {
      setSubjectProperty(prev => ({
        ...prev,
        features: prev.features.filter((_, idx) => idx !== featureIndex)
      }));
    } else {
      setComparableProperties(prev => {
        const updated = [...prev];
        updated[propertyIndex] = {
          ...updated[propertyIndex],
          features: updated[propertyIndex].features.filter((_, idx) => idx !== featureIndex)
        };
        return updated;
      });
    }
  };

  const addComparableProperty = () => {
    setComparableProperties((prev) => [
      ...prev,
      {
        address: '',
        property_type: 'apartment',
        area: '',
        floor_level: '',
        total_floors: '',
        condition: '',
        renovation_status: '',
        location: { lat: 43.2220, lng: 76.8512 },
        price: '',
        features: [{ name: '', value: '', unit: '', description: '' }],
      },
    ]);
  };

  const removeComparableProperty = (index) => {
    setComparableProperties((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = ['address', 'area', 'floor_level', 'total_floors', 'condition', 'renovation_status', 'price'];
    
    for (let field of requiredFields) {
      if (!subjectProperty[field]) {
        setError(`Пожалуйста, заполните поле "${field}" для оцениваемого объекта`);
        return false;
      }
    }

    if (comparableProperties.length === 0) {
      setError('Добавьте хотя бы один сравнимый объект');
      return false;
    }

    for (let i = 0; i < comparableProperties.length; i++) {
      const comp = comparableProperties[i];
      for (let field of requiredFields) {
        if (!comp[field]) {
          setError(`Пожалуйста, заполните поле "${field}" для сравнимого объекта ${i + 1}`);
          return false;
        }
      }
    }

    // Numeric validations
    if (parseFloat(subjectProperty.area) <= 0) {
      setError('Площадь должна быть больше 0');
      return false;
    }

    if (parseInt(subjectProperty.floor_level) > parseInt(subjectProperty.total_floors)) {
      setError('Этаж не может быть больше общего количества этажей');
      return false;
    }

    return true;
  };

  const handleSaveProperty = async (propertyData) => {
    try {
      const formattedData = {
        ...propertyData,
        area: parseFloat(propertyData.area),
        floor_level: parseInt(propertyData.floor_level),
        total_floors: parseInt(propertyData.total_floors),
        price: parseFloat(propertyData.price),
        features: propertyData.features.filter(f => f.name && f.value)
      };

      const response = await propertyApi.createProperty(formattedData);
      return response.data;
    } catch (error) {
      console.error('Error saving property:', error);
      throw error;
    }
  };

  const handleCalculateValuation = async () => {
    if (!validateForm()) {
      return;
    }

    setCalculating(true);
    setError('');
    
    try {
      // Save subject property first
      const subjectResponse = await handleSaveProperty(subjectProperty);
      
      // Save comparable properties
      const comparableResponses = await Promise.all(
        comparableProperties.map(comp => handleSaveProperty(comp))
      );

      // Calculate valuation
      const valuationData = {
        subject_property: subjectResponse,
        comparable_properties: comparableResponses,
      };

      const valuationResponse = await valuationApi.calculateValuation(valuationData);
      
      setValuationResults(valuationResponse.data);
      showSuccess('Оценка рассчитана успешно!');
      
      // Store results for results page
      localStorage.setItem('valuationResults', JSON.stringify(valuationResponse.data));
      
      // Navigate to results
      navigate('/dashboard/results');
      
    } catch (error) {
      console.error('Error calculating valuation:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка при расчете оценки';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setCalculating(false);
    }
  };

  const renderFeatures = (features, propertyIndex, isSubject = false) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Дополнительные характеристики
      </Typography>
      {features.map((feature, featureIndex) => (
        <Grid container spacing={2} key={featureIndex} sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Название"
              value={feature.name}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'name', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Значение"
              type="number"
              value={feature.value}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'value', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Единица"
              value={feature.unit}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'unit', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Описание"
              value={feature.description}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'description', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={1}>
            <IconButton
              color="error"
              onClick={() => removeFeature(propertyIndex, featureIndex, isSubject)}
              disabled={features.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => addFeature(propertyIndex, isSubject)}
        size="small"
      >
        Добавить характеристику
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
          Новая оценка недвижимости
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {valuationResults && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6">
              Итоговая оценка: ₸{valuationResults.final_valuation?.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              Уровень достоверности: {(valuationResults.confidence_score * 100)?.toFixed(1)}%
            </Typography>
          </Alert>
        )}

        {/* Subject Property */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, color: '#FF6B35', fontWeight: 'bold' }}>
              Оцениваемый объект
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Адрес"
                  name="address"
                  value={subjectProperty.address}
                  onChange={handleSubjectPropertyChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Тип недвижимости"
                  name="property_type"
                  value={subjectProperty.property_type}
                  onChange={handleSubjectPropertyChange}
                  required
                >
                  {propertyTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Площадь"
                  name="area"
                  type="number"
                  value={subjectProperty.area}
                  onChange={handleSubjectPropertyChange}
                  required
                  InputProps={{ endAdornment: 'м²' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Этаж"
                  name="floor_level"
                  type="number"
                  value={subjectProperty.floor_level}
                  onChange={handleSubjectPropertyChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Всего этажей"
                  name="total_floors"
                  type="number"
                  value={subjectProperty.total_floors}
                  onChange={handleSubjectPropertyChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Состояние"
                  name="condition"
                  value={subjectProperty.condition}
                  onChange={handleSubjectPropertyChange}
                  required
                >
                  {conditionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Статус ремонта"
                  name="renovation_status"
                  value={subjectProperty.renovation_status}
                  onChange={handleSubjectPropertyChange}
                  required
                >
                  {renovationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Цена"
                  name="price"
                  type="number"
                  value={subjectProperty.price}
                  onChange={handleSubjectPropertyChange}
                  required
                  InputProps={{ startAdornment: '₸' }}
                />
              </Grid>
            </Grid>

            {renderFeatures(subjectProperty.features, 0, true)}
          </CardContent>
        </Card>

        {/* Comparable Properties */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#FF6B35', fontWeight: 'bold' }}>
                Сравнимые объекты
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addComparableProperty}
              >
                Добавить объект
              </Button>
            </Box>

            {comparableProperties.map((property, index) => (
              <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Сравнимый объект {index + 1}</Typography>
                  <IconButton
                    color="error"
                    onClick={() => removeComparableProperty(index)}
                    disabled={comparableProperties.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Адрес"
                      name="address"
                      value={property.address}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Тип недвижимости"
                      name="property_type"
                      value={property.property_type}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                    >
                      {propertyTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Площадь"
                      name="area"
                      type="number"
                      value={property.area}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                      InputProps={{ endAdornment: 'м²' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Этаж"
                      name="floor_level"
                      type="number"
                      value={property.floor_level}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Всего этажей"
                      name="total_floors"
                      type="number"
                      value={property.total_floors}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Состояние"
                      name="condition"
                      value={property.condition}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                    >
                      {conditionOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Статус ремонта"
                      name="renovation_status"
                      value={property.renovation_status}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                    >
                      {renovationOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Цена"
                      name="price"
                      type="number"
                      value={property.price}
                      onChange={(e) => handleComparablePropertyChange(index, e)}
                      required
                      InputProps={{ startAdornment: '₸' }}
                    />
                  </Grid>
                </Grid>

                {renderFeatures(property.features, index, false)}
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={calculating ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
            onClick={handleCalculateValuation}
            disabled={calculating}
            sx={{
              bgcolor: '#FF6B35',
              '&:hover': { bgcolor: '#E55A2B' },
              px: 4,
              py: 1.5
            }}
          >
            {calculating ? 'Расчет...' : 'Рассчитать оценку'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PropertyForm;