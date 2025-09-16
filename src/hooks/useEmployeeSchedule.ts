import { useState, useEffect } from 'react';
import { getCurrentMonthSchedule, filterScheduleByMonth, getAvailableMonths } from '../services/scheduleService';
import { EmployeeSchedule, ScheduleItem } from '../types/schedule';
import { useAuth } from '../contexts/AuthContext';

interface UseEmployeeScheduleReturn {
  schedule: EmployeeSchedule | null;
  scheduleItems: ScheduleItem[];
  loading: boolean;
  error: string | null;
  availableMonths: { month: number; year: number; month_name: string }[];
  currentFilter: { month: number; year: number } | null;
  refetch: () => Promise<void>;
  filterByMonth: (month: number, year: number) => Promise<void>;
  loadAvailableMonths: () => Promise<void>;
}

/**
 * Custom hook for managing employee schedule data
 */
const useEmployeeSchedule = (): UseEmployeeScheduleReturn => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<EmployeeSchedule | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number; month_name: string }[]>([]);
  const [currentFilter, setCurrentFilter] = useState<{ month: number; year: number } | null>(null);

  const fetchCurrentMonthSchedule = async () => {
    if (!user?.uid) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const scheduleData = await getCurrentMonthSchedule(user.uid);
      setSchedule(scheduleData);
      setScheduleItems(scheduleData.schedule || []);
      
      // Set current filter to current month/year
      const now = new Date();
      setCurrentFilter({
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
    } catch (err) {
      console.error('Error fetching current month schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const filterByMonth = async (month: number, year: number) => {
    if (!user?.uid) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const scheduleData = await filterScheduleByMonth(user.uid, month, year);
      setSchedule(scheduleData);
      setScheduleItems(scheduleData.schedule || []);
      setCurrentFilter({ month, year });
    } catch (err) {
      console.error('Error filtering schedule by month:', err);
      
      // Handle 404 error (no schedule data found) gracefully
      if (err instanceof Error && (err.message.includes('404') || err.message.includes('not found'))) {
        // Set empty schedule data but don't show error to user
        setSchedule({
          employee_id: user.uid,
          name: '',
          position: '',
          department: '',
          schedule: [],
          statistics: {
            total_scheduled_days: 0,
            shift_distribution: {},
            working_days_in_month: 0
          }
        });
        setScheduleItems([]);
        setCurrentFilter({ month, year });
        setError(null); // Don't show error for missing data
      } else {
        setError(err instanceof Error ? err.message : 'Failed to filter schedule');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMonths = async () => {
    if (!user?.uid) {
      return;
    }

    try {
      const months = await getAvailableMonths(user.uid);
      setAvailableMonths(months || []);
    } catch (err) {
      console.error('Error loading available months:', err);
      // Set empty array as fallback to prevent undefined error
      setAvailableMonths([]);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchCurrentMonthSchedule();
      loadAvailableMonths();
    }
  }, [user?.uid]);

  return {
    schedule,
    scheduleItems,
    loading,
    error,
    availableMonths,
    currentFilter,
    refetch: fetchCurrentMonthSchedule,
    filterByMonth,
    loadAvailableMonths,
  };
};

export default useEmployeeSchedule;