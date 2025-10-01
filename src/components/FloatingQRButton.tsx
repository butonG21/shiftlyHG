import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

interface FloatingQRButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  currentStep?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const FloatingQRButton: React.FC<FloatingQRButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  currentStep = 'initial',
}) => {
  const getButtonText = () => {
    switch (currentStep) {
      case 'scanning':
        return 'Memindai...';
      case 'validating':
        return 'Memvalidasi...';
      case 'taking_photo':
        return 'Ambil Foto';
      case 'submitting':
        return 'Mengirim...';
      case 'completed':
        return 'Selesai';
      default:
        return 'Pindai QR Code';
    }
  };

  const getButtonIcon = () => {
    switch (currentStep) {
      case 'scanning':
        return 'scan';
      case 'validating':
        return 'checkmark-circle';
      case 'taking_photo':
        return 'camera';
      case 'submitting':
        return 'cloud-upload';
      case 'completed':
        return 'checkmark-done';
      default:
        return 'qr-code';
    }
  };

  const isButtonDisabled = disabled || isLoading || currentStep === 'completed';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isButtonDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isButtonDisabled}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {isLoading ? (
            <ActivityIndicator size="small" color={COLORS.text.white} />
          ) : (
            <Ionicons
              name={getButtonIcon() as any}
              size={28}
              color={COLORS.text.white}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: screenHeight * 0.03, // 3% dari tinggi layar
    right: screenWidth * 0.05, // 5% dari kanan layar
    zIndex: 1000,
    elevation: 1000, // Android
    opacity: 0.9, // Transparansi 50%
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    width: 70, // Ukuran tetap untuk button circular
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.professional.navy,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10, // Android shadow
    borderWidth: 2,
    borderColor: COLORS.text.white,
  },
  buttonDisabled: {
    backgroundColor: COLORS.text.light,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.text.white,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
});