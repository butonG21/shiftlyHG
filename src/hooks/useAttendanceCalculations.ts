import { useMemo } from 'react';
import { AttendanceRecord } from '../types/attendance';
import { calculateWorkingHours, formatDuration } from '../utils/attendanceUtils';

interface SummaryData {
  totalTime: string;
  breakTime: string;
  workingTime: string;
}

export const useAttendanceCalculations = (attendanceData: AttendanceRecord | null): SummaryData => {
  return useMemo(() => {
    if (!attendanceData) {
      return {
        totalTime: '--:--',
        breakTime: '--:--',
        workingTime: '--:--'
      };
    }

    const { totalTime, breakTime, workingTime } = calculateWorkingHours(
      attendanceData.start_time,
      attendanceData.end_time,
      attendanceData.break_out_time,
      attendanceData.break_in_time
    );

    return {
      totalTime: formatDuration(totalTime),
      breakTime: formatDuration(breakTime),
      workingTime: formatDuration(workingTime)
    };
  }, [attendanceData]);
};