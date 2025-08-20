// src/services/scheduleService.ts
import apiClient, { ApiResponse, extractApiData, handleApiError, ApiError } from './api';

// Schedule interfaces
interface ScheduleItem {
  date: string;
  shift: string;
}

interface ScheduleFilter {
  month: number;
  year: number;
  month_name: string;
  total_days: number;
}

interface ScheduleStatistics {
  total_scheduled_days: number;
  shift_distribution: {
    [shiftName: string]: number;
  };
  working_days_in_month: number;
}

interface EmployeeSchedule {
  employee_id: string;
  name: string;
  position: string;
  department: string;
  filter?: ScheduleFilter;
  statistics?: ScheduleStatistics;
  schedule: ScheduleItem[];
}

interface UploadResponse {
  processed: number;
  success: number;
  failed: number;
  total: number;
  message: string;
}

// Upload Excel schedule
export const uploadExcelSchedule = async (file: any): Promise<UploadResponse> => {
  try {
    console.log('Uploading Excel schedule...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      '/schedules/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const uploadData = extractApiData(response);
    console.log('Excel schedule uploaded successfully:', uploadData);
    return uploadData;
  } catch (error) {
    console.error('Upload Excel schedule error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Get all schedules
export const getAllSchedules = async (): Promise<EmployeeSchedule[]> => {
  try {
    console.log('Fetching all schedules...');
    
    const response = await apiClient.get<ApiResponse<EmployeeSchedule[]>>('/schedules');
    const schedules = extractApiData(response);
    
    console.log('All schedules fetched successfully');
    return schedules;
  } catch (error) {
    console.error('Get all schedules error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Search schedules by name
export const searchSchedulesByName = async (name: string): Promise<EmployeeSchedule[]> => {
  try {
    console.log('Searching schedules by name:', name);
    
    const response = await apiClient.get<ApiResponse<EmployeeSchedule[]>>(`/schedules/search?name=${encodeURIComponent(name)}`);
    const schedules = extractApiData(response);
    
    console.log('Schedules search completed');
    return schedules;
  } catch (error) {
    console.error('Search schedules error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Get employee schedule
export const getEmployeeSchedule = async (employeeId: string): Promise<EmployeeSchedule> => {
  try {
    console.log('Fetching employee schedule for:', employeeId);
    
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/schedules/employee/${employeeId}`);
    const schedule = extractApiData(response);
    
    console.log('Employee schedule fetched successfully');
    return schedule;
  } catch (error) {
    console.error('Get employee schedule error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Filter schedule by month
export const filterScheduleByMonth = async (employeeId: string, month: number, year: number): Promise<EmployeeSchedule> => {
  try {
    console.log('Filtering schedule by month:', { employeeId, month, year });
    
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/schedules/employee/${employeeId}/filter?month=${month}&year=${year}`);
    const schedule = extractApiData(response);
    
    console.log('Schedule filtered successfully');
    return schedule;
  } catch (error) {
    console.error('Filter schedule error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Get current month schedule
export const getCurrentMonthSchedule = async (employeeId: string): Promise<EmployeeSchedule> => {
  try {
    console.log('Fetching current month schedule for:', employeeId);
    
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/schedules/employee/${employeeId}/current-month`);
    const schedule = extractApiData(response);
    
    console.log('Current month schedule fetched successfully');
    return schedule;
  } catch (error) {
    console.error('Get current month schedule error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Get available months
export const getAvailableMonths = async (employeeId: string): Promise<{ month: number; year: number; month_name: string }[]> => {
  try {
    console.log('Fetching available months for:', employeeId);
    
    const response = await apiClient.get<ApiResponse<{ month: number; year: number; month_name: string }[]>>(`/schedules/employee/${employeeId}/available-months`);
    const months = extractApiData(response);
    
    console.log('Available months fetched successfully');
    return months;
  } catch (error) {
    console.error('Get available months error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Get schedule by date range
export const getScheduleByDateRange = async (employeeId: string, startDate: string, endDate: string): Promise<EmployeeSchedule> => {
  try {
    console.log('Fetching schedule by date range:', { employeeId, startDate, endDate });
    
    const response = await apiClient.get<ApiResponse<EmployeeSchedule>>(`/schedules/employee/${employeeId}/date-range?start=${startDate}&end=${endDate}`);
    const schedule = extractApiData(response);
    
    console.log('Schedule by date range fetched successfully');
    return schedule;
  } catch (error) {
    console.error('Get schedule by date range error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export type { ScheduleItem, ScheduleFilter, ScheduleStatistics, EmployeeSchedule, UploadResponse };