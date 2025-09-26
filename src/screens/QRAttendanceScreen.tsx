// src/screens/QRAttendanceScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import QRCodeScanner from '../components/QRCodeScanner';
import SelfieCamera from '../components/SelfieCamera';
import Snackbar, { useSnackbar } from '../components/Snackbar';
import attendanceQRService, { StatusCheckResponse, TripReportResponse } from '../services/attendanceQRService';

interface QRAttendanceScreenProps {
  navigation: any;
}

type AttendanceStep = 'initial' | 'scanning' | 'validating' | 'taking_photo' | 'submitting' | 'completed';

// Define attendance types with their visual indicators
const ATTENDANCE_TYPES = {
  MASUK: {
    color: '#4CAF50',
    icon: 'log-in-outline',
    label: 'Masuk'
  },
  PULANG: {
    color: '#F44336', 
    icon: 'log-out-outline',
    label: 'Pulang'
  },
  IZIN: {
    color: '#FFC107',
    icon: 'information-circle-outline',
    label: 'Izin'
  }
} as const;

// Mock attendance history data
const attendanceHistory = [
  {
    id: 1,
    date: '2024-01-15',
    time: '08:00',
    endTime: '16:30',
    category: 'MASUK',
    duration: '8:30',
    verified: true,
    location: 'Kantor Pusat Jakarta'
  },
  {
    id: 2,
    date: '2024-01-14',
    time: '08:15',
    endTime: '16:30',
    category: 'MASUK',
    duration: '8:15',
    verified: true,
    location: 'Kantor Pusat Jakarta'
  },
  {
    id: 3,
    date: '2024-01-13',
    time: '09:00',
    endTime: '-',
    category: 'IZIN',
    duration: '0:00',
    verified: false,
    location: 'Sakit'
  },
  {
    id: 4,
    date: '2024-01-12',
    time: '07:45',
    endTime: '16:45',
    category: 'MASUK',
    duration: '9:00',
    verified: true,
    location: 'Kantor Pusat Jakarta'
  },
  {
    id: 5,
    date: '2024-01-11',
    time: '08:30',
    endTime: '17:00',
    category: 'PULANG',
    duration: '8:30',
    verified: true,
    location: 'Kantor Pusat Jakarta'
  }
];

