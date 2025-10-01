import apiClient from './api';
import { AttendanceResponse, AttendanceFilter, WeeklyAttendanceResponse, DateRange, AttendanceRecord } from '../types/attendance';
import { ApiResponse } from '../types/api';

export const fetchUserAttendance = async (employeeId: string): Promise<AttendanceResponse> => {
  try {
    // First API call
    await apiClient.get<ApiResponse<AttendanceResponse>>(`/attendance/fetch/${employeeId}`);
    
    // Second API call with current date
    const now = new Date();
    const filter: AttendanceFilter = {
      date: now.getDate().toString(),
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
    
    return await getAttendanceByFilter(employeeId, filter);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export const getAttendanceByFilter = async (
  employeeId: string,
  filter: AttendanceFilter
): Promise<AttendanceResponse> => {
  try {
    const { date, month, year } = filter;
    const queryParams = new URLSearchParams({
      date: date.toString(), // Will be just the day number
      month: month.toString(),
      year: year.toString()
    });
    
    const response = await apiClient.get<AttendanceResponse>(
      `/attendance/${employeeId}/filter?${queryParams.toString()}`
    );
    
    console.log('API Response:', response.data); // Debug log
    return response.data; // Return the complete response
  } catch (error) {
    console.error('Error fetching filtered attendance:', error);
    throw error;
  }
};

// Helper function to get last 7 days date range
export const getLastWeekDateRange = (): DateRange => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6); // 7 days including today
  
  return {
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Helper function to generate array of dates for the last 7 days
export const getLastWeekDates = (): AttendanceFilter[] => {
  const dates: AttendanceFilter[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    dates.push({
      date: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    });
  }
  
  return dates;
};

// Fetch attendance data for the last 7 days
export const fetchWeeklyAttendance = async (employeeId: string): Promise<WeeklyAttendanceResponse> => {
  try {
    console.log('Fetching weekly attendance for employee:', employeeId);
    
    const weekDates = getLastWeekDates();
    const attendancePromises = weekDates.map(filter => 
      getAttendanceByFilter(employeeId, filter).catch(error => {
        console.warn(`Failed to fetch attendance for ${filter.year}-${filter.month}-${filter.date}:`, error);
        return null; // Return null for failed requests
      })
    );
    
    const results = await Promise.all(attendancePromises);
    
    // Filter out null results and extract successful data
    const validAttendance = results
      .filter((result): result is AttendanceResponse => result !== null && result.success)
      .map(result => result.data); // Each result.data is a single AttendanceRecord
    
    console.log(`Successfully fetched ${validAttendance.length} attendance records out of ${weekDates.length} days`);
    
    return {
      success: true,
      message: `Fetched ${validAttendance.length} attendance records`,
      data: validAttendance,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    throw error;
  }
};
