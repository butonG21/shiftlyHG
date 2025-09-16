// src/types/schedule.ts
export interface ScheduleItem {
  date: string;
  shift: string;
  location?: string;
  notes?: string;
}

export interface ScheduleFilter {
  month: number;
  year: number;
  month_name: string;
  total_days: number;
}

export interface ScheduleStatistics {
  total_scheduled_days: number;
  shift_distribution: {
    [shiftName: string]: number;
  };
  working_days_in_month: number;
}

export interface EmployeeSchedule {
  employee_id: string;
  name: string;
  position: string;
  department: string;
  filter?: ScheduleFilter;
  statistics?: ScheduleStatistics;
  schedule: ScheduleItem[];
}

export interface UploadResponse {
  processed: number;
  success: number;
  failed: number;
  total: number;
  message: string;
}

export type ShiftType = 'pagi' | 'middle' | 'siang' | 'off' | 'special';

export interface ShiftTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface ShiftConfig {
  colors: ShiftTheme;
  message: string;
  icon: string;
  animation: object; // Lottie animation JSON object
}