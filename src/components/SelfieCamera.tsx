// src/components/SelfieCamera.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

interface SelfieCameraProps {
  onPhotoTaken: (imageUri: string) => void;
  onClose: () => void;
  isVisible: boolean;
  statusDesc?: string;
}

export const SelfieCamera: React.FC<SelfieCameraProps> = ({
  onPhotoTaken,
  onClose,
  isVisible,
  statusDesc = 'Attendance',
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  React.useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    try {
      console.log('[Selfie Camera] Requesting camera permissions');
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      console.log('[Selfie Camera] Camera permission status:', status);
    } catch (error) {
      console.error('[Selfie Camera] Error requesting camera permissions:', error);
      setHasPermission(false);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      console.log('[Selfie Camera] Taking picture');
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo?.uri) {
        console.log('[Selfie Camera] Picture taken successfully:', photo.uri);
        setCapturedImage(photo.uri);
      } else {
        throw new Error('Failed to capture image');
      }
    } catch (error) {
      console.error('[Selfie Camera] Error taking picture:', error);
      Alert.alert(
        'Error',
        'Gagal mengambil foto. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePicture = () => {
    console.log('[Selfie Camera] Retaking picture');
    setCapturedImage(null);
  };

  const confirmPicture = () => {
    if (capturedImage) {
      console.log('[Selfie Camera] Confirming picture:', capturedImage);
      onPhotoTaken(capturedImage);
    }
  };

  const handleClose = () => {
    console.log('[Selfie Camera] Closing camera');
    setCapturedImage(null);
    onClose();
  };

  if (!isVisible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Meminta izin kamera...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Ionicons name="camera-outline" size={64} color={COLORS.status.error} />
          <Text style={styles.messageText}>Izin kamera diperlukan</Text>
          <Text style={styles.subMessageText}>
            Silakan berikan izin kamera untuk mengambil foto selfie
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={getCameraPermissions}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show captured image preview
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={COLORS.text.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Preview Foto</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Image preview */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <Ionicons name="camera-reverse" size={24} color={COLORS.text.white} />
              <Text style={styles.buttonText}>Ambil Ulang</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={confirmPicture}>
              <Ionicons name="checkmark" size={24} color={COLORS.text.white} />
              <Text style={styles.buttonText}>Gunakan Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={COLORS.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Foto Selfie</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Face guide overlay */}
        <View style={styles.overlay}>
          <View style={styles.faceGuide}>
            <View style={styles.faceFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </View>

        {/* Status info */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusDesc}</Text>
          <Text style={styles.instructionsText}>
            Posisikan wajah Anda di dalam frame
          </Text>
        </View>

        {/* Capture button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner}>
              {isCapturing ? (
                <Ionicons name="hourglass" size={32} color={COLORS.text.white} />
              ) : (
                <Ionicons name="camera" size={32} color={COLORS.text.white} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background.primary,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  subMessageText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.lg,
  },
  retryButtonText: {
    color: COLORS.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.text.white,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 200,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 15,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 15,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 15,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 15,
  },
  statusContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  instructionsText: {
    color: COLORS.text.white,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.text.white,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  previewImage: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 50,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.error,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.text.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default SelfieCamera;