import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/authService';
import { classifyShift } from '../utils/shifts';
import { isToday, isTomorrow } from '../utils/dateTime';
import moment from 'moment';

interface ScheduleItem {
  date: string;
  shift: string;
}

interface UseScheduleReturn {
  todaySchedule: ScheduleItem | null;
  tomorrowSchedule: ScheduleItem | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing schedule data
 */
const useSchedule = (): UseScheduleReturn => {
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem | null>(null);
  const [tomorrowSchedule, setTomorrowSchedule] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userProfile = await getUserProfile();
      const schedules = userProfile.schedule || [];

      // Find today's and tomorrow's schedule
      const today = schedules.find((schedule: ScheduleItem) => 
        isToday(schedule.date)
      );
      
      const tomorrow = schedules.find((schedule: ScheduleItem) => 
        isTomorrow(schedule.date)
      );

      setTodaySchedule(today || null);
      setTomorrowSchedule(tomorrow || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    todaySchedule,
    tomorrowSchedule,
    loading,
    error,
    refetch: fetchSchedule,
  };
};

export default useSchedule;