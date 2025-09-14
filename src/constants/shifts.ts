// Shift-related constants
export const SHIFT_COLORS = {
  pagi: '#D0F0FD',
  middle: '#FFF3CD',
  siang: '#F8D7DA',
  off: '#E2E3E5',
} as const;

export const SHIFT_THEMES = {
  pagi: {
    primary: '#3b82f6',        // Modern blue for morning
    secondary: '#60a5fa',      // Light blue accent
    background: '#eff6ff',     // Blue-50 background
    text: '#1e40af',          // Blue-800 text
  },
  middle: {
    primary: '#f59e0b',        // Warm amber for midday
    secondary: '#fbbf24',      // Light amber accent
    background: '#fffbeb',     // Amber-50 background
    text: '#92400e',          // Amber-800 text
  },
  siang: {
    primary: '#ef4444',        // Vibrant red for afternoon
    secondary: '#f87171',      // Light red accent
    background: '#fef2f2',     // Red-50 background
    text: '#b91c1c',          // Red-700 text
  },
  off: {
    primary: '#10b981',        // Fresh green for off days
    secondary: '#34d399',      // Light green accent
    background: '#ecfdf5',     // Green-50 background
    text: '#047857',          // Green-700 text
  },
} as const;

export const SHIFT_MESSAGES = {
  pagi: 'masuk pukul',
  middle: 'masuk pukul',
  siang: 'masuk pukul',
  off: 'libur atau cuti',
} as const;

export const SHIFT_ICONS = {
  pagi: 'white-balance-sunny' as const,
  middle: 'weather-cloudy' as const,
  siang: 'weather-sunset-down' as const,
  off: 'coffee' as const,
} as const;

export type ShiftType = keyof typeof SHIFT_COLORS;