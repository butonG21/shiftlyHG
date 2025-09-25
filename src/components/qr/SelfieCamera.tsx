// Selfie Camera Component
// Handles selfie capture for attendance

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface SelfieCameraProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const { width, height } = Dimensions.get('window');

export const SelfieCamera: React.FC<SelfieCameraProps> = ({
  onCapture,
  onClose,
  isSubmitting = false,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isReady, setIsReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const hasPermission = permission?.granted;

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request camera permission. Please try again.'
      );
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || isSubmitting) return;

    try {
      setIsCapturing(true);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(
        'Camera Error',
        'Failed to take picture. Please try again.'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const confirmPicture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const onCameraReady = () => {
    setIsReady(true);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accent.blue} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={COLORS.text.secondary} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            Please grant camera permission to take a selfie for attendance verification.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          {/* Overlay for preview */}
          <View style={styles.previewOverlay}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Review Your Selfie</Text>
            </View>
            
            <View style={styles.previewActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.retakeButton]} 
                onPress={retakePicture}
                disabled={isSubmitting}
              >
                <Ionicons name="camera-outline" size={24} color={COLORS.text.white} />
                <Text style={styles.actionButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.confirmButton]} 
                onPress={confirmPicture}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.text.white} />
                ) : (
                  <Ionicons name="checkmark" size={24} color={COLORS.text.white} />
                )}
                <Text style={styles.actionButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        onCameraReady={onCameraReady}
      >
        <View style={styles.cameraOverlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Take Selfie</Text>
          <View style={styles.headerButton} />
          </View>

          {/* Face guide */}
          <View style={styles.faceGuide}>
            <View style={styles.faceFrame}>
              <View style={[styles.faceCorner, styles.topLeft]} />
              <View style={[styles.faceCorner, styles.topRight]} />
              <View style={[styles.faceCorner, styles.bottomLeft]} />
              <View style={[styles.faceCorner, styles.bottomRight]} />
            </View>
          </View>

          {/* Instructions and capture button */}
          <View style={styles.controls}>
            <Text style={styles.instructionText}>
              Position your face within the frame
            </Text>
            
            <TouchableOpacity
              style={[
                styles.captureButton,
                (!isReady || isCapturing) && styles.captureButtonDisabled
              ]}
              onPress={takePicture}
              disabled={!isReady || isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator size="large" color={COLORS.text.white} />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
            
            {!isReady && (
              <Text style={styles.loadingText}>Preparing camera...</Text>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.white,
  },
  faceGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: width * 0.6,
    height: width * 0.75,
    position: 'relative',
  },
  faceCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.accent.blue,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  instructionText: {
    color: COLORS.text.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.text.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.accent.blue,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent.blue,
  },
  loadingText: {
    color: COLORS.text.white,
    fontSize: 14,
    marginTop: 10,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
  },
  previewHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.white,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: COLORS.status.error,
  },
  confirmButton: {
    backgroundColor: COLORS.status.success,
  },
  actionButtonText: {
    color: COLORS.text.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 18,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: COLORS.accent.blue,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  closeButtonText: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
});