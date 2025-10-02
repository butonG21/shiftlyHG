// src/hooks/useAttendanceScheduleCheck.ts
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWeeklyAttendance } from '../services/attendanceService';
import { getScheduleByDateRange } from '../services/scheduleService';
import { AttendanceRecord } from '../types/attendance';
import { ScheduleItem } from '../types/schedule';
import { 
  crossCheckAttendanceWithSchedule, 
  getAttendanceStatistics,
  AttendanceStatus 
} from '../utils/attendanceScheduleUtils';

interface UseAttendanceScheduleCheckReturn {
  attendanceStatuses: AttendanceStatus[];
  statistics: ReturnType<typeof getAttendanceStatistics>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  weeklyAttendance: AttendanceRecord[];
  scheduleItems: ScheduleItem[];
}

/**
 * Hook untuk melakukan cross-check antara riwayat absensi dan jadwal karyawan
 */
const useAttendanceScheduleCheck = (): UseAttendanceScheduleCheckReturn => {
  const { user } = useAuth();
  const [weeklyAttendance, setWeeklyAttendance] = useState<AttendanceRecord[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mendapatkan tanggal 8 hari terakhir (untuk konsistensi dengan data absensi)
  const getLastWeekDateRange = () => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 8 hari terakhir
    
    return {
      startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const fetchData = async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getLastWeekDateRange();

      // Fetch data absensi dan jadwal secara paralel
      const [attendanceResponse, scheduleResponse] = await Promise.allSettled([
        fetchWeeklyAttendance(user.uid),
        getScheduleByDateRange(user.uid, startDate, endDate)
      ]);

      // Handle attendance data
      let attendanceData: AttendanceRecord[] = [];
      if (attendanceResponse.status === 'fulfilled') {
        attendanceData = attendanceResponse.value.data || [];
      } else {
        console.warn('Failed to fetch attendance data:', attendanceResponse.reason);
      }

      // Handle schedule data
      let scheduleData: ScheduleItem[] = [];
      if (scheduleResponse.status === 'fulfilled') {
        scheduleData = scheduleResponse.value.schedule || [];
      } else {
        console.warn('Failed to fetch schedule data:', scheduleResponse.reason);
        // Jika gagal mengambil jadwal, coba ambil jadwal bulan ini sebagai fallback
        try {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          
          // Import filterScheduleByMonth untuk fallback
          const { filterScheduleByMonth } = await import('../services/scheduleService');
          const fallbackSchedule = await filterScheduleByMonth(user.uid, currentMonth, currentYear);
          
          // Filter jadwal hanya untuk 7 hari terakhir
          const startDateObj = new Date(startDate);
          const endDateObj = new Date(endDate);
          
          scheduleData = (fallbackSchedule.schedule || []).filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDateObj && itemDate <= endDateObj;
          });
        } catch (fallbackError) {
          console.warn('Fallback schedule fetch also failed:', fallbackError);
        }
      }

      setWeeklyAttendance(attendanceData);
      setScheduleItems(scheduleData);

    } catch (err) {
      console.error('Error fetching attendance and schedule data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Melakukan cross-check menggunakan useMemo untuk optimasi
  const attendanceStatuses = useMemo(() => {
    if (weeklyAttendance.length === 0 && scheduleItems.length === 0) {
      return [];
    }
    
    return crossCheckAttendanceWithSchedule(weeklyAttendance, scheduleItems);
  }, [weeklyAttendance, scheduleItems]);

  // Menghitung statistik
  const statistics = useMemo(() => {
    return getAttendanceStatistics(attendanceStatuses);
  }, [attendanceStatuses]);

  useEffect(() => {
    if (user?.uid) {
      fetchData();
    }
  }, [user?.uid]);

  return {
    attendanceStatuses,
    statistics,
    loading,
    error,
    refetch: fetchData,
    weeklyAttendance,
    scheduleItems,
  };
};

export default useAttendanceScheduleCheck;