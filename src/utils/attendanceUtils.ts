/**
 * Utility functions for attendance calculations and formatting
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
 * Format duration in milliseconds to human readable format (Xh Ym)
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
 * Format date to readable string
 */
export const formatAttendanceDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get photo label based on attendance type
 */
export const getPhotoLabel = (type: string): string => {
  return `${type} Photo`;
};

/**
 * Calculate working hours from attendance data
 */
export const calculateWorkingHours = (
  startTime: string,
  endTime: string,
  breakOutTime: string,
  breakInTime: string
): {
  totalTime: number;
  breakTime: number;
  workingTime: number;
} => {
  const checkIn = parseTime(startTime);
  const checkOut = parseTime(endTime);
  const breakStart = parseTime(breakOutTime);
  const breakEnd = parseTime(breakInTime);

  let totalTime = 0;
  let breakTime = 0;
  let workingTime = 0;

  if (checkIn && checkOut) {
    totalTime = checkOut.getTime() - checkIn.getTime();
    
    // Calculate break duration
    if (breakStart && breakEnd) {
      breakTime = breakEnd.getTime() - breakStart.getTime();
    }
    
    // Working time = total time - break time
    workingTime = totalTime - breakTime;
  }

  return {
    totalTime,
    breakTime,
    workingTime
  };
};

/**
 * Validate if time string is valid
 */
export const isValidTime = (timeStr: string): boolean => {
  if (!timeStr || timeStr === '--:--:--') return false;
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  return timeRegex.test(timeStr);
};

/**
 * Check if attendance record is complete
 */
export const isAttendanceComplete = (
  startTime: string,
  endTime: string
): boolean => {
  return isValidTime(startTime) && isValidTime(endTime);
};