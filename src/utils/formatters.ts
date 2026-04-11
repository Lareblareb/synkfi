import { format, formatDistanceToNow, isToday, isYesterday, isValid } from 'date-fns';
import { fi, enUS } from 'date-fns/locale';
import i18n from '../i18n';

const getLocale = () => (i18n.language === 'fi' ? fi : enUS);

const safeDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isValid(date) ? date : null;
};

export const formatDate = (dateString: string | null | undefined): string => {
  const date = safeDate(dateString);
  if (!date) return '';
  try {
    return format(date, 'dd.MM.yyyy', { locale: getLocale() });
  } catch {
    return '';
  }
};

export const formatTime = (dateString: string | null | undefined): string => {
  const date = safeDate(dateString);
  if (!date) return '';
  try {
    return format(date, 'HH:mm', { locale: getLocale() });
  } catch {
    return '';
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  const date = safeDate(dateString);
  if (!date) return '';
  try {
    return format(date, 'dd.MM.yyyy HH:mm', { locale: getLocale() });
  } catch {
    return '';
  }
};

export const formatRelativeTime = (dateString: string | null | undefined): string => {
  const date = safeDate(dateString);
  if (!date) return '';
  try {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: getLocale(),
    });
  } catch {
    return '';
  }
};

export const formatChatDate = (dateString: string | null | undefined): string => {
  const date = safeDate(dateString);
  if (!date) return '';
  try {
    if (isToday(date)) return i18n.t('chat:today');
    if (isYesterday(date)) return i18n.t('chat:yesterday');
    return format(date, 'dd.MM.yyyy', { locale: getLocale() });
  } catch {
    return '';
  }
};

export const formatChatTime = (dateString: string | null | undefined): string => {
  const date = safeDate(dateString);
  if (!date) return '';
  try {
    return format(date, 'HH:mm');
  } catch {
    return '';
  }
};

export const formatCurrency = (amount: number | null | undefined): string => {
  const value = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `€${value.toFixed(2)}`;
  }
};

export const formatDistance = (km: number | null | undefined): string => {
  const value = typeof km === 'number' && !isNaN(km) ? km : 0;
  if (value < 1) return `${Math.round(value * 1000)}m`;
  return `${value.toFixed(1)}km`;
};

export const getInitial = (name: string | null | undefined): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

export const truncate = (str: string | null | undefined, maxLen: number): string => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}...`;
};
