import { useMemo } from 'react';
import { ATTENDANCE_COLORS, ATTENDANCE_ICONS, ATTENDANCE_TYPES } from '../constants/attendance';

interface StatusInfo {
  color: string;
  icon: string;
  bgColor: string;
  borderColor: string;
}

export const useAttendanceStatus = (type: string): StatusInfo => {
  return useMemo(() => {
    const normalizedType = type.toLowerCase();
    
    // Find matching attendance type
    const attendanceTypeKey = Object.values(ATTENDANCE_TYPES).find(
      t => t === normalizedType
    );

    if (attendanceTypeKey && ATTENDANCE_COLORS[attendanceTypeKey]) {
      return {
        ...ATTENDANCE_COLORS[attendanceTypeKey],
        icon: ATTENDANCE_ICONS[attendanceTypeKey]
      };
    }

    // Return default values
    return {
      ...ATTENDANCE_COLORS.default,
      icon: ATTENDANCE_ICONS.default
    };
  }, [type]);
};