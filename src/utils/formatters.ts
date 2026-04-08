import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { fi, enUS } from 'date-fns/locale';
import i18n from '../i18n';

const getLocale = () => (i18n.language === 'fi' ? fi : enUS);

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd.MM.yyyy', { locale: getLocale() });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'HH:mm', { locale: getLocale() });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd.MM.yyyy HH:mm', { locale: getLocale() });
};

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
    locale: getLocale(),
  });
};

export const formatChatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (isToday(date)) return i18n.t('chat:today');
  if (isYesterday(date)) return i18n.t('chat:yesterday');
  return format(date, 'dd.MM.yyyy', { locale: getLocale() });
};

export const formatChatTime = (dateString: string): string => {
  return format(new Date(dateString), 'HH:mm');
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const getInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export const truncate = (str: string, maxLen: number): string => {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}...`;
};
