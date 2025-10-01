import { COLORS } from './colors';

export const ATTENDANCE_TYPES = {
  MASUK: { color: COLORS.status.success, icon: 'log-in-outline' },
  IZIN: { color: COLORS.status.warning, icon: 'time-outline' },
  PULANG: { color: COLORS.status.info, icon: 'log-out-outline' },
  SAKIT: { color: COLORS.status.error, icon: 'medical-outline' },
};