import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../public/locales/en/translation.json';
import de from '../public/locales/de/translation.json';
import ptBr from '../public/locales/pt-br/translation.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  // have a common namespace used around the full app
  ns: ['translations'],
  defaultNS: 'translations',

  debug: false,

  interpolation: {
    escapeValue: false, // not needed for react!!
  },

  resources: {
    en: { translations: en },
    de: { translations: de },
    'pt-br': { translations: ptBr },
  },
});

export default i18n;
