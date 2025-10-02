import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserAttendance, getAttendanceByFilter, fetchWeeklyAttendance } from '../services/attendanceService';
import { AttendanceResponse, AttendanceFilter, WeeklyAttendanceResponse } from '../types/attendance';

const useAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
  const [currentFilter, setCurrentFilter] = useState<AttendanceFilter | null>(null);
  
  // Weekly attendance state
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendanceResponse | null>(null);

  const loadAttendance = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserAttendance(user.uid);
      setAttendance(data);
      setCurrentFilter(null); // Clear filter when loading today's data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const filterAttendance = useCallback(async (filter: AttendanceFilter) => {
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
  }, [user?.uid]);

  const loadWeeklyAttendance = useCallback(async () => {
    if (!user?.uid) {
      return;
    }
    
    try {
      setWeeklyLoading(true);
      setWeeklyError(null);
      const data = await fetchWeeklyAttendance(user.uid);
      setWeeklyAttendance(data);
    } catch (err) {
      console.error('Error loading weekly attendance:', err);
      setWeeklyError(err instanceof Error ? err.message : 'Failed to fetch weekly attendance');
    } finally {
      setWeeklyLoading(false);
    }
  }, [user?.uid]);

  // Remove automatic loading - let the component control when to load data
  // useEffect(() => {
  //   if (user?.uid) {
  //     loadAttendance();
  //   }
  // }, [user?.uid]);

  return {
    attendance,
    loading,
    error,
    currentFilter,
    refetch: loadAttendance,
    filterAttendance,
    // Weekly attendance
    weeklyAttendance,
    weeklyLoading,
    weeklyError,
    loadWeeklyAttendance,
  };
};

export default useAttendance;
