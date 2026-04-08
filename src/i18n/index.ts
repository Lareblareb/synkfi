import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDiscovery from './locales/en/discovery.json';
import enEvents from './locales/en/events.json';
import enChat from './locales/en/chat.json';
import enProfile from './locales/en/profile.json';
import enPayments from './locales/en/payments.json';
import enNotifications from './locales/en/notifications.json';
import enConnect from './locales/en/connect.json';
import enAbout from './locales/en/about.json';

import fiCommon from './locales/fi/common.json';
import fiAuth from './locales/fi/auth.json';
import fiDiscovery from './locales/fi/discovery.json';
import fiEvents from './locales/fi/events.json';
import fiChat from './locales/fi/chat.json';
import fiProfile from './locales/fi/profile.json';
import fiPayments from './locales/fi/payments.json';
import fiNotifications from './locales/fi/notifications.json';
import fiConnect from './locales/fi/connect.json';
import fiAbout from './locales/fi/about.json';

const LANGUAGE_KEY = 'synk_language';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    discovery: enDiscovery,
    events: enEvents,
    chat: enChat,
    profile: enProfile,
    payments: enPayments,
    notifications: enNotifications,
    connect: enConnect,
    about: enAbout,
  },
  fi: {
    common: fiCommon,
    auth: fiAuth,
    discovery: fiDiscovery,
    events: fiEvents,
    chat: fiChat,
    profile: fiProfile,
    payments: fiPayments,
    notifications: fiNotifications,
    connect: fiConnect,
    about: fiAbout,
  },
};

const getDeviceLanguage = (): string => {
  const locales = getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'en';
  return deviceLang === 'fi' ? 'fi' : 'en';
};

export const initI18n = async (): Promise<void> => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const language = savedLanguage ?? getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    ns: [
      'common',
      'auth',
      'discovery',
      'events',
      'chat',
      'profile',
      'payments',
      'notifications',
      'connect',
      'about',
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
};

export const changeLanguage = async (lang: 'en' | 'fi'): Promise<void> => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

export default i18n;
