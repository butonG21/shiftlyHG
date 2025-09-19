import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserAttendance, getAttendanceByFilter } from '../services/attendanceService';
import { AttendanceResponse, AttendanceFilter } from '../types/attendance';

const useAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
  const [currentFilter, setCurrentFilter] = useState<AttendanceFilter | null>(null);

  const loadAttendance = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserAttendance(user.uid);
      setAttendance(data);
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
      const data = await getAttendanceByFilter(user.uid, filter);
      setAttendance(data);
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
