// frontend/src/components/Valuation/EnhancedValuationForm.js
import React, { useState, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
  Alert,
  Tooltip,
  Fab,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  Edit,
  Add,
  Visibility,
  CloudUpload,
  Mic,
  MicOff,
  PlayArrow,
  Stop,
  Save,
  Share,
  Print,
  Download,
  LocationOn,
  Schedule,
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';

// Компонент загрузки фотографий
const PhotoUploadSection = ({ photos, onPhotosChange, onPhotoCapture }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFilesUpload(files);
  };

  const handleFilesUpload = (files) => {
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      timestamp: new Date(),
      description: ''
    }));
    
    onPhotosChange([...photos, ...newPhotos]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFilesUpload(files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDeletePhoto = (photoId) => {
    onPhotosChange(photos.filter(photo => photo.id !== photoId));
  };

  const handlePhotoDescriptionChange = (photoId, description) => {
    onPhotosChange(photos.map(photo => 
      photo.id === photoId ? { ...photo, description } : photo
    ));
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Фотографии объекта
      </Typography>
      
      {/* Зона загрузки */}
      <Paper
        sx={{
          p: 3,
          border: `2px dashed ${dragOver ? '#FF6B35' : '#e0e0e0'}`,
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          mb: 3,
          bgcolor: dragOver ? 'rgba(255, 107, 53, 0.05)' : 'transparent'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CloudUpload sx={{ fontSize: 48, color: '#FF6B35', mb: 1 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Перетащите файлы сюда или нажмите для выбора
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Поддерживаются: JPG, PNG, HEIC (до 10 МБ)
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Выбрать файлы
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={(e) => {
              e.stopPropagation();
              onPhotoCapture();
            }}
          >
            Сделать фото
          </Button>
        </Box>
      </Paper>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Галерея загруженных фото */}
      {photos.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Загружено фотографий: {photos.length}
          </Typography>
          
          <ImageList cols={3} gap={16}>
            {photos.map((photo) => (
              <ImageListItem key={photo.id}>
                <img
                  src={photo.url}
                  alt={photo.name}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />
                <ImageListItemBar
                  title={
                    <TextField
                      placeholder="Описание фото..."
                      value={photo.description}
                      onChange={(e) => handlePhotoDescriptionChange(photo.id, e.target.value)}
                      size="small"
                      variant="standard"
                      sx={{
                        '& .MuiInput-root': {
                          color: 'white',
                          '&:before': { borderBottomColor: 'rgba(255,255,255,0.5)' },
                          '&:after': { borderBottomColor: 'white' }
                        },
                        '& .MuiInput-input': {
                          color: 'white',
                          '&::placeholder': { color: 'rgba(255,255,255,0.7)' }
                        }
                      }}
                    />
                  }
                  actionIcon={
                    <IconButton
                      sx={{ color: 'white' }}
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      <Delete />
                    </IconButton>
                  }
                  sx={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}
    </Box>
  );
};

// Компонент записи голосовых заметок
const VoiceNotesSection = ({ voiceNotes, onVoiceNotesChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const intervalRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const newNote = {
          id: Date.now(),
          url,
          blob,
          duration: recordingTime,
          timestamp: new Date(),
          transcription: ''
        };
        onVoiceNotesChange([...voiceNotes, newNote]);
        
        // Остановить поток
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Ошибка записи аудио:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const deleteVoiceNote = (noteId) => {
    onVoiceNotesChange(voiceNotes.filter(note => note.id !== noteId));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Голосовые заметки
      </Typography>

      {/* Управление записью */}
      <Paper sx={{ p: 2, mb: 2, textAlign: 'center' }}>
        {!isRecording ? (
          <Button
            variant="contained"
            startIcon={<Mic />}
            onClick={startRecording}
            sx={{
              bgcolor: '#FF6B35',
              '&:hover': { bgcolor: '#E55A2B' }
            }}
          >
            Начать запись
          </Button>
        ) : (
          <Box>
            <Typography variant="h4" sx={{ color: '#FF6B35', mb: 1 }}>
              {formatTime(recordingTime)}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Stop />}
              onClick={stopRecording}
              color="error"
            >
              Остановить запись
            </Button>
          </Box>
        )}
      </Paper>

      {/* Список записей */}
      {voiceNotes.length > 0 && (
        <List>
          {voiceNotes.map((note) => (
            <ListItem key={note.id} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
              <ListItemIcon>
                <Button
                  size="small"
                  onClick={() => {
                    const audio = new Audio(note.url);
                    audio.play();
                  }}
                >
                  <PlayArrow />
                </Button>
              </ListItemIcon>
              <ListItemText
                primary={`Запись ${formatTime(note.duration)}`}
                secondary={note.timestamp.toLocaleString()}
              />
              <IconButton onClick={() => deleteVoiceNote(note.id)} color="error">
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

// Компонент работы в оффлайн режиме
const OfflineIndicator = ({ isOnline, pendingSync }) => {
  if (isOnline && pendingSync === 0) return null;

  return (
    <Alert
      severity={isOnline ? "info" : "warning"}
      sx={{ mb: 2 }}
      action={
        isOnline && pendingSync > 0 ? (
          <Button color="inherit" size="small">
            Синхронизировать ({pendingSync})
          </Button>
        ) : null
      }
    >
      {isOnline 
        ? `Есть несинхронизированные данные: ${pendingSync} элементов`
        : "Работа в офлайн режиме. Данные будут синхронизированы при подключении к интернету."
      }
    </Alert>
  );
};

// Главный компонент улучшенной формы оценки
const EnhancedValuationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    propertyType: 'apartment',
    area: '',
    floor: '',
    totalFloors: '',
    condition: '',
    renovation: '',
    price: '',
    notes: ''
  });

  // Мониторинг состояния подключения
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Получение текущего местоположения
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.warn('Не удалось получить местоположение:', error);
        }
      );
    }
  }, []);

  const steps = [
    {
      label: 'Основная информация',
      description: 'Введите базовые данные об объекте'
    },
    {
      label: 'Фотографии',
      description: 'Сделайте фото объекта'
    },
    {
      label: 'Заметки и аудио',
      description: 'Добавьте голосовые заметки'
    },
    {
      label: 'Проверка и сохранение',
      description: 'Проверьте данные перед сохранением'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePhotoCapture = () => {
    // Симуляция захвата фото с камеры
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // Здесь можно открыть камеру
          console.log('Камера доступна');
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(error => {
          console.error('Камера недоступна:', error);
        });
    }
  };

  const handleSave = () => {
    const valuationData = {
      ...formData,
      photos,
      voiceNotes,
      location: currentLocation,
      timestamp: new Date(),
      isOffline: !isOnline
    };

    if (isOnline) {
      // Отправить на сервер
      console.log('Отправка данных на сервер:', valuationData);
    } else {
      // Сохранить локально
      localStorage.setItem(`valuation_${Date.now()}`, JSON.stringify(valuationData));
      setPendingSync(prev => prev + 1);
      console.log('Данные сохранены локально');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Адрес объекта"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                InputProps={{
                  endAdornment: currentLocation && (
                    <Tooltip title={`Координаты: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`}>
                      <LocationOn color="primary" />
                    </Tooltip>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Тип недвижимости"
                value={formData.propertyType}
                onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
              >
                <MenuItem value="apartment">Квартира</MenuItem>
                <MenuItem value="house">Дом</MenuItem>
                <MenuItem value="commercial">Коммерческая</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Площадь, м²"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Этаж"
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({...formData, floor: e.target.value})}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Всего этажей"
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({...formData, totalFloors: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Состояние"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                <MenuItem value="excellent">Отличное</MenuItem>
                <MenuItem value="good">Хорошее</MenuItem>
                <MenuItem value="fair">Среднее</MenuItem>
                <MenuItem value="poor">Требует ремонта</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Цена, ₸"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <PhotoUploadSection
            photos={photos}
            onPhotosChange={setPhotos}
            onPhotoCapture={handlePhotoCapture}
          />
        );

      case 2:
        return (
          <VoiceNotesSection
            voiceNotes={voiceNotes}
            onVoiceNotesChange={setVoiceNotes}
          />
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Проверьте введенные данные
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Основная информация
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Адрес:</strong> {formData.address}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Тип:</strong> {formData.propertyType}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Площадь:</strong> {formData.area} м²
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Этаж:</strong> {formData.floor}/{formData.totalFloors}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Цена:</strong> ₸{formData.price}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Медиафайлы
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Фотографий:</strong> {photos.length}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Голосовых заметок:</strong> {voiceNotes.length}
                  </Typography>
                  {currentLocation && (
                    <Typography variant="body2" gutterBottom>
                      <strong>GPS координаты:</strong> Есть
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<Save />}
                sx={{
                  bgcolor: '#FF6B35',
                  '&:hover': { bgcolor: '#E55A2B' }
                }}
              >
                Сохранить оценку
              </Button>
              <Button variant="outlined" startIcon={<Share />}>
                Поделиться
              </Button>
              <Button variant="outlined" startIcon={<Print />}>
                Печать
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Новая оценка недвижимости
      </Typography>

      <OfflineIndicator isOnline={isOnline} pendingSync={pendingSync} />

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography sx={{ mb: 2 }}>{step.description}</Typography>
                
                {renderStepContent(index)}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mr: 1 }}
                    disabled={index === steps.length - 1}
                  >
                    {index === steps.length - 1 ? 'Готово' : 'Далее'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Назад
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default EnhancedValuationForm;