import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function Analytics({ subjectProperty, comparableProperties, adjustments }) {
  const { t } = useTranslation();

  // Prepare data for price distribution chart
  const priceData = comparableProperties.map((prop, index) => ({
    name: `Property ${index + 1}`,
    price: prop.price,
    adjustedPrice: prop.adjustedPrice,
  }));

  // Prepare data for adjustment weights
  const adjustmentData = Object.entries(adjustments || {}).map(([key, value]) => ({
    name: key,
    value: Math.abs(value),
  }));

  // Prepare data for area vs price scatter plot
  const areaPriceData = comparableProperties.map((prop) => ({
    area: prop.area,
    price: prop.price,
    adjustedPrice: prop.adjustedPrice,
  }));

  // Prepare data for distance vs price line chart
  const distancePriceData = comparableProperties
    .sort((a, b) => a.distance - b.distance)
    .map((prop) => ({
      distance: prop.distance,
      price: prop.price,
      adjustedPrice: prop.adjustedPrice,
    }));

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Price Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('priceDistribution')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="price" fill="#8884d8" name={t('originalPrice')} />
                <Bar dataKey="adjustedPrice" fill="#82ca9d" name={t('adjustedPrice')} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Adjustment Weights Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('adjustmentWeights')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adjustmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {adjustmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Area vs Price Scatter Plot */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('areaVsPrice')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" name={t('area')} unit="m²" />
                <YAxis dataKey="price" name={t('price')} unit="₸" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name={t('originalPrice')}
                  data={areaPriceData}
                  fill="#8884d8"
                />
                <Scatter
                  name={t('adjustedPrice')}
                  data={areaPriceData}
                  fill="#82ca9d"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distance vs Price Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {t('distanceVsPrice')}
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={distancePriceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="distance" name={t('distance')} unit="km" />
                <YAxis dataKey="price" name={t('price')} unit="₸" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  name={t('originalPrice')}
                />
                <Line
                  type="monotone"
                  dataKey="adjustedPrice"
                  stroke="#82ca9d"
                  name={t('adjustedPrice')}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics; 