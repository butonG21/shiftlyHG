import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserAttendance, getAttendanceByFilter } from '../services/attendanceService';
import { AttendanceRecord, AttendanceFilter } from '../types/attendance';

const useAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentFilter, setCurrentFilter] = useState<AttendanceFilter | null>(null);

  const loadAttendance = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetchUserAttendance(user.uid);
      // Extract data from response - assuming it returns array or single record
      const attendanceData = Array.isArray(response) ? response : response.data ? [response.data] : [];
      setAttendance(attendanceData);
      
      // Always set current filter to today's date when loading attendance
      const today = new Date();
      const todayFilter = {
        date: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear()
      };
      setCurrentFilter(todayFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = async (filter: AttendanceFilter) => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getAttendanceByFilter(user.uid, filter);
      // Extract data from response - assuming it returns array or single record
      const attendanceData = Array.isArray(response) ? response : response.data ? [response.data] : [];
      setAttendance(attendanceData);
      setCurrentFilter(filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadAttendance();
    }
  }, [user?.uid]);

  return {
    attendance,
    loading,
    error,
    currentFilter,
    refetch: loadAttendance,
    filterAttendance,
  };
};

export default useAttendance;
