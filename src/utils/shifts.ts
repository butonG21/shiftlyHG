import { SHIFT_COLORS } from '../constants/shifts';
import { ShiftType } from '../types/schedule';

/**
 * Classify shift based on raw shift string
 */
export const classifyShift = (shiftRaw: string): ShiftType => {
  if (!shiftRaw) return 'off';
  const normalized = shiftRaw.toLowerCase();
  
  // Khusus untuk shift 'CT' dan shift khusus lainnya yang bukan jam
  if (normalized === 'ct' || !normalized.match(/^(\d{1,2})(?::\d{2})?$|^off$/i)) {
    return 'special';
  }
  
  if (normalized === 'off') return 'off';

  const hourMatch = normalized.match(/^(\d{1,2})(?::\d{2})?$/);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1], 10);
    if (hour >= 7 && hour <= 9) return 'pagi';
    if (hour >= 10 && hour <= 11) return 'middle';
    if (hour >= 12 && hour <= 13) return 'siang';
  }
  return 'off';
};

/**
 * Get shift color by type
 */
export const getShiftColor = (shiftType: ShiftType): string => {
  return SHIFT_COLORS[shiftType];
};

/**
 * Check if shift is work day
 */
export const isWorkDay = (shiftType: ShiftType): boolean => {
  return shiftType !== 'off' && shiftType !== 'special';
};

/**
 * Get shift display name
 */
export const getShiftDisplayName = (shiftType: ShiftType): string => {
  const displayNames = {
    pagi: 'Pagi',
    middle: 'Tengah Hari',
    siang: 'Siang',
    off: 'Libur',
    special: 'Special'
  };
  return displayNames[shiftType];
};