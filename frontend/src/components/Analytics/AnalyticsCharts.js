// frontend/src/components/Analytics/AnalyticsCharts.js
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  LocationOn,
  CalendarToday,
  FilterList,
  Download,
  Refresh
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';

const COLORS = ['#FF6B35', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722'];

// Компонент карточки метрики
const MetricCard = ({ title, value, change, changeType, icon, color }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {changeType === 'increase' ? (
                <TrendingUp sx={{ color: '#4CAF50', mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ color: '#f44336', mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  color: changeType === 'increase' ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold'
                }}
              >
                {change}
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar 
          sx={{ 
            bgcolor: `${color}20`,
            color: color,
            width: 56,
            height: 56
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

// Компонент графика трендов цен
const PriceTrendChart = ({ data, period }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Динамика цен на недвижимость
        </Typography>
        <ButtonGroup size="small">
          <Button variant={period === '7d' ? 'contained' : 'outlined'}>7Д</Button>
          <Button variant={period === '1m' ? 'contained' : 'outlined'}>1М</Button>
          <Button variant={period === '3m' ? 'contained' : 'outlined'}>3М</Button>
          <Button variant={period === '1y' ? 'contained' : 'outlined'}>1Г</Button>
        </ButtonGroup>
      </Box>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" stroke="#666" />
          <YAxis yAxisId="price" orientation="left" stroke="#666" />
          <YAxis yAxisId="volume" orientation="right" stroke="#666" />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Area
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#FF6B35"
            fill="url(#colorPrice)"
            name="Средняя цена за м²"
          />
          <Bar 
            yAxisId="volume"
            dataKey="volume" 
            fill="#2196F3" 
            name="Количество сделок"
            opacity={0.7}
          />
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Компонент распределения цен по районам
const DistrictPriceChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Цены по районам
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" stroke="#666" />
          <YAxis dataKey="name" type="category" stroke="#666" width={100} />
          <Tooltip 
            formatter={(value) => [`${value.toLocaleString()} ₸/м²`, 'Цена']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <Bar dataKey="price" fill="#FF6B35" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Компонент распределения типов недвижимости
const PropertyTypeChart = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Распределение по типам
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Компонент таблицы топ объектов
const TopPropertiesTable = ({ properties }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Топ оценок за месяц
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Объект</TableCell>
              <TableCell align="right">Оценочная стоимость</TableCell>
              <TableCell align="center">Точность</TableCell>
              <TableCell align="center">Дата</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property, index) => (
              <TableRow key={property.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: COLORS[index % COLORS.length],
                        mr: 2,
                        width: 32,
                        height: 32
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {property.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.area} м² • {property.type}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                    {property.value.toLocaleString()} ₸
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={`${property.accuracy}%`}
                    size="small"
                    color={property.accuracy > 90 ? 'success' : property.accuracy > 80 ? 'warning' : 'error'}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" color="text.secondary">
                    {property.date}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

// Главный компонент аналитики
const AnalyticsCharts = () => {
  const [period, setPeriod] = useState('1m');
  const [district, setDistrict] = useState('all');

  // Моковые данные
  const metrics = [
    {
      title: 'Всего оценок',
      value: '247',
      change: '+12%',
      changeType: 'increase',
      icon: <Assessment />,
      color: '#FF6B35'
    },
    {
      title: 'Средняя точность',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'increase',
      icon: <TrendingUp />,
      color: '#4CAF50'
    },
    {
      title: 'Активных районов',
      value: '8',
      change: '+1',
      changeType: 'increase',
      icon: <LocationOn />,
      color: '#2196F3'
    },
    {
      title: 'Время на оценку',
      value: '2.4ч',
      change: '-15мин',
      changeType: 'increase',
      icon: <CalendarToday />,
      color: '#9C27B0'
    }
  ];

  const marketData = [
    { month: 'Янв', price: 520000, volume: 120 },
    { month: 'Фев', price: 535000, volume: 98 },
    { month: 'Мар', price: 548000, volume: 156 },
    { month: 'Апр', price: 562000, volume: 134 },
    { month: 'Май', price: 578000, volume: 178 },
    { month: 'Июн', price: 585000, volume: 165 }
  ];

  const districtData = [
    { name: 'Медеуский', price: 650000, growth: 7.1 },
    { name: 'Алмалинский', price: 620000, growth: 5.2 },
    { name: 'Бостандыкский', price: 580000, growth: 3.8 },
    { name: 'Жетысуский', price: 520000, growth: 4.2 },
    { name: 'Ауэзовский', price: 480000, growth: 2.4 }
  ];

  const propertyTypeData = [
    { name: 'Квартиры', value: 65 },
    { name: 'Дома', value: 20 },
    { name: 'Коммерческая', value: 10 },
    { name: 'Земля', value: 5 }
  ];

  const topProperties = [
    {
      id: 1,
      address: 'ул. Досмукамедова, 97',
      area: 120,
      type: 'Квартира',
      value: 85000000,
      accuracy: 96,
      date: '15.06.2024'
    },
    {
      id: 2,
      address: 'мкр. Самал-2, 78',
      area: 85,
      type: 'Квартира',
      value: 72000000,
      accuracy: 94,
      date: '14.06.2024'
    },
    {
      id: 3,
      address: 'ул. Толе би, 45',
      area: 200,
      type: 'Дом',
      value: 125000000,
      accuracy: 92,
      date: '13.06.2024'
    }
  ];

  return (
    <Box>
      {/* Заголовок и фильтры */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Аналитика рынка
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Район</InputLabel>
            <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
              <MenuItem value="all">Все районы</MenuItem>
              <MenuItem value="almaly">Алмалинский</MenuItem>
              <MenuItem value="medeu">Медеуский</MenuItem>
              <MenuItem value="bostandyk">Бостандыкский</MenuItem>
            </Select>
          </FormControl>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
          <IconButton>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Метрики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Графики */}
      <Grid container spacing={3}>
        {/* График трендов */}
        <Grid item xs={12} lg={8}>
          <PriceTrendChart data={marketData} period={period} />
        </Grid>

        {/* Распределение по типам */}
        <Grid item xs={12} lg={4}>
          <PropertyTypeChart data={propertyTypeData} />
        </Grid>

        {/* Цены по районам */}
        <Grid item xs={12} lg={8}>
          <DistrictPriceChart data={districtData} />
        </Grid>

        {/* Топ оценок */}
        <Grid item xs={12} lg={4}>
          <TopPropertiesTable properties={topProperties} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsCharts;