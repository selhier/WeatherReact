// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import translationES from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: translationES }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Idioma por defecto
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
