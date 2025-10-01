export interface AttendanceRecord {
  _id: string;
  date: string;
  userid: string;
  name: string;
  start_time: string;
  end_time: string;
  break_in_time: string;
  break_out_time: string;
  start_address: string;
  end_address: string;
  break_in_address: string;
  break_out_address: string;
  start_image: string;
  end_image: string;
  break_in_image: string;
  break_out_image: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties for display formatting
  type?: string;
  time?: string;
  location?: string;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord;
  timestamp: string;
}

export interface AttendanceFilter {
  date: string | number; // Can be string or number for day of month
  month: number;
  year: number;
}

export interface WeeklyAttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord[];
  timestamp: string;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}