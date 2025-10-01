import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Constants
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { ATTENDANCE_TYPES } from '../constants/attendance';

// Components
import { QRCodeScanner } from '../components/QRCodeScanner';
import { SelfieCamera } from '../components/SelfieCamera';
import { Snackbar } from '../components/Snackbar';
import { FloatingQRButton } from '../components/FloatingQRButton';
import TodayAttendance from '../components/attendance/TodayAttendance';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import TimeDisplay from '../components/TimeDisplay';

// Services
import attendanceQRService, { TripReportResponse } from '../services/attendanceQRService';

// Hooks
import useAttendance from '../hooks/useAttendance';
import { useSnackbar } from '../components/Snackbar';

// Types
import { AttendanceRecord } from '../types/attendance';

interface QRAttendanceScreenProps {
  navigation: any;
}

type AttendanceStep = 'initial' | 'scanning' | 'validating' | 'taking_photo' | 'submitting' | 'completed';

interface StatusCheckResponse {
  success: boolean;
  mset_code: string;
  date: string;
  status: string;
  status_desc: string;
}





// Helper functions
const mapAttendanceType = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'clock_in': 'MASUK',
    'break_out': 'IZIN',
    'break_in': 'MASUK',
    'clock_out': 'PULANG',
  };
  return typeMap[type] || 'MASUK';
};

const formatAttendanceForDisplay = (record: AttendanceRecord) => {
    return {
      ...record,
      type: mapAttendanceType(record.type || 'MASUK'),
      time: record.time || '00:00',
      location: record.location || 'Lokasi tidak tersedia',
    };
  };

const calculateDuration = (startTime: string, endTime?: string): string => {
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

export const QRAttendanceScreen: React.FC<QRAttendanceScreenProps> = ({ navigation }) => {
  const layout = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState<AttendanceStep>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string>('');
  const [statusData, setStatusData] = useState<StatusCheckResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [tripReportData, setTripReportData] = useState<TripReportResponse | null>(null);
  const [tripReportLoading, setTripReportLoading] = useState<boolean>(false);

  
  // Tab navigation state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'today', title: 'Absen Hari Ini' },
    { key: 'history', title: 'Riwayat Absensi' },
  ]);
  
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showInfo,
  } = useSnackbar();

  const {
    weeklyAttendance,
    weeklyLoading,
    weeklyError,
    loadWeeklyAttendance,
  } = useAttendance();

  // Load trip report data on component mount
  useEffect(() => {
    loadTripReport();
  }, []);

  // Load weekly attendance data
  useEffect(() => {
    loadWeeklyAttendance();
  }, [loadWeeklyAttendance]);

  const loadTripReport = async () => {
    setTripReportLoading(true);
    try {
      const response = await attendanceQRService.getTripReport();
      if (response.success) {
        setTripReportData(response);
      } else {
        console.log('[QR Attendance] No trip report data available');
      }
    } catch (error) {
      console.error('[QR Attendance] Error loading trip report:', error);
      if (error instanceof Error && error.message.includes('401')) {
        showError('Silakan login ulang untuk memuat data absensi');
      }
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

      showInfo('Silakan ambil foto selfie untuk verifikasi');

    } catch (error) {
      console.error('[QR Attendance] Error during QR scan process:', error);
      setIsLoading(false);
      setCurrentStep('initial');
      
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError('Terjadi kesalahan saat memproses QR code');
      }
    }
  };

  const handleCloseScan = () => {
    console.log('[QR Attendance] Closing QR scan');
    setCurrentStep('initial');
  };

  const handlePhotoTaken = async (imageUri: string) => {
    console.log('[QR Attendance] Photo taken:', imageUri);
    setCapturedImage(imageUri);
    setCurrentStep('submitting');
    setIsLoading(true);

    try {
      showInfo('Mengirim data absensi...');

      const submitResult = await attendanceQRService.submitAttendanceWithPhoto(
        imageUri,
        scannedQRCode,
        statusData!
      );

      if (!submitResult.success) {
        throw new Error(submitResult.message || 'Gagal mengirim data absensi');
      }

      setCurrentStep('completed');
      setIsLoading(false);
      showSuccess('Absensi berhasil disimpan!');

      // Reload trip report to get updated data
      setTimeout(() => {
        loadTripReport();
      }, 1000);

    } catch (error) {
      console.error('[QR Attendance] Error submitting attendance:', error);
      setIsLoading(false);
      setCurrentStep('initial');
      
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError('Terjadi kesalahan saat mengirim data absensi');
      }
    }
  };

  const handleCloseCamera = () => {
    console.log('[QR Attendance] Closing camera');
    setCurrentStep('initial');
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 'scanning':
        return {
          title: 'Pindai QR Code',
          description: 'Arahkan kamera ke QR code absensi',
          icon: 'qr-code-outline',
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

  // Scene map for tab navigation
  const renderScene = SceneMap({
    today: () => (
      <TodayAttendance
        currentStep={currentStep}
        isLoading={isLoading}
        tripReportData={tripReportData}
        tripReportLoading={tripReportLoading}
        statusData={statusData}
        stepInfo={stepInfo}
        getCurrentStatus={getCurrentStatus}
        handleStartScan={handleStartScan}
        resetFlow={resetFlow}
        navigation={navigation}
        showError={showError}
      />
    ),
    history: () => (
      <AttendanceHistory
        weeklyAttendance={weeklyAttendance}
        weeklyAttendanceLoading={weeklyLoading}
        weeklyAttendanceError={weeklyError}
        loadWeeklyAttendance={loadWeeklyAttendance}
      />
    ),
  });

  // Custom tab bar
  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: COLORS.primary }}
      style={{ backgroundColor: COLORS.background.primary }}
      labelStyle={{
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'none',
      }}
      activeColor={COLORS.primary}
      inactiveColor={COLORS.text.secondary}
    />
  );

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background.primary}
        translucent={false}
      />
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
          <TimeDisplay style={styles.timeContainer} textStyle={styles.timeText} />
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFlow}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={styles.tabView}
        lazy={true}
        swipeEnabled={false}
        animationEnabled={false}
      />

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

      {/* Floating QR Button */}
      <FloatingQRButton
        onPress={handleStartScan}
        isLoading={isLoading}
        disabled={currentStep === 'scanning' || currentStep === 'taking_photo'}
        currentStep={currentStep}
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.secondary,
    backgroundColor: COLORS.background.primary,
    elevation: 2,
    shadowColor: COLORS.professional.navy,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  tabView: {
    flex: 1,
  },
});