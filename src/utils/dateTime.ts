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

/**
 * Format shift hour number to readable time format
 * Converts numbers like 7, 8, 9, 10, 11, 12, 13 to 07:00, 08:00, etc.
 */
export const formatShiftTime = (hour: number | string): string => {
  const hourNum = typeof hour === 'string' ? parseInt(hour, 10) : hour;
  
  // Handle invalid input
  if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
    return 'Invalid Time';
  }
  
  // Format to HH:00
  return `${hourNum.toString().padStart(2, '0')}:00`;
};

/**
 * Parse shift string and format it to readable time
 * Handles various shift formats and converts them to readable time
 */
export const parseAndFormatShift = (shift: string | number): string => {
  if (!shift) return 'Tidak ada jadwal';
  
  const shiftStr = shift.toString().toLowerCase();
  
  // Handle 'off' or 'ct' cases
  if (shiftStr === 'off' || shiftStr === 'ct') {
    return 'Libur';
  }
  
  // Handle numeric hour (7, 8, 9, 10, 11, 12, 13)
  const hourMatch = shiftStr.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1], 10);
    const minute = hourMatch[2] ? parseInt(hourMatch[2], 10) : 0;
    
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }
  
  // If no pattern matches, return as is
  return shiftStr;
};