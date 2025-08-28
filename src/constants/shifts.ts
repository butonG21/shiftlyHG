// Shift-related constants
export const SHIFT_COLORS = {
  pagi: '#D0F0FD',
  middle: '#FFF3CD',
  siang: '#F8D7DA',
  off: '#E2E3E5',
} as const;

export const SHIFT_THEMES = {
  pagi: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#f0f0ff',
    text: '#312e81',
  },
  middle: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    background: '#ede9fe',
    text: '#4c1d95',
  },
  siang: {
    primary: '#8b5cf6',
    secondary: '#a855f7',
    background: '#f3e8ff',
    text: '#581c87',
  },
  off: {
    primary: '#6b7280',
    secondary: '#9ca3af',
    background: '#f9fafb',
    text: '#374151',
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