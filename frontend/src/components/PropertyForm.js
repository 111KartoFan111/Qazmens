// frontend/src/components/PropertyForm.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const conditionKeys = ['excellent', 'good', 'fair', 'poor'];
const renovationStatuses = [
  { value: 'recentlyRenovated', label: 'recentlyRenovated' },
  { value: 'partiallyRenovated', label: 'partiallyRenovated' },
  { value: 'needsRenovation', label: 'needsRenovation' },
  { value: 'original', label: 'original' }
];

function PropertyForm() {
  const { t } = useTranslation();
  const { authApi } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    features: [{ name: '', value: '', unit: '' }],
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
      features: [{ name: '', value: '', unit: '' }],
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
    const newFeature = { name: '', value: '', unit: '' };
    
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
        features: [{ name: '', value: '', unit: '' }],
      },
    ]);
  };

  const removeComparableProperty = (index) => {
    setComparableProperties((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Basic validation
    if (!subjectProperty.address || !subjectProperty.area || !subjectProperty.price) {
      setError(t('pleaseProvideRequiredFields'));
      return false;
    }

    if (comparableProperties.length === 0) {
      setError(t('pleaseProvideAtLeastOneComparable'));
      return false;
    }

    for (let i = 0; i < comparableProperties.length; i++) {
      const comp = comparableProperties[i];
      if (!comp.address || !comp.area || !comp.price) {
        setError(t('pleaseProvideRequiredFieldsForAllComparables'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // First, create the subject property
      const subjectResponse = await authApi.post('/api/properties/', {
        ...subjectProperty,
        area: parseFloat(subjectProperty.area),
        floor_level: parseInt(subjectProperty.floor_level),
        total_floors: parseInt(subjectProperty.total_floors),
        price: parseFloat(subjectProperty.price),
      });

      // Create comparable properties
      const comparableResponses = await Promise.all(
        comparableProperties.map(comp =>
          authApi.post('/api/properties/', {
            ...comp,
            area: parseFloat(comp.area),
            floor_level: parseInt(comp.floor_level),
            total_floors: parseInt(comp.total_floors),
            price: parseFloat(comp.price),
          })
        )
      );

      // Calculate valuation
      const valuationResponse = await authApi.post('/api/valuation/calculate', {
        subject_property: subjectResponse.data,
        comparable_properties: comparableResponses.map(r => r.data),
      });

      setValuationResults(valuationResponse.data);
      setSuccess(t('valuationCalculatedSuccessfully'));
      
    } catch (error) {
      console.error('Error submitting valuation request:', error);
      setError(error.response?.data?.detail || t('errorCalculatingValuation'));
    } finally {
      setLoading(false);
    }
  };

  const renderFeatures = (features, propertyIndex, isSubject = false) => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('additionalFeatures')}
      </Typography>
      {features.map((feature, featureIndex) => (
        <Grid container spacing={2} key={featureIndex} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label={t('featureName')}
              value={feature.name}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'name', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={t('value')}
              type="number"
              value={feature.value}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'value', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label={t('unit')}
              value={feature.unit}
              onChange={(e) => handleFeatureChange(propertyIndex, featureIndex, 'unit', e.target.value, isSubject)}
              size="small"
            />
          </Grid>
          <Grid item xs={2}>
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
        {t('addFeature')}
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('propertyValuation')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {valuationResults && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="h6">
              {t('finalValuation')}: ${valuationResults.final_valuation?.toLocaleString()}
            </Typography>
            <Typography variant="body2">
              {t('confidenceScore')}: {(valuationResults.confidence_score * 100)?.toFixed(1)}%
            </Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            {t('subjectProperty')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('address')}
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
                label={t('propertyType')}
                name="property_type"
                value={subjectProperty.property_type}
                onChange={handleSubjectPropertyChange}
                required
              >
                <MenuItem value="apartment">{t('apartment')}</MenuItem>
                <MenuItem value="house">{t('house')}</MenuItem>
                <MenuItem value="commercial">{t('commercial')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('area')}
                name="area"
                type="number"
                value={subjectProperty.area}
                onChange={handleSubjectPropertyChange}
                required
                InputProps={{
                  endAdornment: 'm²'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('floorLevel')}
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
                label={t('totalFloors')}
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
                label={t('condition')}
                name="condition"
                value={subjectProperty.condition}
                onChange={handleSubjectPropertyChange}
                required
              >
                {conditionKeys.map((key) => (
                  <MenuItem key={key} value={key}>
                    {t(key)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label={t('renovationStatus')}
                name="renovation_status"
                value={subjectProperty.renovation_status}
                onChange={handleSubjectPropertyChange}
                required
              >
                {renovationStatuses.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {t(option.label)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('price')}
                name="price"
                type="number"
                value={subjectProperty.price}
                onChange={handleSubjectPropertyChange}
                required
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
          </Grid>

          {renderFeatures(subjectProperty.features, 0, true)}

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            {t('comparableProperties')}
          </Typography>
          {comparableProperties.map((property, index) => (
            <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={11}>
                  <Typography variant="h6">{t('comparableProperty')} {index + 1}</Typography>
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    color="error"
                    onClick={() => removeComparableProperty(index)}
                    disabled={comparableProperties.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('address')}
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
                    label={t('propertyType')}
                    name="property_type"
                    value={property.property_type}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  >
                    <MenuItem value="apartment">{t('apartment')}</MenuItem>
                    <MenuItem value="house">{t('house')}</MenuItem>
                    <MenuItem value="commercial">{t('commercial')}</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('area')}
                    name="area"
                    type="number"
                    value={property.area}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                    InputProps={{
                      endAdornment: 'm²'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('floorLevel')}
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
                    label={t('totalFloors')}
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
                    label={t('condition')}
                    name="condition"
                    value={property.condition}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  >
                    {conditionKeys.map((key) => (
                      <MenuItem key={key} value={key}>
                        {t(key)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t('renovationStatus')}
                    name="renovation_status"
                    value={property.renovation_status}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  >
                    {renovationStatuses.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {t(option.label)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t('price')}
                    name="price"
                    type="number"
                    value={property.price}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                    InputProps={{
                      startAdornment: '$'
                    }}
                  />
                </Grid>
              </Grid>

              {renderFeatures(property.features, index, false)}
            </Box>
          ))}

          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addComparableProperty}
            >
              {t('addComparable')}
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t('calculateValuation')
            )}
          </Button>
        </form>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default PropertyForm;