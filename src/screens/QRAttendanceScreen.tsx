// src/screens/QRAttendanceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import QRCodeScanner from '../components/QRCodeScanner';
import SelfieCamera from '../components/SelfieCamera';
import Snackbar, { useSnackbar } from '../components/Snackbar';
import attendanceQRService, { StatusCheckResponse } from '../services/attendanceQRService';

interface QRAttendanceScreenProps {
  navigation: any;
}

type AttendanceStep = 'initial' | 'scanning' | 'validating' | 'taking_photo' | 'submitting' | 'completed';

export const QRAttendanceScreen: React.FC<QRAttendanceScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<AttendanceStep>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedQRCode, setScannedQRCode] = useState<string>('');
  const [statusData, setStatusData] = useState<StatusCheckResponse | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>('');
  
  const {
    snackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showInfo,
  } = useSnackbar();

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
        <Text style={styles.headerTitle}>Absensi QR Code</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
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