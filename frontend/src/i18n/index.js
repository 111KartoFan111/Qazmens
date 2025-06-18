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

      // Property Form
      propertyValuation: 'Property Valuation',
      subjectProperty: 'Subject Property',
      comparableProperties: 'Comparable Properties',
      addComparable: 'Add Comparable Property',
      comparablePropertiesnum: 'Comparable Property',
      calculateValuation: 'Calculate Valuation',

      // Property Fields
      address: 'Address',
      area: 'Area (sq ft)',
      floorLevel: 'Floor Level',
      condition: 'Condition',
      distanceFromCenter: 'Distance from Center (km)',
      renovationStatus: 'Renovation Status',
      price: 'Price',

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
      meanPrice: 'Mean Price',
      medianPrice: 'Median Price',
      standardDeviation: 'Standard Deviation',
      priceComparison: 'Price Comparison',
      originalPrice: 'Original Price',
      adjustedPrice: 'Adjusted Price',
      adjustments: 'Adjustments',
      exportPDF: 'Export PDF',
      exportExcel: 'Export Excel',
      submitValuation: 'Submit Valuation',

      // History
      valuationHistory: 'Valuation History',
      date: 'Date',
      propertyAddress: 'Property Address',
      finalValuation: 'Final Valuation',
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

      // Property Form
      propertyValuation: 'Оценка Недвижимости',
      subjectProperty: 'Оцениваемый Объект',
      comparableProperties: 'Сравнимые Объекты',
      comparablePropertiesnum: 'Сравневыемый объект',
      addComparable: 'Добавить Сравнимый Объект',
      calculateValuation: 'Рассчитать Оценку',

      // Property Fields
      address: 'Адрес',
      area: 'Площадь (кв.м)',
      floorLevel: 'Этаж',
      condition: 'Состояние',
      distanceFromCenter: 'Расстояние от Центра (км)',
      renovationStatus: 'Статус Ремонта',
      price: 'Цена',

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
      meanPrice: 'Средняя Цена',
      medianPrice: 'Медианная Цена',
      standardDeviation: 'Стандартное Отклонение',
      priceComparison: 'Сравнение Цен',
      originalPrice: 'Исходная Цена',
      adjustedPrice: 'Скорректированная Цена',
      adjustments: 'Корректировки',
      exportPDF: 'Экспорт в PDF',
      exportExcel: 'Экспорт в Excel',
      submitValuation: 'Отправить Оценку',

      // History
      valuationHistory: 'История Оценок',
      date: 'Дата',
      propertyAddress: 'Адрес Объекта',
      finalValuation: 'Итоговая Оценка',
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

      // Property Form
      propertyValuation: 'Жылжымайтын Мүлікті Бағалау',
      subjectProperty: 'Бағаланатын Объект',
      comparableProperties: 'Салыстырмалы Объектілер',
      addComparable: 'Салыстырмалы Объекті Қосу',
      comparablePropertiesnum: 'Салыстырмалы объект',
      calculateValuation: 'Бағалауды Есептеу',

      // Property Fields
      address: 'Мекен-жай',
      area: 'Ауданы (шаршы м)',
      floorLevel: 'Қабат',
      condition: 'Жағдайы',
      distanceFromCenter: 'Орталықтан Қашықтық (км)',
      renovationStatus: 'Жөндеу Статусы',
      price: 'Бағасы',

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
      meanPrice: 'Орташа Баға',
      medianPrice: 'Медиандық Баға',
      standardDeviation: 'Стандартты Ауытқу',
      priceComparison: 'Бағаларды Салыстыру',
      originalPrice: 'Бастапқы Баға',
      adjustedPrice: 'Түзетілген Баға',
      adjustments: 'Түзетулер',
      exportPDF: 'PDF-ке Экспорт',
      exportExcel: 'Excel-ге Экспорт',
      submitValuation: 'Бағалауға Жіберу',

      // History
      valuationHistory: 'Бағалау Тарихы',
      date: 'Күні',
      propertyAddress: 'Объектінің Мекен-жайы',
      finalValuation: 'Соңғы Бағалау',
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