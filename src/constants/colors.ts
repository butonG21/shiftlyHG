// Color constants
export const COLORS = {
  primary: '#00425A',
  secondary: '#F9B233',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
  gradient: {
    primary: ['#00425A', '#006B8F'],
    secondary: ['#F9B233', '#FFD700'],
  },
} as const;

export const OPACITY = {
  disabled: 0.6,
  overlay: 0.8,
  subtle: 0.1,
  medium: 0.3,
  strong: 0.7,
} as const;