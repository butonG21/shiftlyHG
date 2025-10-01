/**
 * Utility functions for time calculations and formatting
 */

/**
 * Parse time string (HH:MM:SS or HH:MM) to Date object
 */
export const parseTime = (timeStr: string): Date | null => {
  if (!timeStr || timeStr === '--:--:--') return null;
  
  const today = new Date();
  const [hours, minutes, seconds = '00'] = timeStr.split(':');
  
  if (hours && minutes) {
    const date = new Date(today);
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));
    return date;
  }
  return null;
};

/**
 * Format duration in milliseconds to human readable format (e.g., "2h 30m")
 */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds <= 0) return '--:--';
  
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Calculate duration between two time strings
 */
export const calculateDuration = (startTime?: string, endTime?: string): string => {
  if (!startTime || !endTime || endTime === '00:00:00') return '0:00';
  
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  if (!start || !end) return '0:00';
  
  const duration = end.getTime() - start.getTime();
  return formatDuration(duration);
};

/**
 * Calculate summary data from attendance record
 */
export interface AttendanceSummary {
  totalTime: string;
  breakTime: string;
  workingTime: string;
}

export const calculateAttendanceSummary = (data: {
  start_time: string;
  end_time: string;
  break_out_time: string;
  break_in_time: string;
}): AttendanceSummary => {
  // Parse times
  const checkIn = parseTime(data.start_time);
  const breakStart = parseTime(data.break_out_time);
  const breakEnd = parseTime(data.break_in_time);
  const checkOut = parseTime(data.end_time);

  // Calculate total working time
  let totalWorkingTime = 0;
  let breakTime = 0;

  if (checkIn && checkOut) {
    const totalTime = checkOut.getTime() - checkIn.getTime();
    
    // Calculate break duration
    if (breakStart && breakEnd) {
      breakTime = breakEnd.getTime() - breakStart.getTime();
    }
    
    // Working time = total time - break time
    totalWorkingTime = totalTime - breakTime;
  }

  return {
    totalTime: checkIn && checkOut ? formatDuration(checkOut.getTime() - checkIn.getTime()) : '--:--',
    breakTime: formatDuration(breakTime),
    workingTime: formatDuration(totalWorkingTime)
  };
};

/**
 * Format date to readable string
 */
export const formatDateString = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};