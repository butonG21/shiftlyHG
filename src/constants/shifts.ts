// Shift-related constants
export const SHIFT_COLORS = {
  pagi: '#D0F0FD',
  middle: '#FFF3CD',
  siang: '#F8D7DA',
  off: '#E2E3E5',
} as const;

export const SHIFT_THEMES = {
  pagi: {
    primary: '#FF9500',
    secondary: '#FFB84D',
    background: '#FFF5E6',
    text: '#8B4000',
  },
  middle: {
    primary: '#007AFF',
    secondary: '#4DA6FF',
    background: '#E6F3FF',
    text: '#003D80',
  },
  siang: {
    primary: '#FF3B30',
    secondary: '#FF6B61',
    background: '#FFE6E6',
    text: '#800020',
  },
  off: {
    primary: '#8E44AD',
    secondary: '#A569BD',
    background: '#F4EDF7',
    text: '#5B2C87',
  },
} as const;

export const SHIFT_MESSAGES = {
  pagi: 'masuk pukul pagi',
  middle: 'masuk pukul tengah hari',
  siang: 'masuk pukul siang',
  off: 'libur atau cuti',
} as const;

export const SHIFT_ICONS = {
  pagi: 'white-balance-sunny' as const,
  middle: 'weather-cloudy' as const,
  siang: 'weather-sunset-down' as const,
  off: 'coffee' as const,
} as const;

export type ShiftType = keyof typeof SHIFT_COLORS;