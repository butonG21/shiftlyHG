import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { SPACING } from '../constants';

interface TodayAttendanceProps {
  currentStep: string;
  isLoading: boolean;
  tripReportData: any;
  tripReportLoading: boolean;
  statusData: any;
  stepInfo: any;
  getCurrentStatus: () => any;
  handleStartScan: () => void;
  resetFlow: () => void;
  navigation: any;
  showError: (message: string) => void;
}

const ATTENDANCE_TYPES = {
  MASUK: { color: COLORS.status.success, icon: 'log-in-outline' },
  IZIN: { color: COLORS.status.warning, icon: 'time-outline' },
  PULANG: { color: COLORS.status.info, icon: 'log-out-outline' },
  SAKIT: { color: COLORS.status.error, icon: 'medical-outline' },
};

export const TodayAttendance: React.FC<TodayAttendanceProps> = ({
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
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Step Information */}
      <View style={styles.stepContainer}>
        <View style={styles.stepIcon}>
          <Ionicons name={stepInfo.icon as any} size={40} color={COLORS.text.white} />
        </View>
        <Text style={styles.stepTitle}>{stepInfo.title}</Text>
        <Text style={styles.stepDescription}>{stepInfo.description}</Text>
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memproses...</Text>
          </View>
        )}
      </View>

      {/* Current Status Card */}
      {tripReportData && (
        <View style={styles.currentStatusCard}>
          {(() => {
            const currentStatus = getCurrentStatus();
            if (!currentStatus) return null;
            
            const attendanceType = ATTENDANCE_TYPES[currentStatus.status as keyof typeof ATTENDANCE_TYPES];
            
            return (
              <>
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
              </>
            );
          })()}
        </View>
      )}

      {/* Attendance Cards */}
      {tripReportLoading && (
        <View style={styles.statusCard}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Memuat data absensi...</Text>
          </View>
        </View>
      )}

      {tripReportData && (
        <View style={styles.attendanceCardsContainer}>
          <Text style={styles.attendanceCardsTitle}>Data Absensi Hari Ini</Text>
          
          {/* Clock-in Card */}
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceCardHeader}>
              <View style={[styles.attendanceCardIcon, { backgroundColor: ATTENDANCE_TYPES.MASUK.color }]}>
                <Ionicons name="log-in-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.attendanceCardInfo}>
                <Text style={styles.attendanceCardTitle}>Jam Masuk</Text>
                <Text style={styles.attendanceCardTime}>
                  {tripReportData.mset_start_time !== '00:00:00' ? tripReportData.mset_start_time : 'Belum absen'}
                </Text>
              </View>
              <View style={styles.attendanceCardStatus}>
                {tripReportData.mset_start_time !== '00:00:00' ? (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
                ) : (
                  <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                )}
              </View>
            </View>
            {tripReportData.mset_start_address && (
              <View style={styles.attendanceCardLocation}>
                <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.attendanceCardLocationText} numberOfLines={2}>
                  {tripReportData.mset_start_address}
                </Text>
              </View>
            )}
            <View style={styles.attendanceCardDate}>
              <Text style={styles.attendanceCardDateText}>
                {tripReportData.mset_date || 'Tanggal tidak tersedia'}
              </Text>
            </View>
          </View>

          {/* Break-out Card */}
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceCardHeader}>
              <View style={[styles.attendanceCardIcon, { backgroundColor: ATTENDANCE_TYPES.IZIN.color }]}>
                <Ionicons name="exit-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.attendanceCardInfo}>
                <Text style={styles.attendanceCardTitle}>Break Out</Text>
                <Text style={styles.attendanceCardTime}>
                  {tripReportData.mset_break_out_time !== '00:00:00' ? tripReportData.mset_break_out_time : 'Belum istirahat'}
                </Text>
              </View>
              <View style={styles.attendanceCardStatus}>
                {tripReportData.mset_break_out_time !== '00:00:00' ? (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
                ) : (
                  <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                )}
              </View>
            </View>
            {tripReportData.mset_break_out_address && (
              <View style={styles.attendanceCardLocation}>
                <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.attendanceCardLocationText} numberOfLines={2}>
                  {tripReportData.mset_break_out_address}
                </Text>
              </View>
            )}
            <View style={styles.attendanceCardDate}>
              <Text style={styles.attendanceCardDateText}>
                {tripReportData.mset_date_breakout || tripReportData.mset_date || 'Tanggal tidak tersedia'}
              </Text>
            </View>
          </View>

          {/* Break-in Card */}
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceCardHeader}>
              <View style={[styles.attendanceCardIcon, { backgroundColor: ATTENDANCE_TYPES.MASUK.color }]}>
                <Ionicons name="enter-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.attendanceCardInfo}>
                <Text style={styles.attendanceCardTitle}>Istirahat Masuk</Text>
                <Text style={styles.attendanceCardTime}>
                  {tripReportData.mset_break_in_time !== '00:00:00' ? tripReportData.mset_break_in_time : 'Belum kembali'}
                </Text>
              </View>
              <View style={styles.attendanceCardStatus}>
                {tripReportData.mset_break_in_time !== '00:00:00' ? (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
                ) : (
                  <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                )}
              </View>
            </View>
            {tripReportData.mset_break_in_address && (
              <View style={styles.attendanceCardLocation}>
                <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.attendanceCardLocationText} numberOfLines={2}>
                  {tripReportData.mset_break_in_address}
                </Text>
              </View>
            )}
            <View style={styles.attendanceCardDate}>
              <Text style={styles.attendanceCardDateText}>
                {tripReportData.mset_date_breakin || tripReportData.mset_date || 'Tanggal tidak tersedia'}
              </Text>
            </View>
          </View>

          {/* Clock-out Card */}
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceCardHeader}>
              <View style={[styles.attendanceCardIcon, { backgroundColor: ATTENDANCE_TYPES.PULANG.color }]}>
                <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.attendanceCardInfo}>
                <Text style={styles.attendanceCardTitle}>Jam Keluar</Text>
                <Text style={styles.attendanceCardTime}>
                  {tripReportData.mset_end_time !== '00:00:00' ? tripReportData.mset_end_time : 'Belum pulang'}
                </Text>
              </View>
              <View style={styles.attendanceCardStatus}>
                {tripReportData.mset_end_time !== '00:00:00' ? (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.status.success} />
                ) : (
                  <Ionicons name="time-outline" size={20} color={COLORS.text.secondary} />
                )}
              </View>
            </View>
            {tripReportData.mset_end_address && (
              <View style={styles.attendanceCardLocation}>
                <Ionicons name="location-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.attendanceCardLocationText} numberOfLines={2}>
                  {tripReportData.mset_end_address}
                </Text>
              </View>
            )}
            <View style={styles.attendanceCardDate}>
              <Text style={styles.attendanceCardDateText}>
                {tripReportData.mset_date_end || tripReportData.mset_date || 'Tanggal tidak tersedia'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Location Display */}
      {tripReportData && tripReportData.mset_start_address && (
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
                  {tripReportData.mset_start_address}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationActions}>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => {
                  const address = encodeURIComponent(tripReportData.mset_start_address);
                  const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
                  Linking.openURL(url).catch(err => {
                    console.error('Error opening maps:', err);
                    showError('Tidak dapat membuka aplikasi peta');
                  });
                }}
              >
                <Ionicons name="map" size={20} color={COLORS.text.white} />
                <Text style={styles.mapButtonText}>Buka di Peta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => {
                  const address = tripReportData.mset_start_address;
                  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                  console.log('Share location:', url);
                }}
              >
                <Ionicons name="share" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Mini Map Placeholder */}
            <View style={styles.miniMapContainer}>
              <View style={styles.miniMapPlaceholder}>
                <Ionicons name="map-outline" size={48} color={COLORS.text.secondary} />
                <Text style={styles.miniMapText}>Peta Mini</Text>
                <Text style={styles.miniMapSubtext}>Ketuk "Buka di Peta" untuk melihat lokasi lengkap</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Status information */}
      {statusData && (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Informasi Absensi</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Tanggal:</Text>
            <Text style={styles.statusValue}>{statusData.date}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.statusValue}>{statusData.status_desc}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Kode:</Text>
            <Text style={styles.statusValue}>{statusData.mset_code}</Text>
          </View>
        </View>
      )}



      {currentStep === 'completed' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.successButton}
            onPress={() => {
              resetFlow();
              navigation.goBack();
            }}
          >
            <Ionicons name="checkmark" size={24} color={COLORS.text.white} />
            <Text style={styles.primaryButtonText}>Selesai</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  stepContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  currentStatusCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statusInfo: {
    flex: 1,
  },
  currentStatusLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  currentStatusValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.background.secondary,
    marginHorizontal: SPACING.md,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  statusCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  attendanceCardsContainer: {
    marginBottom: SPACING.lg,
  },
  attendanceCardsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  attendanceCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  attendanceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  attendanceCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  attendanceCardInfo: {
    flex: 1,
  },
  attendanceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  attendanceCardTime: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  attendanceCardStatus: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceCardLocation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
    paddingLeft: 60,
  },
  attendanceCardLocationText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  attendanceCardDate: {
    paddingLeft: 60,
  },
  attendanceCardDateText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  locationContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  locationCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.white,
    marginLeft: 6,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMapContainer: {
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.background.primary,
  },
  miniMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${COLORS.text.secondary}10`,
  },
  miniMapText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  miniMapSubtext: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.md,
  },
  actionContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.status.success,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: COLORS.text.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});