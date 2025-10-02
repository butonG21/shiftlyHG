import React, { useRef, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import useAttendanceScheduleCheck from '../../hooks/useAttendanceScheduleCheck';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { 
  getStatusColor, 
  getStatusIcon, 
  getStatusLabel,
  AttendanceStatus 
} from '../../utils/attendanceScheduleUtils';

interface AttendanceHistoryProps {
  // Keeping original props for backward compatibility but not using them
  weeklyAttendance?: any;
  weeklyAttendanceLoading?: boolean;
  weeklyAttendanceError?: string | null;
  loadWeeklyAttendance?: () => void;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Use the new hook for cross-checking attendance with schedule
  const {
    attendanceStatuses,
    statistics,
    loading,
    error,
    refetch,
  } = useAttendanceScheduleCheck();

  const handleAttendanceCardPress = (date: string) => {
    navigation.navigate('Attendance', { selectedDate: date });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (timeString: string): string => {
    if (!timeString || timeString === '00:00:00' || timeString === '00:00') {
      return '--:--';
    }
    return timeString.substring(0, 5);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="calendar-outline" size={48} color={COLORS.text.secondary} />
      <Text style={styles.emptyStateTitle}>Belum Ada Data</Text>
      <Text style={styles.emptyStateText}>
        Data absensi dan jadwal untuk 7 hari terakhir belum tersedia
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={refetch}
      >
        <Ionicons name="refresh" size={16} color={COLORS.primary} />
        <Text style={styles.refreshButtonText}>Muat Ulang</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={24} color={COLORS.status.error} />
      <Text style={styles.errorText}>Gagal memuat data absensi dan jadwal</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={refetch}
      >
        <Text style={styles.retryButtonText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Memuat data absensi dan jadwal...</Text>
    </View>
  );

  const renderStatistics = () => {
    if (attendanceStatuses.length === 0) return null;

    return (
      <View style={styles.statisticsContainer}>
        <Text style={styles.statisticsTitle}>Ringkasan 7 Hari Terakhir</Text>
        <View style={styles.statisticsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: getStatusColor('present') }]}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{statistics.present}</Text>
            <Text style={styles.statLabel}>Hadir</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: getStatusColor('absent') }]}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{statistics.absent}</Text>
            <Text style={styles.statLabel}>Tidak Hadir</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: getStatusColor('off') }]}>
              <Ionicons name="calendar" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{statistics.off}</Text>
            <Text style={styles.statLabel}>Libur</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: getStatusColor('unknown') }]}>
              <Ionicons name="help" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.statValue}>{statistics.unknown}</Text>
            <Text style={styles.statLabel}>Tidak Diketahui</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAttendanceCard = (status: AttendanceStatus) => {
    const statusColor = getStatusColor(status.status);
    const statusIcon = getStatusIcon(status.status);
    const statusLabel = getStatusLabel(status.status);
    
    const startTime = status.attendanceData?.start_time ? formatTime(status.attendanceData.start_time) : '--:--';
    const endTime = status.attendanceData?.end_time ? formatTime(status.attendanceData.end_time) : '--:--';
    
    // Calculate duration
    let duration = '--:--';
    if (status.attendanceData?.start_time && status.attendanceData?.end_time && 
        status.attendanceData.start_time !== '00:00:00' && status.attendanceData.end_time !== '00:00:00') {
      const start = new Date(`2000-01-01T${status.attendanceData.start_time}`);
      const end = new Date(`2000-01-01T${status.attendanceData.end_time}`);
      const diffMs = end.getTime() - start.getTime();
      if (diffMs > 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${diffHours}j ${diffMinutes}m`;
      }
    }

    return (
      <TouchableOpacity 
        key={status.date} 
        style={styles.historyCard}
        onPress={() => handleAttendanceCardPress(status.date)}
        activeOpacity={0.7}
      >
        <View style={styles.historyHeader}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>{formatDate(status.date)}</Text>
            <Text style={styles.historyTime}>
              {status.scheduleData ? `Jadwal: ${status.scheduleData.shift}` : 'Tidak ada jadwal'}
            </Text>
          </View>
          <View style={styles.historyStatusContainer}>
            <View style={[styles.historyStatusBadge, { backgroundColor: statusColor }]}>
              <Ionicons name={statusIcon as any} size={12} color="#FFFFFF" />
              <Text style={styles.historyStatusText}>{statusLabel}</Text>
            </View>
            {status.reason && (
              <Text style={styles.reasonText}>{status.reason}</Text>
            )}
          </View>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.historyDetailItem}>
            <Text style={styles.historyDetailLabel}>Jam Masuk</Text>
            <Text style={styles.historyDetailValue}>{startTime}</Text>
          </View>
          <View style={styles.historyDetailItem}>
            <Text style={styles.historyDetailLabel}>Jam Keluar</Text>
            <Text style={styles.historyDetailValue}>{endTime}</Text>
          </View>
          <View style={styles.historyDetailItem}>
            <Text style={styles.historyDetailLabel}>Durasi</Text>
            <Text style={styles.historyDetailValue}>{duration}</Text>
          </View>
        </View>

        {status.attendanceData?.start_address && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
            <Text style={styles.locationText} numberOfLines={2}>
              {status.attendanceData.start_address}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHistoryList = () => {
    if (attendanceStatuses.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <View style={styles.historyList}>
        {renderStatistics()}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.historyListContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior="never"
          style={{ flex: 1 }}
        >
          {attendanceStatuses.map((status) => renderAttendanceCard(status))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.historyTitle}>Riwayat Absensi (7 Hari Terakhir)</Text>
        <TouchableOpacity 
          style={styles.refreshHeaderButton}
          onPress={refetch}
          disabled={loading}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={loading ? COLORS.text.secondary : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {loading ? renderLoadingState() : 
       error ? renderErrorState() : 
       renderHistoryList()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    paddingTop: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
  },
  refreshHeaderButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}15`,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 40,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
    color: COLORS.status.error,
    textAlign: 'center' as const,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.status.error,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  statisticsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  statisticsGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  statItem: {
    alignItems: 'center' as const,
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center' as const,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: 16,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  historyDateContainer: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  historyStatusContainer: {
    alignItems: 'flex-end' as const,
  },
  historyStatusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  historyStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500' as const,
    marginLeft: 4,
  },
  reasonText: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textAlign: 'right' as const,
    maxWidth: 120,
  },
  historyDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  historyDetailItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  historyDetailLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  historyDetailValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text.primary,
    textAlign: 'center' as const,
  },
  locationContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
    flex: 1,
  },
};

export default memo(AttendanceHistory);