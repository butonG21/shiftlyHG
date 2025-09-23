/**
 * Constants for attendance feature
 */

export const ATTENDANCE_TYPES = {
  CHECK_IN: 'check in',
  BREAK_START: 'break start',
  BREAK_END: 'break end',
  CHECK_OUT: 'check out'
} as const;

export const ATTENDANCE_STATUS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  ERROR: 'error',
  DEFAULT: 'default'
} as const;

export const ATTENDANCE_ICONS = {
  [ATTENDANCE_TYPES.CHECK_IN]: 'login',
  [ATTENDANCE_TYPES.BREAK_START]: 'coffee',
  [ATTENDANCE_TYPES.BREAK_END]: 'coffee-off',
  [ATTENDANCE_TYPES.CHECK_OUT]: 'logout',
  default: 'clock'
} as const;

export const ATTENDANCE_COLORS = {
  [ATTENDANCE_TYPES.CHECK_IN]: {
    color: '#22c55e',
    bgColor: '#f0fdf4',
    borderColor: '#22c55e'
  },
  [ATTENDANCE_TYPES.BREAK_START]: {
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#f59e0b'
  },
  [ATTENDANCE_TYPES.BREAK_END]: {
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#3b82f6'
  },
  [ATTENDANCE_TYPES.CHECK_OUT]: {
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#ef4444'
  },
  default: {
    color: '#64748b',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0'
  }
} as const;

export const ATTENDANCE_MESSAGES = {
  NO_DATA: 'No attendance records found for this date.',
  SELECT_DATE: 'Please select a date to view attendance records.',
  LOADING: 'Loading attendance data...',
  ERROR: 'Failed to load attendance data. Please try again.',
  EMPTY_STATE_TITLE: 'No Attendance Records',
  EMPTY_STATE_SUBTITLE: 'No attendance data found for the selected date.'
} as const;

export const ATTENDANCE_LABELS = {
  TOTAL_TIME: 'Total Time',
  BREAK_TIME: 'Break Time',
  WORKING_TIME: 'Working Time',
  DAILY_SUMMARY: 'Daily Summary',
  ATTENDANCE_RECORDS: 'Attendance Records'
} as const;

export type AttendanceType = typeof ATTENDANCE_TYPES[keyof typeof ATTENDANCE_TYPES];
export type AttendanceStatusType = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];