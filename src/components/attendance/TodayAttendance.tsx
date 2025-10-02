import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { ATTENDANCE_TYPES } from '../../constants/attendance';
import AttendanceDetailModal from './AttendanceDetailModal';

// Import the TripReportResponse type from service
import { TripReportResponse } from '../../services/attendanceQRService';

// Use TripReportResponse directly instead of creating a separate interface
type TripReportData = TripReportResponse;

interface CurrentStatus {
  status: string;
  label: string;
  time: string;
  duration: string;
}

interface TodayAttendanceProps {
  currentStep: any;
  isLoading: boolean;
  tripReportData: TripReportData | null;
  tripReportLoading: boolean;
  statusData: any;
  stepInfo: any;
  getCurrentStatus: () => any;
  handleStartScan: () => void;
  resetFlow: () => void;
  navigation: any;
  showError: (message: string) => void;
}

// Interface untuk modal data
interface ModalData {
  type: string;
  time: string;
  address: string;
  image: string;
  date: string;
}

const TodayAttendance: React.FC<TodayAttendanceProps> = ({
  currentStep,
  isLoading,
  tripReportData,
  tripReportLoading,
  statusData,
  stepInfo,
  getCurrentStatus,
  handleStartScan,
  resetFlow,
  navigation,
  showError,
}) => {
  // State untuk modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedModalData, setSelectedModalData] = useState<ModalData | null>(null);

  // Function untuk membuka modal dengan data yang dipilih
  const openModal = (modalData: ModalData) => {
    setSelectedModalData(modalData);
    setModalVisible(true);
  };

  // Function untuk menutup modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedModalData(null);
  };

  const renderCurrentStatusCard = () => {
    const currentStatus = getCurrentStatus() || {
      status: 'MASUK',
      label: 'Belum Absen',
      time: '-',
      duration: '00:00'
    };

    const attendanceType = ATTENDANCE_TYPES[currentStatus.status as keyof typeof ATTENDANCE_TYPES] || ATTENDANCE_TYPES.MASUK;
    
    return (
      <View style={styles.currentStatusCard}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: attendanceType.color }]}>
            <Ionicons name={attendanceType.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.currentStatusLabel}>Status Saat Ini</Text>
            <Text style={[styles.currentStatusValue, { color: attendanceType.color }]}>
              {currentStatus.label}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Durasi Kerja</Text>
            <Text style={styles.metricValue}>{currentStatus.duration}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Waktu Mulai</Text>
            <Text style={styles.metricValue}>{currentStatus.time}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAttendanceCard = (
    title: string,
    time: string,
    address: string,
    date: string,
    icon: string,
    color: string,
    defaultText: string,
    imageUrl?: string
  ) => {
    // Hanya buat card touchable jika ada data waktu (sudah absen)
    const hasData = time !== '00:00:00';
    
    const cardContent = (
      <View style={styles.attendanceCard}>
        <View style={styles.attendanceCardHeader}>
          <View style={[styles.attendanceCardIcon, { backgroundColor: color }]}>
            <Ionicons name={icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.attendanceCardInfo}>
            <Text style={styles.attendanceCardTitle}>{title}</Text>
            <Text style={styles.attendanceCardTime}>
              {hasData ? time : defaultText}
            </Text>
          </View>
          <View style={styles.attendanceCardStatus}>
            {hasData ? (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
            ) : (
              <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
            )}
          </View>
          {hasData && (
            <View style={styles.attendanceCardAction}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.text.secondary} />
            </View>
          )}
        </View>
        {address && (
          <View style={styles.attendanceCardLocation}>
            <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.attendanceCardLocationText} numberOfLines={2}>
              {address}
            </Text>
          </View>
        )}
        <View style={styles.attendanceCardDate}>
          <Text style={styles.attendanceCardDateText}>
            {date || 'Tanggal tidak tersedia'}
          </Text>
        </View>
      </View>
    );

    // Jika ada data, buat card touchable
    if (hasData) {
      return (
        <TouchableOpacity
          onPress={() => {
            const modalData: ModalData = {
              type: title,
              time: time,
              address: address || 'Lokasi tidak tersedia',
              image: imageUrl || '',
              date: date || 'Tanggal tidak tersedia'
            };
            openModal(modalData);
          }}
          activeOpacity={0.7}
        >
          {cardContent}
        </TouchableOpacity>
      );
    }

    // Jika tidak ada data, return card biasa
    return cardContent;
  };

  const renderLocationCard = () => {
    const address = tripReportData?.mset_start_address || 'Lokasi tidak tersedia';
    const hasValidAddress = tripReportData?.mset_start_address && tripReportData.mset_start_address !== 'Lokasi tidak tersedia';

    return (
      <View style={styles.locationContainer}>
        <Text style={styles.locationTitle}>Lokasi Absensi</Text>
        
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Alamat Lengkap</Text>
              <Text style={styles.locationAddress} numberOfLines={3}>
                {address}
              </Text>
            </View>
          </View>
          
          {hasValidAddress && (
            <View style={styles.locationActions}>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => {
                  const encodedAddress = encodeURIComponent(address);
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                  Linking.openURL(url).catch(err => {
                    console.error('Error opening maps:', err);
                    showError('Tidak dapat membuka aplikasi peta');
                  });
                }}
              >
                <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                <Text style={styles.mapButtonText}>Lihat di Peta</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (tripReportLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat data absensi...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Current Status Card */}
      {renderCurrentStatusCard()}

      {/* Attendance Cards */}
      <View style={styles.attendanceCardsContainer}>
        <Text style={styles.attendanceCardsTitle}>Data Absensi Hari Ini</Text>
        
        {/* Clock-in Card */}
        {renderAttendanceCard(
          'Clock In',
          tripReportData?.mset_start_time || '00:00:00',
          tripReportData?.mset_start_address || 'Lokasi tidak tersedia',
          tripReportData?.mset_date || 'Tanggal tidak tersedia',
          'log-in-outline',
          ATTENDANCE_TYPES.MASUK.color,
          'Belum absen',
          tripReportData?.mset_start_image || ''
        )}

        {/* Break-out Card */}
        {renderAttendanceCard(
          'Break Out',
          tripReportData?.mset_break_out_time || '00:00:00',
          tripReportData?.mset_break_out_address || 'Lokasi tidak tersedia',
          tripReportData?.mset_date_breakout || tripReportData?.mset_date || 'Tanggal tidak tersedia',
          'exit-outline',
          ATTENDANCE_TYPES.IZIN.color,
          'Belum istirahat',
          tripReportData?.mset_break_out_image || ''
        )}

        {/* Break-in Card */}
        {renderAttendanceCard(
          'Break In',
          tripReportData?.mset_break_in_time || '00:00:00',
          tripReportData?.mset_break_in_address || 'Lokasi tidak tersedia',
          tripReportData?.mset_date_breakin || tripReportData?.mset_date || 'Tanggal tidak tersedia',
          'enter-outline',
          ATTENDANCE_TYPES.MASUK.color,
          'Belum kembali',
          tripReportData?.mset_break_in_image || ''
        )}

        {/* Clock-out Card */}
        {renderAttendanceCard(
          'Clock Out',
          tripReportData?.mset_end_time || '00:00:00',
          tripReportData?.mset_end_address || 'Lokasi tidak tersedia',
          tripReportData?.mset_date_clockout || tripReportData?.mset_date || 'Tanggal tidak tersedia',
          'log-out-outline',
          ATTENDANCE_TYPES.PULANG.color,
          'Belum pulang',
          tripReportData?.mset_end_image || ''
        )}
      </View>

      {/* Location Display */}
      {renderLocationCard()}

      {/* Attendance Detail Modal */}
      {selectedModalData && (
        <AttendanceDetailModal
          visible={modalVisible}
          onClose={closeModal}
          type={selectedModalData.type}
          time={selectedModalData.time}
          address={selectedModalData.address}
          image={selectedModalData.image}
          date={selectedModalData.date}
        />
      )}
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
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
  currentStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  currentStatusValue: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  statusMetrics: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  attendanceCardsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  attendanceCardsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  attendanceCard: {
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
  attendanceCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  attendanceCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  attendanceCardInfo: {
    flex: 1,
  },
  attendanceCardTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  attendanceCardTime: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
  },
  attendanceCardStatus: {
    marginLeft: 8,
  },
  attendanceCardAction: {
    marginLeft: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  attendanceCardLocation: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attendanceCardLocationText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
    lineHeight: 16,
  },
  attendanceCardDate: {
    marginTop: 8,
    alignItems: 'flex-end' as const,
  },
  attendanceCardDateText: {
    fontSize: 11,
    color: COLORS.text.secondary,
  },
  locationContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  locationActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
  },
  mapButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
  },
  mapButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500' as const,
    marginLeft: 4,
  },

};

export default TodayAttendance;