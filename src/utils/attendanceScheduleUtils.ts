// src/utils/attendanceScheduleUtils.ts
import { AttendanceRecord } from '../types/attendance';
import { ScheduleItem } from '../types/schedule';

export interface AttendanceStatus {
  date: string;
  hasAttendance: boolean;
  hasSchedule: boolean;
  isWorkDay: boolean;
  isOffDay: boolean;
  status: 'present' | 'absent' | 'off' | 'leave' | 'unknown';
  attendanceData?: AttendanceRecord;
  scheduleData?: ScheduleItem;
  reason?: string;
}

/**
 * Mengecek apakah data absensi kosong (semua field waktu adalah "00:00:00" atau kosong)
 */
export const isEmptyAttendance = (attendance: AttendanceRecord): boolean => {
  const emptyTime = ['00:00:00', '00:00', '', null, undefined];
  
  return (
    emptyTime.includes(attendance.start_time) &&
    emptyTime.includes(attendance.end_time) &&
    emptyTime.includes(attendance.break_in_time) &&
    emptyTime.includes(attendance.break_out_time)
  );
};

/**
 * Mengecek apakah jadwal menunjukkan hari libur atau cuti
 */
export const isOffOrLeaveDay = (schedule: ScheduleItem): boolean => {
  const offShifts = ['OFF', 'Libur', 'CT', 'Cuti', 'off', 'libur', 'ct', 'cuti'];
  return offShifts.includes(schedule.shift);
};

/**
 * Mengecek apakah jadwal menunjukkan hari kerja
 */
export const isWorkDay = (schedule: ScheduleItem): boolean => {
  return !isOffOrLeaveDay(schedule);
};

/**
 * Format tanggal ke format YYYY-MM-DD untuk perbandingan
 */
export const formatDateForComparison = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Melakukan cross-check antara riwayat absensi dan jadwal karyawan
 */
