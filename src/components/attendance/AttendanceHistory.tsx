import React, { useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ATTENDANCE_TYPES } from '../../constants/attendance';

interface AttendanceItem {
  id: string;
  date: string;
  time: string;
  endTime: string;
  duration: string;
  location: string;
  category: string;
  verified: boolean;
}

interface WeeklyAttendanceData {
  data: any[];
}

interface AttendanceHistoryProps {
  weeklyAttendance: WeeklyAttendanceData | null;
  weeklyAttendanceLoading: boolean;
  weeklyAttendanceError: string | null;
  loadWeeklyAttendance: () => void;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  weeklyAttendance,
  weeklyAttendanceLoading,
  weeklyAttendanceError,
  loadWeeklyAttendance,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Helper function to format attendance data for display
  const formatAttendanceForDisplay = (data: any[]) => {
    console.log('Raw attendance data:', data);
    
    return data.map((record: any, index: number) => {
      // Extract time from start_time (format: "HH:MM:SS" or "HH:MM")
      const startTime = record.start_time ? record.start_time.substring(0, 5) : '00:00';
      const endTime = record.end_time ? record.end_time.substring(0, 5) : '-';
      
      // Calculate duration
      let duration = '-';
      if (record.start_time && record.end_time) {
        const start = new Date(`2000-01-01T${record.start_time}`);
        const end = new Date(`2000-01-01T${record.end_time}`);
        const diffMs = end.getTime() - start.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = `${diffHours}j ${diffMinutes}m`;
      }
      
      const formatted = {
        ...record,
        id: record._id || record.userid + '_' + record.date + '_' + index,
        category: record.start_time ? 'MASUK' : 'KELUAR',
        time: startTime,
        endTime: endTime,
        duration: duration,
        location: record.start_address || record.end_address || 'Lokasi tidak tersedia',
        verified: true, // Assume verified for now
        date: record.date
      };
      
      return formatted;
    });
  };
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="calendar-outline" size={48} color={COLORS.text.secondary} />
      <Text style={styles.emptyStateTitle}>Belum Ada Data Absensi</Text>
      <Text style={styles.emptyStateText}>
        Data absensi untuk 7 hari terakhir belum tersedia
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadWeeklyAttendance}
      >
        <Ionicons name="refresh" size={16} color={COLORS.primary} />
        <Text style={styles.refreshButtonText}>Muat Ulang</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={24} color={COLORS.status.error} />
      <Text style={styles.errorText}>Gagal memuat riwayat absensi</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={loadWeeklyAttendance}
      >
        <Text style={styles.retryButtonText}>Coba Lagi</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.loadingText}>Memuat riwayat absensi...</Text>
    </View>
  );

  const renderHistoryCard = (item: AttendanceItem) => {
    const attendanceType = ATTENDANCE_TYPES[item.category as keyof typeof ATTENDANCE_TYPES] || ATTENDANCE_TYPES.MASUK;
    
    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={styles.historyDateContainer}>
            <Text style={styles.historyDate}>
              {new Date(item.date).toLocaleDateString('id-ID', {
                weekday: 'short',
                day: '2-digit',
                month: 'short'
              })}
            </Text>
            <Text style={styles.historyTime}>{item.time}</Text>
          </View>
          
          <View style={styles.historyStatusContainer}>
            <View style={[styles.historyStatusBadge, { backgroundColor: attendanceType.color }]}>
              <Ionicons name={attendanceType.icon as any} size={16} color="#FFFFFF" />
              <Text style={styles.historyStatusText}>{item.category}</Text>
            </View>
            
            {item.verified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.verifiedText}>Terverifikasi</Text>
              </View>
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="alert-circle" size={16} color="#FF9800" />
                <Text style={styles.unverifiedText}>Belum Verifikasi</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.historyDetails}>
          <View style={styles.historyDetailItem}>
            <Text style={styles.historyDetailLabel}>Durasi</Text>
            <Text style={styles.historyDetailValue}>{item.duration}</Text>
          </View>
          
          {item.endTime !== '-' && (
            <View style={styles.historyDetailItem}>
              <Text style={styles.historyDetailLabel}>Selesai</Text>
              <Text style={styles.historyDetailValue}>{item.endTime}</Text>
            </View>
          )}
          
          <View style={styles.historyDetailItem}>
            <Text style={styles.historyDetailLabel}>Lokasi</Text>
            <Text style={styles.historyDetailValue} numberOfLines={1}>{item.location}</Text>
          </View>
        </View>
      </View>
    );
  };

  const formattedData = useMemo(() => {
    if (!weeklyAttendance?.data || weeklyAttendance.data.length === 0) {
      return [];
    }
    
    const formatted = formatAttendanceForDisplay(weeklyAttendance.data);
    return formatted;
  }, [weeklyAttendance?.data]);

  const renderHistoryList = () => {
    if (formattedData.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <View style={styles.historyList}>
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
          {formattedData.map((item) => (
            <View key={item.id}>
              {renderHistoryCard(item)}
            </View>
          ))}
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
          onPress={loadWeeklyAttendance}
          disabled={weeklyAttendanceLoading}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={weeklyAttendanceLoading ? COLORS.text.secondary : COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
      
      {weeklyAttendanceLoading ? renderLoadingState() : 
       weeklyAttendanceError ? renderErrorState() : 
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
  verifiedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '500' as const,
    marginLeft: 2,
  },
  unverifiedBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  unverifiedText: {
    color: '#FF9800',
    fontSize: 10,
    fontWeight: '500' as const,
    marginLeft: 2,
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
};

export default memo(AttendanceHistory);