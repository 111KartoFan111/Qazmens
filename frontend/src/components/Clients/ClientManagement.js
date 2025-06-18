// frontend/src/components/Clients/ClientManagement.js
import React, { useState } from 'react';
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
  Badge,
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
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  PersonAdd,
  Phone,
  Email,
  WhatsApp,
  Telegram,
  MoreVert,
  Edit,
  Delete,
  Assignment,
  CalendarToday,
  Search,
  FilterList,
  Star,
  StarBorder,
  LocationOn,
  Business,
  Person,
  Schedule,
  CheckCircle,
  Cancel,
  Pending
} from '@mui/icons-material';

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

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'pending': return 'Ожидание';
      case 'completed': return 'Завершен';
      case 'inactive': return 'Неактивный';
      default: return 'Неизвестно';
    }
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        {/* Заголовок карточки */}
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
            <IconButton size="small" onClick={() => client.isFavorite ? null : null}>
              {client.isFavorite ? <Star sx={{ color: '#FFD700' }} /> : <StarBorder />}
            </IconButton>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Информация о клиенте */}
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

        {/* Статистика */}
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

        {/* Статус */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={getStatusText(client.status)}
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

        {/* Меню действий */}
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

// Компонент истории заказов клиента
const ClientOrderHistory = ({ orders }) => (
  <List>
    {orders.map((order) => (
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
    ))}
  </List>
);

// Главный компонент управления клиентами
const ClientManagement = () => {
  const [clients, setClients] = useState([
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
    }
  ]);

  const [filteredClients, setFilteredClients] = useState(clients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientDialog, setClientDialog] = useState({ open: false, client: null });
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Фильтрация клиентов
  React.useEffect(() => {
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
    if (clientData.id) {
      // Редактирование
      setClients(prev => prev.map(c => c.id === clientData.id ? clientData : c));
    } else {
      // Добавление
      setClients(prev => [...prev, { ...clientData, id: Date.now() }]);
    }
  };

  const handleDeleteClient = (client) => {
    if (window.confirm('Удалить клиента?')) {
      setClients(prev => prev.filter(c => c.id !== client.id));
    }
  };

  const handleContactClient = (client, method) => {
    if (method === 'phone') {
      window.open(`tel:${client.phone}`);
    } else if (method === 'email') {
      window.open(`mailto:${client.email}`);
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
  };

  return (
    <Box>
      {/* Заголовок и действия */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
          Управление клиентами
        </Typography>
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
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
            >
              Фильтры
            </Button>
          </Grid>
        </Grid>
      </Paper>

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
                  <ClientOrderHistory orders={selectedClient.orders || []} />
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