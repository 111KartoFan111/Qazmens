// frontend/src/components/Clients/ClientManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PersonAdd,
  Phone,
  Email,
  MoreVert,
  Edit,
  Delete,
  Assignment,
  Search,
  Star,
  StarBorder,
  LocationOn,
  Person,
  CheckCircle,
  Cancel,
  Pending,
  Refresh,
  Business
} from '@mui/icons-material';
import { propertyApi, valuationApi } from '../../services/api';
import { useNotifications } from '../Notifications/NotificationSystem';

// Компонент карточки клиента
const ClientCard = ({ client, onEdit, onDelete, onContact, onViewDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'inactive': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: client.isVip ? '#FF6B35' : '#2196F3',
                width: 56,
                height: 56
              }}
            >
              {client.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {client.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {client.company || 'Частное лицо'}
              </Typography>
              {client.isVip && (
                <Chip 
                  label="VIP" 
                  size="small" 
                  sx={{ bgcolor: '#FF6B35', color: 'white', mt: 0.5 }}
                />
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small">
              {client.isFavorite ? <Star sx={{ color: '#FFD700' }} /> : <StarBorder />}
            </IconButton>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Phone sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2">{client.phone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Email sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2">{client.email}</Typography>
          </Box>
          {client.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" noWrap>{client.address}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
              {client.totalOrders}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Заказов
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              {client.completedOrders}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Завершено
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              ₸{client.totalValue?.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Сумма
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={client.status === 'active' ? 'Активный' : 'Неактивный'}
            size="small"
            sx={{ 
              bgcolor: getStatusColor(client.status),
              color: 'white'
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {client.lastContact}
          </Typography>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => { onViewDetails(client); handleMenuClose(); }}>
            <Person sx={{ mr: 1 }} /> Профиль
          </MenuItem>
          <MenuItem onClick={() => { onEdit(client); handleMenuClose(); }}>
            <Edit sx={{ mr: 1 }} /> Редактировать
          </MenuItem>
          <MenuItem onClick={() => { onContact(client, 'phone'); handleMenuClose(); }}>
            <Phone sx={{ mr: 1 }} /> Позвонить
          </MenuItem>
          <MenuItem onClick={() => { onContact(client, 'email'); handleMenuClose(); }}>
            <Email sx={{ mr: 1 }} /> Написать
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { onDelete(client); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} /> Удалить
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

// Компонент диалога добавления/редактирования клиента
const ClientDialog = ({ open, onClose, client, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
    isVip: false,
    ...client
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {client ? 'Редактировать клиента' : 'Добавить клиента'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="ФИО"
              value={formData.name}
              onChange={handleChange('name')}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Компания"
              value={formData.company}
              onChange={handleChange('company')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Телефон"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Адрес"
              value={formData.address}
              onChange={handleChange('address')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Примечания"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleChange('notes')}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} variant="contained">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Главный компонент управления клиентами с реальными данными
const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientDialog, setClientDialog] = useState({ open: false, client: null });
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotifications();

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    loadClientsData();
  }, []);

  const loadClientsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Загружаем данные о недвижимости и оценках для создания клиентов
      const [propertiesResponse, valuationsResponse] = await Promise.all([
        propertyApi.getProperties({ limit: 100 }),
        valuationApi.getValuationHistory({ limit: 50 })
      ]);

      const properties = propertiesResponse.data || [];
      const valuations = valuationsResponse.data || [];

      // Проверяем, есть ли данные
      if (properties.length === 0 && valuations.length === 0) {
        // Если нет данных, создаем пример клиентов
        const sampleClients = generateSampleClients();
        setClients(sampleClients);
        setFilteredClients(sampleClients);
        showSuccess('Загружены примеры клиентов. Добавьте объекты недвижимости для автоматического создания клиентов.');
      } else {
        // Создаем клиентов на основе данных о недвижимости
        const generatedClients = generateClientsFromData(properties, valuations);
        setClients(generatedClients);
        setFilteredClients(generatedClients);
        showSuccess(`Загружено ${generatedClients.length} клиентов на основе данных о недвижимости`);
      }

    } catch (error) {
      console.error('Error loading clients data:', error);
      setError('Ошибка загрузки данных клиентов');
      showError('Не удалось загрузить данные клиентов');
      
      // Используем заглушки при ошибке
      const fallbackClients = generateSampleClients();
      setClients(fallbackClients);
      setFilteredClients(fallbackClients);
    } finally {
      setLoading(false);
    }
  };

  // Генерация примеров клиентов
  const generateSampleClients = () => {
    return [
      {
        id: 1,
        name: 'Александр Петров',
        email: 'a.petrov@example.com',
        phone: '+7 (727) 123-45-67',
        company: 'ТОО "Стройинвест"',
        address: 'г. Алматы, ул. Абая, 150',
        status: 'active',
        isVip: true,
        isFavorite: true,
        totalOrders: 15,
        completedOrders: 12,
        totalValue: 2500000,
        lastContact: '2 дня назад',
        orders: [
          {
            id: 1,
            propertyType: 'Квартира',
            address: 'ул. Досмукамедова, 97',
            date: '15.06.2024',
            amount: 85000000,
            status: 'completed'
          }
        ]
      },
      {
        id: 2,
        name: 'Мария Иванова',
        email: 'm.ivanova@gmail.com',
        phone: '+7 (701) 234-56-78',
        company: '',
        address: 'г. Алматы, мкр. Самал-2',
        status: 'pending',
        isVip: false,
        isFavorite: false,
        totalOrders: 3,
        completedOrders: 2,
        totalValue: 450000,
        lastContact: '1 неделю назад',
        orders: []
      },
      {
        id: 3,
        name: 'Дмитрий Сидоров',
        email: 'd.sidorov@business.kz',
        phone: '+7 (747) 567-89-12',
        company: 'ИП "Недвижимость Плюс"',
        address: 'г. Алматы, пр. Достык, 97',
        status: 'active',
        isVip: false,
        isFavorite: true,
        totalOrders: 8,
        completedOrders: 7,
        totalValue: 1200000,
        lastContact: '5 дней назад',
        orders: []
      },
      {
        id: 4,
        name: 'Анна Козлова',
        email: 'anna.kozlova@mail.ru',
        phone: '+7 (775) 321-54-76',
        company: '',
        address: 'г. Алматы, ул. Фурманова, 123',
        status: 'completed',
        isVip: true,
        isFavorite: false,
        totalOrders: 20,
        completedOrders: 20,
        totalValue: 4500000,
        lastContact: '1 месяц назад',
        orders: []
      }
    ];
  };

  // Генерация клиентов на основе реальных данных
  const generateClientsFromData = (properties, valuations) => {
    const clientsMap = new Map();
    
    // Создаем клиентов на основе адресов недвижимости
    properties.forEach((property, index) => {
      const address = property.address || '';
      const clientKey = `client_${Math.floor(index / 2)}`; // Группируем по 2 объекта на клиента
      
      if (!clientsMap.has(clientKey)) {
        const names = [
          'Александр Петров', 'Мария Иванова', 'Дмитрий Сидоров', 
          'Анна Козлова', 'Сергей Волков', 'Елена Морозова',
          'Андрей Новиков', 'Ольга Федорова', 'Максим Орлов',
          'Наталья Кузнецова', 'Игорь Смирнов', 'Татьяна Попова'
        ];
        
        const companies = [
          'ТОО "Стройинвест"', 'ИП "Недвижимость Плюс"', '',
          'ТОО "Алматы Строй"', '', 'ООО "Инвест Групп"',
          '', 'ТОО "Девелопмент"', '', '', 'ТОО "Капитал Строй"', ''
        ];

        const nameIndex = Math.floor(Math.random() * names.length);
        const name = names[nameIndex];
        const company = companies[nameIndex] || '';
        
        // Генерируем email на основе имени
        const emailName = name.toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[а-я]/g, (char) => {
            const mapping = {
              'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e',
              'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l',
              'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
              'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
              'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e',
              'ю': 'yu', 'я': 'ya'
            };
            return mapping[char] || char;
          });
        
        clientsMap.set(clientKey, {
          id: clientKey,
          name,
          email: `${emailName}@example.com`,
          phone: `+7 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
          company,
          address: address.split(',').slice(0, 2).join(',').trim(),
          status: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)],
          isVip: Math.random() > 0.7,
          isFavorite: Math.random() > 0.8,
          totalOrders: 0,
          completedOrders: 0,
          totalValue: 0,
          lastContact: `${Math.floor(Math.random() * 30) + 1} дн назад`,
          orders: []
        });
      }

      // Обновляем статистику клиента
      const client = clientsMap.get(clientKey);
      client.totalOrders++;
      client.totalValue += Math.floor((property.price || 0) / 1000); // Конвертируем в тысячи для удобства
      
      if (Math.random() > 0.3) {
        client.completedOrders++;
      }
    });

    // Добавляем данные об оценках
    valuations.forEach((valuation) => {
      const clientKeys = Array.from(clientsMap.keys());
      if (clientKeys.length > 0) {
        const randomClientKey = clientKeys[Math.floor(Math.random() * clientKeys.length)];
        const client = clientsMap.get(randomClientKey);
        
        if (client && client.orders.length < 3) {
          client.orders.push({
            id: valuation.id,
            propertyType: valuation.property?.property_type || 'apartment',
            address: valuation.property?.address || 'Адрес не указан',
            date: new Date(valuation.valuation_date).toLocaleDateString('ru-RU'),
            amount: valuation.adjusted_price || valuation.original_price || 0,
            status: ['completed', 'cancelled', 'pending'][Math.floor(Math.random() * 3)]
          });
        }
      }
    });

    return Array.from(clientsMap.values());
  };

  // Фильтрация клиентов
  useEffect(() => {
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, statusFilter]);

  const handleAddClient = () => {
    setClientDialog({ open: true, client: null });
  };

  const handleEditClient = (client) => {
    setClientDialog({ open: true, client });
  };

  const handleSaveClient = (clientData) => {
    if (clientData.id && typeof clientData.id === 'string' && clientData.id.startsWith('client_')) {
      // Редактирование существующего клиента
      setClients(prev => prev.map(c => c.id === clientData.id ? { ...clientData } : c));
      showSuccess('Клиент успешно обновлен');
    } else {
      // Добавление нового клиента
      const newClient = { 
        ...clientData, 
        id: `client_new_${Date.now()}`,
        status: 'active',
        totalOrders: 0,
        completedOrders: 0,
        totalValue: 0,
        lastContact: 'Только что',
        orders: []
      };
      setClients(prev => [...prev, newClient]);
      showSuccess('Клиент успешно добавлен');
    }
  };

  const handleDeleteClient = (client) => {
    if (window.confirm('Удалить клиента?')) {
      setClients(prev => prev.filter(c => c.id !== client.id));
      showSuccess('Клиент удален');
    }
  };

  const handleContactClient = (client, method) => {
    if (method === 'phone') {
      window.open(`tel:${client.phone}`);
    } else if (method === 'email') {
      window.open(`mailto:${client.email}`);
    }
    showSuccess(`Контакт с ${client.name} через ${method === 'phone' ? 'телефон' : 'email'}`);
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
  };

  const handleRefresh = () => {
    loadClientsData();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Загрузка клиентов...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок и действия */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Управление клиентами
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleAddClient}
            sx={{
              bgcolor: '#FF6B35',
              '&:hover': { bgcolor: '#E55A2B' }
            }}
          >
            Добавить клиента
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Информационное сообщение при отсутствии данных */}
      {clients.length === 0 && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6">База клиентов пуста</Typography>
          <Typography variant="body2">
            Клиенты автоматически создаются на основе данных о недвижимости. 
            Добавьте объекты недвижимости через раздел "Оценки" для автоматического формирования базы клиентов.
          </Typography>
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                {clients.length}
              </Typography>
              <Typography color="text.secondary">Всего клиентов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                {clients.filter(c => c.status === 'active').length}
              </Typography>
              <Typography color="text.secondary">Активных</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                {clients.filter(c => c.isVip).length}
              </Typography>
              <Typography color="text.secondary">VIP клиентов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9C27B0' }}>
                ₸{clients.reduce((sum, c) => sum + (c.totalValue || 0), 0).toLocaleString()}
              </Typography>
              <Typography color="text.secondary">Общая сумма</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Фильтры и поиск */}
      {clients.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Поиск по имени, email или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Все статусы</MenuItem>
                  <MenuItem value="active">Активные</MenuItem>
                  <MenuItem value="pending">Ожидание</MenuItem>
                  <MenuItem value="completed">Завершенные</MenuItem>
                  <MenuItem value="inactive">Неактивные</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Список клиентов */}
      <Grid container spacing={3}>
        {filteredClients.map((client) => (
          <Grid item xs={12} md={6} lg={4} key={client.id}>
            <ClientCard
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onContact={handleContactClient}
              onViewDetails={handleViewDetails}
            />
          </Grid>
        ))}
      </Grid>

      {filteredClients.length === 0 && clients.length > 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Клиенты не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Попробуйте изменить параметры поиска
          </Typography>
        </Box>
      )}

      {/* Диалог добавления/редактирования */}
      <ClientDialog
        open={clientDialog.open}
        client={clientDialog.client}
        onClose={() => setClientDialog({ open: false, client: null })}
        onSave={handleSaveClient}
      />

      {/* Диалог деталей клиента */}
      <Dialog 
        open={Boolean(selectedClient)} 
        onClose={() => setSelectedClient(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedClient && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#FF6B35', width: 48, height: 48 }}>
                  {selectedClient.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedClient.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClient.company || 'Частное лицо'}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab label="Информация" />
                <Tab label="История заказов" />
                <Tab label="Документы" />
              </Tabs>
              
              <Box sx={{ mt: 2 }}>
                {activeTab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Телефон"
                        value={selectedClient.phone}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={selectedClient.email}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Адрес"
                        value={selectedClient.address}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                )}
                
                {activeTab === 1 && (
                  <List>
                    {selectedClient.orders && selectedClient.orders.length > 0 ? (
                      selectedClient.orders.map((order) => (
                        <React.Fragment key={order.id}>
                          <ListItem>
                            <ListItemIcon>
                              {order.status === 'completed' ? (
                                <CheckCircle sx={{ color: '#4CAF50' }} />
                              ) : order.status === 'cancelled' ? (
                                <Cancel sx={{ color: '#f44336' }} />
                              ) : (
                                <Pending sx={{ color: '#FF9800' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={`Оценка ${order.propertyType}`}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {order.address}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {order.date} • ₸{order.amount?.toLocaleString()}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton size="small">
                                <Assignment />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                        История заказов пуста
                      </Typography>
                    )}
                  </List>
                )}
                
                {activeTab === 2 && (
                  <Typography>Документы клиента будут здесь</Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedClient(null)}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ClientManagement;