export const crossCheckAttendanceWithSchedule = (
  attendanceRecords: AttendanceRecord[],
  scheduleItems: ScheduleItem[]
): AttendanceStatus[] => {
  const results: AttendanceStatus[] = [];
  
  // Buat map untuk akses cepat data absensi berdasarkan tanggal
  const attendanceMap = new Map<string, AttendanceRecord>();
  attendanceRecords.forEach(record => {
    const dateKey = formatDateForComparison(record.date);
    attendanceMap.set(dateKey, record);
  });

  // Buat map untuk akses cepat data jadwal berdasarkan tanggal
  const scheduleMap = new Map<string, ScheduleItem>();
  scheduleItems.forEach(schedule => {
    const dateKey = formatDateForComparison(schedule.date);
    scheduleMap.set(dateKey, schedule);
  });
  
  // Generate the last 8 days (including today) to ensure we only process this range
  const last8Days = new Set<string>();
  const today = new Date();
  
  for (let i = 7; i >= 0; i--) {
    const date = new Date(today.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    last8Days.add(dateStr);
  }
  
  const allDates = last8Days;
  
  // Analisis setiap tanggal
  allDates.forEach(date => {
    const attendance = attendanceMap.get(date);
    const schedule = scheduleMap.get(date);
    
    // Log khusus untuk tanggal 25 September
    if (date === '2025-09-25') {
      console.log(`🔍 DEBUGGING 2025-09-25:`);
      console.log(`  - Attendance found:`, !!attendance);
      console.log(`  - Schedule found:`, !!schedule, schedule ? `(shift: ${schedule.shift})` : '');
    }
    
    const hasAttendance = !!attendance;
    const hasSchedule = !!schedule;
    const isWorkDayScheduled = schedule ? isWorkDay(schedule) : false;
    const isOffDayScheduled = schedule ? isOffOrLeaveDay(schedule) : false;
    
    let status: AttendanceStatus['status'] = 'unknown';
    let reason = '';
    
    if (hasSchedule && hasAttendance) {
      // Ada jadwal dan ada data absensi
      if (isOffDayScheduled) {
        // Hari libur/cuti tapi ada absensi
        if (isEmptyAttendance(attendance)) {
          status = 'off';
          reason = 'Hari libur/cuti sesuai jadwal';
        } else {
          status = 'present';
          reason = 'Hadir meski hari libur (lembur/tugas khusus)';
        }
      } else if (isWorkDayScheduled) {
        // Hari kerja
        if (isEmptyAttendance(attendance)) {
          status = 'absent';
          reason = 'Tidak hadir pada hari kerja';
        } else {
          status = 'present';
          reason = 'Hadir sesuai jadwal';
        }
      }
    } else if (hasSchedule && !hasAttendance) {
      // Ada jadwal tapi tidak ada data absensi
      if (isOffDayScheduled) {
        status = 'off';
        reason = 'Hari libur/cuti sesuai jadwal';
      } else if (isWorkDayScheduled) {
        status = 'absent';
        reason = 'Tidak ada data absensi pada hari kerja';
      }
    } else if (!hasSchedule && hasAttendance) {
      // Ada data absensi tapi tidak ada jadwal
      if (isEmptyAttendance(attendance)) {
        status = 'unknown';
        reason = 'Data absensi kosong, jadwal tidak tersedia';
      } else {
        status = 'present';
        reason = 'Hadir tanpa jadwal terdaftar';
      }
    } else {
      // Tidak ada jadwal dan tidak ada data absensi
      status = 'unknown';
      reason = 'Tidak ada data jadwal dan absensi';
    }
    
    results.push({
      date,
      hasAttendance,
      hasSchedule,
      isWorkDay: isWorkDayScheduled,
      isOffDay: isOffDayScheduled,
      status,
      attendanceData: attendance,
      scheduleData: schedule,
      reason
    });
  });
  
  // Urutkan berdasarkan tanggal (terbaru dulu)
  const sortedResults = results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Log hasil untuk tanggal 25 September
  const sept25Result = sortedResults.find(r => r.date === '2025-09-25');
  if (sept25Result) {
    console.log('🎯 FINAL RESULT for 2025-09-25:', {
      hasAttendance: sept25Result.hasAttendance,
      hasSchedule: sept25Result.hasSchedule,
      status: sept25Result.status,
      scheduleData: sept25Result.scheduleData
    });
  }
  
  return sortedResults;
};

/**
 * Mendapatkan statistik dari hasil cross-check
 */
export const getAttendanceStatistics = (attendanceStatuses: AttendanceStatus[]) => {
  const stats = {
    total: attendanceStatuses.length,
    present: 0,
    absent: 0,
    off: 0,
    leave: 0,
    unknown: 0
  };
  
  attendanceStatuses.forEach(status => {
    stats[status.status]++;
  });
  
  return stats;
};

/**
 * Mendapatkan warna status untuk UI
 */
export const getStatusColor = (status: AttendanceStatus['status']): string => {
  switch (status) {
    case 'present':
      return '#4CAF50'; // Green
    case 'absent':
      return '#F44336'; // Red
    case 'off':
    case 'leave':
      return '#FF9800'; // Orange
    case 'unknown':
    default:
      return '#9E9E9E'; // Gray
  }
};

/**
 * Mendapatkan ikon status untuk UI
 */
export const getStatusIcon = (status: AttendanceStatus['status']): string => {
  switch (status) {
    case 'present':
      return 'checkmark-circle';
    case 'absent':
      return 'close-circle';
    case 'off':
    case 'leave':
      return 'calendar';
    case 'unknown':
    default:
      return 'help-circle';
  }
};

/**
 * Mendapatkan label status dalam bahasa Indonesia
 */
export const getStatusLabel = (status: AttendanceStatus['status']): string => {
  switch (status) {
    case 'present':
      return 'Hadir';
    case 'absent':
      return 'Tidak Hadir';
    case 'off':
      return 'Libur';
    case 'leave':
      return 'Cuti';
    case 'unknown':
    default:
      return 'Tidak Diketahui';
  }
};