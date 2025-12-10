import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationFR from '../locales/fr/translation.json';
import translationEN from '../locales/en/translation.json';
import translationDE from '../locales/de/translation.json';
import translationIT from '../locales/it/translation.json';

// Détecter la langue du navigateur ou récupérer depuis localStorage
const getInitialLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) {
    return savedLanguage;
  }
  
  // Détecter la langue du navigateur
  const browserLanguage = navigator.language || navigator.userLanguage;
  if (browserLanguage.startsWith('fr')) {
    return 'fr';
  }
  if (browserLanguage.startsWith('de')) {
    return 'de';
  }
  if (browserLanguage.startsWith('it')) {
    return 'it';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: translationFR
      },
      en: {
        translation: translationEN
      },
      de: {
        translation: translationDE
      },
      it: {
        translation: translationIT
      }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

// Sauvegarder la langue dans localStorage quand elle change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;