export const QRAttendanceScreen: React.FC<QRAttendanceScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<AttendanceStep>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string>('');
  const [statusData, setStatusData] = useState<StatusCheckResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [tripReportData, setTripReportData] = useState<TripReportResponse | null>(null);
  const [tripReportLoading, setTripReportLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showInfo,
  } = useSnackbar();

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Load trip report data when screen mounts
  useEffect(() => {
    loadTripReport();
  }, []);

  const loadTripReport = async () => {
    console.log('[QR Attendance] Loading trip report data');
    setTripReportLoading(true);
    
    try {
      const tripData = await attendanceQRService.getTripReport();
      setTripReportData(tripData);
      console.log('[QR Attendance] Trip report loaded successfully:', tripData);
    } catch (error) {
      console.error('[QR Attendance] Error loading trip report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data absensi';
      showError(errorMessage);
    } finally {
      setTripReportLoading(false);
    }
  };

  // Helper function to calculate work duration
  const calculateWorkDuration = (startTime: string, endTime?: string): string => {
    if (!startTime || startTime === '00:00:00') return '00:00';
    
    const start = new Date(`2024-01-01 ${startTime}`);
    const end = endTime && endTime !== '00:00:00' 
      ? new Date(`2024-01-01 ${endTime}`)
      : new Date();
    
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}`;
  };

  // Helper function to get current status
  const getCurrentStatus = () => {
    if (!tripReportData) return null;
    
    const { mset_start_time, mset_break_out_time, mset_break_in_time, mset_end_time } = tripReportData;
    
    if (mset_end_time !== '00:00:00') {
      return {
        status: 'PULANG',
        label: 'Sudah Pulang',
        time: mset_end_time,
        duration: calculateWorkDuration(mset_start_time, mset_end_time)
      };
    } else if (mset_break_in_time !== '00:00:00') {
      return {
        status: 'MASUK',
        label: 'Sedang Bekerja',
        time: mset_break_in_time,
        duration: calculateWorkDuration(mset_start_time)
      };
    } else if (mset_break_out_time !== '00:00:00') {
      return {
        status: 'IZIN',
        label: 'Sedang Istirahat',
        time: mset_break_out_time,
        duration: calculateWorkDuration(mset_start_time, mset_break_out_time)
      };
    } else if (mset_start_time !== '00:00:00') {
      return {
        status: 'MASUK',
        label: 'Sedang Bekerja',
        time: mset_start_time,
        duration: calculateWorkDuration(mset_start_time)
      };
    }
    
    return {
      status: 'IZIN',
      label: 'Belum Absen',
      time: '-',
      duration: '00:00'
    };
  };

  const resetFlow = () => {
    console.log('[QR Attendance] Resetting attendance flow');
    setCurrentStep('initial');
    setScannedQRCode('');
    setStatusData(null);
    setCapturedImage('');
    setIsLoading(false);
  };

  const handleStartScan = () => {
    console.log('[QR Attendance] Starting QR scan');
    setCurrentStep('scanning');
  };

  const handleQRScanned = async (qrData: string) => {
    console.log('[QR Attendance] QR code scanned:', qrData);
    setScannedQRCode(qrData);
    setCurrentStep('validating');
    setIsLoading(true);

    try {
      showInfo('Memvalidasi QR code dan lokasi...');

      // Step 1: Validate QR code and location
      const validationResult = await attendanceQRService.validateQRAndLocation(qrData);
      
      if (validationResult.success !== 1) {
        throw new Error(validationResult.message || 'Validasi QR code atau lokasi gagal');
      }

      showInfo('Memeriksa status absensi...');

      // Step 2: Check attendance status
      const statusResult = await attendanceQRService.checkAttendanceStatus();
      
      if (!statusResult.success) {
        throw new Error('Gagal memeriksa status absensi');
      }

      setStatusData(statusResult);
      setCurrentStep('taking_photo');
      setIsLoading(false);
      
      showSuccess('Validasi berhasil! Silakan ambil foto selfie.');
      
    } catch (error) {
      console.error('[QR Attendance] Validation error:', error);
      setIsLoading(false);
      setCurrentStep('initial');
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat validasi';
      showError(errorMessage, {
        label: 'Coba Lagi',
        onPress: handleStartScan,
      });
    }
  };

  const handlePhotoTaken = async (imageUri: string) => {
    console.log('[QR Attendance] Photo taken:', imageUri);
    setCapturedImage(imageUri);
    setCurrentStep('submitting');
    setIsLoading(true);

    try {
      showInfo('Mengirim data absensi...');

      if (!statusData) {
        throw new Error('Data status tidak ditemukan');
      }

      // Step 3: Submit attendance with photo
      const submissionResult = await attendanceQRService.submitAttendanceWithPhoto(
        imageUri,
        scannedQRCode,
        statusData
      );

      if (submissionResult.success !== 1) {
        throw new Error(submissionResult.message || 'Gagal mengirim data absensi');
      }

      setCurrentStep('completed');
      setIsLoading(false);
      
      showSuccess('Absensi berhasil dicatat!', {
        label: 'Selesai',
        onPress: () => {
          resetFlow();
          navigation.goBack();
        },
      });

    } catch (error) {
      console.error('[QR Attendance] Submission error:', error);
      setIsLoading(false);
      setCurrentStep('taking_photo');
      
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim data';
      showError(errorMessage, {
        label: 'Coba Lagi',
        onPress: () => setCurrentStep('taking_photo'),
      });
    }
  };

  const handleCloseScan = () => {
    console.log('[QR Attendance] Closing QR scan');
    setCurrentStep('initial');
  };

  const handleCloseCamera = () => {
    console.log('[QR Attendance] Closing camera');
    setCurrentStep('initial');
    resetFlow();
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'initial':
        return {
          title: 'Absensi QR Code',
          description: 'Pindai QR code untuk melakukan absensi',
          icon: 'qr-code-outline',
        };
      case 'scanning':
        return {
          title: 'Memindai QR Code',
          description: 'Arahkan kamera ke QR code',
          icon: 'camera-outline',
        };
      case 'validating':
        return {
          title: 'Memvalidasi Data',
          description: 'Memeriksa QR code dan lokasi Anda',
          icon: 'shield-checkmark-outline',
        };
      case 'taking_photo':
        return {
          title: 'Ambil Foto Selfie',
          description: 'Ambil foto untuk verifikasi kehadiran',
          icon: 'camera-outline',
        };
      case 'submitting':
        return {
          title: 'Mengirim Data',
          description: 'Menyimpan data absensi Anda',
          icon: 'cloud-upload-outline',
        };
      case 'completed':
        return {
          title: 'Absensi Berhasil',
          description: 'Data absensi telah tersimpan',
          icon: 'checkmark-circle-outline',
        };
      default:
        return {
          title: 'Absensi QR Code',
          description: 'Pindai QR code untuk melakukan absensi',
          icon: 'qr-code-outline',
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Absensi QR Code</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFlow}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step indicator */}
        <View style={styles.stepContainer}>
          <View style={styles.stepIcon}>
            <Ionicons name={stepInfo.icon as any} size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.stepTitle}>{stepInfo.title}</Text>
          <Text style={styles.stepDescription}>{stepInfo.description}</Text>
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
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

        {/* Trip Report Data */}
        {tripReportLoading && (
          <View style={styles.statusCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Memuat data absensi...</Text>
            </View>
          </View>
        )}

        {tripReportData && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Data Absensi Terkini</Text>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Tanggal:</Text>
              <Text style={styles.statusValue}>{tripReportData.mset_date}</Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Jam Masuk:</Text>
              <Text style={styles.statusValue}>
                {tripReportData.mset_start_time !== '00:00:00' ? tripReportData.mset_start_time : '-'}
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Jam Istirahat Keluar:</Text>
              <Text style={styles.statusValue}>
                {tripReportData.mset_break_out_time !== '00:00:00' ? tripReportData.mset_break_out_time : '-'}
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Jam Istirahat Masuk:</Text>
              <Text style={styles.statusValue}>
                {tripReportData.mset_break_in_time !== '00:00:00' ? tripReportData.mset_break_in_time : '-'}
              </Text>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Jam Keluar:</Text>
              <Text style={styles.statusValue}>
                {tripReportData.mset_end_time !== '00:00:00' ? tripReportData.mset_end_time : '-'}
              </Text>
            </View>
            
            {tripReportData.mset_start_address && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Lokasi Masuk:</Text>
                <Text style={[styles.statusValue, styles.addressText]} numberOfLines={2}>
                  {tripReportData.mset_start_address}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Attendance History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Riwayat Absensi</Text>
          <ScrollView 
            style={styles.historyList}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {attendanceHistory.map((item) => {
              const attendanceType = ATTENDANCE_TYPES[item.category as keyof typeof ATTENDANCE_TYPES];
              
              return (
                <View key={item.id} style={styles.historyCard}>
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
                        <Text style={styles.historyStatusText}>{attendanceType.label}</Text>
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
            })}
          </ScrollView>
        </View>

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
                    // Share functionality would go here
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

        {/* Action buttons */}
        {currentStep === 'initial' && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartScan}
              disabled={isLoading}
            >
              <Ionicons name="qr-code" size={24} color={COLORS.text.white} />
              <Text style={styles.primaryButtonText}>Pindai QR Code</Text>
            </TouchableOpacity>
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

        {/* Development mode indicator */}
        {__DEV__ && (
          <View style={styles.devModeContainer}>
            <Text style={styles.devModeText}>🔧 Mode Development</Text>
            <Text style={styles.devModeSubText}>
              Menggunakan data dummy untuk testing
            </Text>
          </View>
        )}
      </ScrollView>

      {/* QR Code Scanner Modal */}
      <QRCodeScanner
        isVisible={currentStep === 'scanning'}
        onScanSuccess={handleQRScanned}
        onClose={handleCloseScan}
      />

      {/* Selfie Camera Modal */}
      <SelfieCamera
        isVisible={currentStep === 'taking_photo'}
        onPhotoTaken={handlePhotoTaken}
        onClose={handleCloseCamera}
        statusDesc={statusData?.status_desc}
      />

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onDismiss={hideSnackbar}
        action={snackbar.action}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.secondary,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    backgroundColor: COLORS.background.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontFamily: 'monospace',
  },
  resetButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent.blue,
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
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  statusCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
  addressText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 18,
  },
  currentStatusCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    backgroundColor: COLORS.border,
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
  historyContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  historyList: {
    maxHeight: 300,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  historyDateContainer: {
    flex: 1,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  historyStatusContainer: {
    alignItems: 'flex-end',
  },
  historyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unverifiedText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 4,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  historyDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  historyDetailLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  historyDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    textAlign: 'center',
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    marginTop: SPACING.lg,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: COLORS.text.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  devModeContainer: {
    backgroundColor: COLORS.status.warning,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  devModeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.white,
  },
  devModeSubText: {
    fontSize: 14,
    color: COLORS.text.white,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default QRAttendanceScreen;