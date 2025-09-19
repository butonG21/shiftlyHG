import apiClient from './api';
import { AttendanceResponse, AttendanceFilter } from '../types/attendance';
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
