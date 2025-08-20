import moment from 'moment';
import 'moment/locale/id';

// Initialize moment locale
moment.locale('id');

/**
 * Get greeting message based on current time
 */
export const getGreeting = (): string => {
  const hour = moment().hour();
  if (hour < 10) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

/**
 * Format date for display
 */
export const formatDate = (date?: moment.Moment | string): string => {
  const momentDate = moment(date);
  return momentDate.format('dddd, DD MMM');
};

/**
 * Format time for display
 */
export const formatTime = (date?: moment.Moment | string): string => {
  const momentDate = moment(date);
  return momentDate.format('HH:mm');
};

/**
 * Get current moment instance
 */
export const getCurrentMoment = (): moment.Moment => {
  return moment();
};

/**
 * Check if date is today
 */
export const isToday = (date: moment.Moment | string): boolean => {
  return moment(date).isSame(moment(), 'day');
};

/**
 * Check if date is tomorrow
 */
export const isTomorrow = (date: moment.Moment | string): boolean => {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
};