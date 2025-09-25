// QR Attendance Screen
// Main screen that orchestrates the complete QR attendance flow

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { QRScanner } from '../components/qr/QRScanner';
import { SelfieCamera } from '../components/qr/SelfieCamera';
import { getLocationForAttendance, reverseGeocode } from '../services/locationService';
import { useAuthUser } from '../contexts/AuthContext';
import {
  validateLocation,
  checkAttendanceStatus,
  submitAttendance,
  generateImageFilename,
  type StatusCheckResponse,
} from '../services/qrAttendanceService';
import { COLORS } from '../constants/colors';

type AttendanceStep = 'qr_scan' | 'validating' | 'selfie' | 'submitting' | 'success';

interface QRAttendanceScreenProps {
  navigation: any;
}

export const QRAttendanceScreen: React.FC<QRAttendanceScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<AttendanceStep>('qr_scan');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [locationData, setLocationData] = useState<{ latitude: string; longitude: string } | null>(null);
  const [statusData, setStatusData] = useState<StatusCheckResponse | null>(null);
  const user = useAuthUser();
  
  // 🧪 TESTING MODE - TEMPORARY MODIFICATION
  // TODO: REMOVE THIS AFTER TESTING - ROLLBACK TO ORIGINAL
  const TESTING_MODE = true; // Set to false to use real user ID
  const DUMMY_USER_ID = '12345'; // Dummy user ID for testing
  const userId = TESTING_MODE ? DUMMY_USER_ID : (user?.uid || '');
  
  // Log untuk memastikan user ID yang digunakan
  console.log('🧪 TESTING MODE:', TESTING_MODE ? 'ENABLED' : 'DISABLED');
  console.log('👤 Using User ID:', userId, TESTING_MODE ? '(DUMMY)' : '(REAL)');

  // Handle back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentStep === 'qr_scan') {
          navigation.goBack();
          return true;
        } else if (currentStep === 'validating' || currentStep === 'submitting') {
          // Prevent back during API calls
          return true;
        } else {
          // Allow going back to QR scan for other steps
          setCurrentStep('qr_scan');
          return true;
        }
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentStep, navigation])
  );

  const showError = (message: string) => {
    Alert.alert('Error', message, [
      {
        text: 'Try Again',
        onPress: () => setCurrentStep('qr_scan'),
      },
      {
        text: 'Cancel',
        onPress: () => navigation.goBack(),
        style: 'cancel',
      },
    ]);
  };

  const showSuccess = () => {
    Alert.alert(
      'Attendance Recorded',
      'Your attendance has been successfully recorded!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleQRScanSuccess = async (data: string) => {
    console.log('QR Code scanned:', data);
    setScannedData(data);
    setCurrentStep('validating');
    setIsLoading(true);

    try {
      // Step 1: Get user location
      console.log('Getting user location...');
      const location = await getLocationForAttendance();
      setLocationData(location);
      console.log('Location obtained:', location);

      // Step 2: Validate location and QR code
      console.log('Validating location and QR code...');
      const validationResult = await validateLocation({
        process_stats: 0,
        latitude: location.latitude,
        barcode: data,
        userid: userId,
        longitude: location.longitude,
      });

      console.log('Validation result:', validationResult);

      if (validationResult.success !== 1) {
        throw new Error(validationResult.message || 'Location validation failed');
      }

      // Step 3: Check attendance status
      console.log('Checking attendance status...');
      const statusResult = await checkAttendanceStatus(userId);
      console.log('Status result:', statusResult);

      if (!statusResult.success) {
        throw new Error('Status check failed');
      }

      setStatusData(statusResult);
      setCurrentStep('selfie');
    } catch (error) {
      console.error('QR attendance validation error:', error);
      showError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelfieCapture = async (imageUri: string) => {
    // Comprehensive validation of required data
    if (!locationData || !statusData) {
      showError('Missing required data. Please try again.');
      return;
    }

    if (!imageUri || typeof imageUri !== 'string') {
      showError('Invalid selfie image. Please try again.');
      return;
    }

    if (!scannedData || !userId) {
      showError('Missing QR code or user data. Please try again.');
      return;
    }

    setIsLoading(true);
    setCurrentStep('submitting');

    try {
      console.log('Preparing selfie submission...', {
        hasLocationData: !!locationData,
        hasStatusData: !!statusData,
        hasImageUri: !!imageUri,
        hasScannedData: !!scannedData,
        hasUserId: !!userId
      });
      
      // Validate mset_code (SKIPPED FOR DEVELOPMENT)
      console.log('🔍 Validating mset_code...');
      // DEVELOPMENT MODE: Skip mset_code validation
      if (!statusData.mset_code || statusData.mset_code.trim() === '') {
        console.warn('⚠️ mset_code is empty/invalid, but continuing for development purposes');
        // Use fallback mset_code for development
        statusData.mset_code = '12345';
      }
      console.log('✅ mset_code processed (dev mode):', statusData.mset_code);
      
      // Get address from coordinates
      console.log('🗺️ Getting address from coordinates...');
      let address = '';
      try {
        address = await reverseGeocode(locationData.latitude, locationData.longitude);
        console.log('✅ Address obtained:', address);
      } catch (geocodeError) {
        console.warn('⚠️ Reverse geocoding failed, using fallback address:', geocodeError);
        address = `Lat: ${locationData.latitude}, Lng: ${locationData.longitude}`;
      }
      
      // Convert image URI to blob with error handling
      console.log('📸 Converting image URI to blob:', imageUri);
      let blob: Blob;
      try {
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        blob = await response.blob();
        console.log('✅ Image converted to blob successfully:', {
          size: blob.size,
          type: blob.type
        });
      } catch (imageError) {
        console.error('❌ Image conversion error:', imageError);
        throw new Error(`Failed to process selfie image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
      }
      
      const filename = generateImageFilename();
      console.log('Generated filename:', filename);

      // Submit attendance with selfie
      console.log('Submitting attendance...');
      const submissionResult = await submitAttendance({
        image: blob,
        filename,
        mset_code: statusData.mset_code,
        barcode: scannedData,
        userid: userId,
        longitude: locationData.longitude,
        latitude: locationData.latitude,
        status: statusData.status,
        address: address,
      });

      console.log('Submission result:', submissionResult);

      if (submissionResult.success !== 1) {
        throw new Error(submissionResult.message || 'Attendance submission failed');
      }

      setCurrentStep('success');
      showSuccess();
    } catch (error) {
      console.error('Selfie submission error:', error);
      showError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (currentStep === 'validating' || currentStep === 'submitting') {
      // Prevent closing during API calls
      return;
    }
    navigation.goBack();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'qr_scan':
      case 'validating':
        return (
          <QRScanner
            onScanSuccess={handleQRScanSuccess}
            onClose={handleClose}
            isLoading={isLoading}
          />
        );
      
      case 'selfie':
      case 'submitting':
        return (
          <SelfieCamera
            onCapture={handleSelfieCapture}
            onClose={handleClose}
            isSubmitting={isLoading}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background.primary} />
      {renderCurrentStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
});