// frontend/src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      results: 'Results',
      history: 'History',
      settings: 'Settings',
      realEstateValuation: 'Real Estate Valuation',

      // Authentication
      welcome: 'Welcome',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      loginToYourAccount: 'Login to your account',
      createAccount: 'Create Account',
      signUpToGetStarted: 'Sign up to get started',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      username: 'Username',
      fullName: 'Full Name',
      role: 'Role',
      appraiser: 'Appraiser',
      admin: 'Administrator',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      profile: 'Profile',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      or: 'or',

      // Property Form
      propertyValuation: 'Property Valuation',
      subjectProperty: 'Subject Property',
      comparableProperties: 'Comparable Properties',
      comparableProperty: 'Comparable Property',
      addComparable: 'Add Comparable Property',
      calculateValuation: 'Calculate Valuation',
      submitValuation: 'Submit Valuation',

      // Property Fields
      address: 'Address',
      propertyType: 'Property Type',
      apartment: 'Apartment',
      house: 'House',
      commercial: 'Commercial',
      area: 'Area (m²)',
      floorLevel: 'Floor Level',
      totalFloors: 'Total Floors',
      condition: 'Condition',
      renovationStatus: 'Renovation Status',
      price: 'Price',
      additionalFeatures: 'Additional Features',
      featureName: 'Feature Name',
      value: 'Value',
      unit: 'Unit',
      addFeature: 'Add Feature',

      // Conditions
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',

      // Renovation Status
      recentlyRenovated: 'Recently Renovated',
      partiallyRenovated: 'Partially Renovated',
      needsRenovation: 'Needs Renovation',
      original: 'Original',

      // Results
      finalValuation: 'Final Valuation',
      confidenceScore: 'Confidence Score',
      meanPrice: 'Mean Price',
      medianPrice: 'Median Price',
      standardDeviation: 'Standard Deviation',
      priceComparison: 'Price Comparison',
      originalPrice: 'Original Price',
      adjustedPrice: 'Adjusted Price',
      adjustments: 'Adjustments',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      priceDistribution: 'Price Distribution',
      adjustmentWeights: 'Adjustment Weights',
      areaVsPrice: 'Area vs Price',
      distanceVsPrice: 'Distance vs Price',

      // Validation Messages
      pleaseProvideRequiredFields: 'Please provide all required fields',
      pleaseProvideAtLeastOneComparable: 'Please provide at least one comparable property',
      pleaseProvideRequiredFieldsForAllComparables: 'Please provide required fields for all comparable properties',
      valuationCalculatedSuccessfully: 'Valuation calculated successfully',
      errorCalculatingValuation: 'Error calculating valuation',

      // History
      valuationHistory: 'Valuation History',
      date: 'Date',
      propertyAddress: 'Property Address',
      comparables: 'Comparables',
      actions: 'Actions',
      view: 'View',
      delete: 'Delete',

      // Settings
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      accessibility: 'Accessibility',
      fontSize: 'Font Size',
      zoom: 'Zoom',
    },
  },
  ru: {
    translation: {
      // Navigation
      home: 'Главная',
      results: 'Результаты',
      history: 'История',
      settings: 'Настройки',
      realEstateValuation: 'Оценка Недвижимости',

      // Authentication
      welcome: 'Добро пожаловать',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      loginToYourAccount: 'Войдите в свой аккаунт',
      createAccount: 'Создать аккаунт',
      signUpToGetStarted: 'Зарегистрируйтесь, чтобы начать',
      email: 'Электронная почта',
      password: 'Пароль',
      confirmPassword: 'Подтвердите пароль',
      username: 'Имя пользователя',
      fullName: 'Полное имя',
      role: 'Роль',
      appraiser: 'Оценщик',
      admin: 'Администратор',
      dontHaveAccount: 'Нет аккаунта?',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      profile: 'Профиль',
      passwordsDoNotMatch: 'Пароли не совпадают',
      passwordTooShort: 'Пароль должен содержать не менее 6 символов',
      or: 'или',

      // Property Form
      propertyValuation: 'Оценка Недвижимости',
      subjectProperty: 'Оцениваемый Объект',
      comparableProperties: 'Сравнимые Объекты',
      comparableProperty: 'Сравнимый Объект',
      addComparable: 'Добавить Сравнимый Объект',
      calculateValuation: 'Рассчитать Оценку',
      submitValuation: 'Отправить Оценку',

      // Property Fields
      address: 'Адрес',
      propertyType: 'Тип недвижимости',
      apartment: 'Квартира',
      house: 'Дом',
      commercial: 'Коммерческая',
      area: 'Площадь (м²)',
      floorLevel: 'Этаж',
      totalFloors: 'Всего этажей',
      condition: 'Состояние',
      renovationStatus: 'Статус Ремонта',
      price: 'Цена',
      additionalFeatures: 'Дополнительные характеристики',
      featureName: 'Название характеристики',
      value: 'Значение',
      unit: 'Единица измерения',
      addFeature: 'Добавить характеристику',

      // Conditions
      excellent: 'Отличное',
      good: 'Хорошее',
      fair: 'Среднее',
      poor: 'Плохое',

      // Renovation Status
      recentlyRenovated: 'Недавно Отремонтировано',
      partiallyRenovated: 'Частично Отремонтировано',
      needsRenovation: 'Требует Ремонта',
      original: 'Оригинальное',

      // Results
      finalValuation: 'Итоговая Оценка',
      confidenceScore: 'Индекс уверенности',
      meanPrice: 'Средняя Цена',
      medianPrice: 'Медианная Цена',
      standardDeviation: 'Стандартное Отклонение',
      priceComparison: 'Сравнение Цен',
      originalPrice: 'Исходная Цена',
      adjustedPrice: 'Скорректированная Цена',
      adjustments: 'Корректировки',
      exportPDF: 'Экспорт в PDF',
      exportExcel: 'Экспорт в Excel',
      priceDistribution: 'Распределение цен',
      adjustmentWeights: 'Веса корректировок',
      areaVsPrice: 'Площадь vs Цена',
      distanceVsPrice: 'Расстояние vs Цена',

      // Validation Messages
      pleaseProvideRequiredFields: 'Пожалуйста, заполните все обязательные поля',
      pleaseProvideAtLeastOneComparable: 'Пожалуйста, добавьте хотя бы один сравнимый объект',
      pleaseProvideRequiredFieldsForAllComparables: 'Пожалуйста, заполните обязательные поля для всех сравнимых объектов',
      valuationCalculatedSuccessfully: 'Оценка рассчитана успешно',
      errorCalculatingValuation: 'Ошибка при расчете оценки',

      // History
      valuationHistory: 'История Оценок',
      date: 'Дата',
      propertyAddress: 'Адрес Объекта',
      comparables: 'Сравнимые',
      actions: 'Действия',
      view: 'Просмотр',
      delete: 'Удалить',

      // Settings
      language: 'Язык',
      theme: 'Тема',
      light: 'Светлая',
      dark: 'Темная',
      accessibility: 'Доступность',
      fontSize: 'Размер Шрифта',
      zoom: 'Масштаб',
    },
  },
  kk: {
    translation: {
      // Navigation
      home: 'Басты бет',
      results: 'Нәтижелер',
      history: 'Тарих',
      settings: 'Баптаулар',
      realEstateValuation: 'Жылжымайтын Мүлікті Бағалау',

      // Authentication
      welcome: 'Қош келдіңіз',
      login: 'Кіру',
      register: 'Тіркелу',
      logout: 'Шығу',
      loginToYourAccount: 'Аккаунтыңызға кіріңіз',
      createAccount: 'Аккаунт жасау',
      signUpToGetStarted: 'Бастау үшін тіркеліңіз',
      email: 'Электрондық пошта',
      password: 'Құпия сөз',
      confirmPassword: 'Құпия сөзді растау',
      username: 'Пайдаланушы аты',
      fullName: 'Толық аты',
      role: 'Рөлі',
      appraiser: 'Бағалаушы',
      admin: 'Әкімші',
      dontHaveAccount: 'Аккаунтыңыз жоқ па?',
      alreadyHaveAccount: 'Аккаунтыңыз бар ма?',
      profile: 'Профиль',
      passwordsDoNotMatch: 'Құпия сөздер сәйкес келмейді',
      passwordTooShort: 'Құпия сөз кемінде 6 таңбадан тұруы керек',
      or: 'немесе',

      // Property Form
      propertyValuation: 'Жылжымайтын Мүлікті Бағалау',
      subjectProperty: 'Бағаланатын Объект',
      comparableProperties: 'Салыстырмалы Объектілер',
      comparableProperty: 'Салыстырмалы Объект',
      addComparable: 'Салыстырмалы Объекті Қосу',
      calculateValuation: 'Бағалауды Есептеу',
      submitValuation: 'Бағалауға Жіберу',

      // Property Fields
      address: 'Мекен-жай',
      propertyType: 'Мүлік түрі',
      apartment: 'Пәтер',
      house: 'Үй',
      commercial: 'Коммерциялық',
      area: 'Ауданы (м²)',
      floorLevel: 'Қабат',
      totalFloors: 'Барлық қабат',
      condition: 'Жағдайы',
      renovationStatus: 'Жөндеу Статусы',
      price: 'Бағасы',
      additionalFeatures: 'Қосымша сипаттамалар',
      featureName: 'Сипаттама атауы',
      value: 'Мәні',
      unit: 'Өлшем бірлігі',
      addFeature: 'Сипаттама қосу',

      // Conditions
      excellent: 'Өте Жақсы',
      good: 'Жақсы',
      fair: 'Орташа',
      poor: 'Нашар',

      // Renovation Status
      recentlyRenovated: 'Жақында Жөнделген',
      partiallyRenovated: 'Жартылай Жөнделген',
      needsRenovation: 'Жөндеу Қажет',
      original: 'Түпнұсқа',

      // Results
      finalValuation: 'Соңғы Бағалау',
      confidenceScore: 'Сенімділік индексі',
      meanPrice: 'Орташа Баға',
      medianPrice: 'Медиандық Баға',
      standardDeviation: 'Стандартты Ауытқу',
      priceComparison: 'Бағаларды Салыстыру',
      originalPrice: 'Бастапқы Баға',
      adjustedPrice: 'Түзетілген Баға',
      adjustments: 'Түзетулер',
      exportPDF: 'PDF-ке Экспорт',
      exportExcel: 'Excel-ге Экспорт',
      priceDistribution: 'Бағалардың таралуы',
      adjustmentWeights: 'Түзету салмақтары',
      areaVsPrice: 'Аудан vs Баға',
      distanceVsPrice: 'Қашықтық vs Баға',

      // Validation Messages
      pleaseProvideRequiredFields: 'Міндетті өрістерді толтырыңыз',
      pleaseProvideAtLeastOneComparable: 'Кемінде бір салыстырмалы объект қосыңыз',
      pleaseProvideRequiredFieldsForAllComparables: 'Барлық салыстырмалы объектілер үшін міндетті өрістерді толтырыңыз',
      valuationCalculatedSuccessfully: 'Бағалау сәтті есептелді',
      errorCalculatingValuation: 'Бағалауды есептеуде қате',

      // History
      valuationHistory: 'Бағалау Тарихы',
      date: 'Күні',
      propertyAddress: 'Объектінің Мекен-жайы',
      comparables: 'Салыстырмалы',
      actions: 'Әрекеттер',
      view: 'Көру',
      delete: 'Жою',

      // Settings
      language: 'Тіл',
      theme: 'Тақырып',
      light: 'Ашық',
      dark: 'Қараңғы',
      accessibility: 'Қолжетімділік',
      fontSize: 'Қаріп Өлшемі',
      zoom: 'Масштаб',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;