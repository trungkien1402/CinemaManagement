import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viAuth from './locales/vi/auth.json';
import enAuth from './locales/en/auth.json';
import viNav from './locales/vi/navbar.json';
import enNav from './locales/en/navbar.json';
import viAdmin from './locales/vi/admin.json';
import enAdmin from './locales/en/admin.json';
import viHome from './locales/vi/home.json';
import enHome from './locales/en/home.json';
import viDetail from './locales/vi/detail.json';
import enDetail from './locales/en/detail.json';
import viPayment from './locales/vi/payment.json';
import enPayment from './locales/en/payment.json';
import viTheaters from './locales/vi/theaters.json';
import enTheaters from './locales/en/theaters.json';
import viUser from './locales/vi/user.json'; 
import enUser from './locales/en/user.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        translation: {
          ...viUser,
          ...viAuth,
          ...viNav,
          ...viAdmin,
          ...viHome,
          ...viDetail,
          ...viPayment,
          ...viTheaters
        }
      },
      en: {
        translation: {
          ...enUser,
          ...enAuth,
          ...enNav,
          ...enAdmin,
          ...enHome,
          ...enDetail,
          ...enPayment,
          ...enTheaters
        }
      }
    },
    fallbackLng: 'vi',
    initImmediate: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage']
    }
  });

export default i18n;