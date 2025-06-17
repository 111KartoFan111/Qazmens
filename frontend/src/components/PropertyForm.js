import React, { useState } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const conditions = ['excellent', 'good', 'fair', 'poor'];
const renovationStatuses = ['recently_renovated', 'partially_renovated', 'needs_renovation', 'original'];

function PropertyForm() {
  const navigate = useNavigate();
  const [subjectProperty, setSubjectProperty] = useState({
    address: '',
    area: '',
    floor_level: '',
    condition: '',
    distance_from_center: '',
    renovation_status: '',
    features: [{ name: '', value: '', unit: '' }],
    price: '',
  });

  const [comparableProperties, setComparableProperties] = useState([
    {
      address: '',
      area: '',
      floor_level: '',
      condition: '',
      distance_from_center: '',
      renovation_status: '',
      features: [{ name: '', value: '', unit: '' }],
      price: '',
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

  const addComparableProperty = () => {
    setComparableProperties((prev) => [
      ...prev,
      {
        address: '',
        area: '',
        floor_level: '',
        condition: '',
        distance_from_center: '',
        renovation_status: '',
        features: [{ name: '', value: '', unit: '' }],
        price: '',
      },
    ]);
  };

  const removeComparableProperty = (index) => {
    setComparableProperties((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/valuate', {
        subject_property: subjectProperty,
        comparable_properties: comparableProperties,
      });
      // Store results in localStorage for the results page
      localStorage.setItem('valuationResults', JSON.stringify(response.data));
      navigate('/results');
    } catch (error) {
      console.error('Error submitting valuation request:', error);
      // TODO: Add error handling UI
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Property Valuation Form
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Subject Property
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={subjectProperty.address}
                onChange={handleSubjectPropertyChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Area (sq ft)"
                name="area"
                type="number"
                value={subjectProperty.area}
                onChange={handleSubjectPropertyChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor Level"
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
                select
                label="Condition"
                name="condition"
                value={subjectProperty.condition}
                onChange={handleSubjectPropertyChange}
                required
              >
                {conditions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Distance from Center (km)"
                name="distance_from_center"
                type="number"
                value={subjectProperty.distance_from_center}
                onChange={handleSubjectPropertyChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Renovation Status"
                name="renovation_status"
                value={subjectProperty.renovation_status}
                onChange={handleSubjectPropertyChange}
                required
              >
                {renovationStatuses.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={subjectProperty.price}
                onChange={handleSubjectPropertyChange}
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Comparable Properties
          </Typography>
          {comparableProperties.map((property, index) => (
            <Box key={index} sx={{ mb: 4, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={11}>
                  <Typography variant="h6">Comparable Property {index + 1}</Typography>
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
                    label="Address"
                    name="address"
                    value={property.address}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Area (sq ft)"
                    name="area"
                    type="number"
                    value={property.area}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Floor Level"
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
                    select
                    label="Condition"
                    name="condition"
                    value={property.condition}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  >
                    {conditions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Distance from Center (km)"
                    name="distance_from_center"
                    type="number"
                    value={property.distance_from_center}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Renovation Status"
                    name="renovation_status"
                    value={property.renovation_status}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  >
                    {renovationStatuses.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={property.price}
                    onChange={(e) => handleComparablePropertyChange(index, e)}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addComparableProperty}
            >
              Add Comparable Property
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            Calculate Valuation
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export default PropertyForm; 