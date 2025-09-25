// src/components/Snackbar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  type,
  duration = 4000,
  onDismiss,
  action,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        hideSnackbar();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideSnackbar();
    }
  }, [visible, duration]);

  const hideSnackbar = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getSnackbarStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: COLORS.status.success,
          iconName: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          backgroundColor: COLORS.status.error,
          iconName: 'alert-circle' as const,
        };
      case 'warning':
        return {
          backgroundColor: COLORS.status.warning,
          iconName: 'warning' as const,
        };
      case 'info':
        return {
          backgroundColor: COLORS.status.info,
          iconName: 'information-circle' as const,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          iconName: 'information-circle' as const,
        };
    }
  };

  const snackbarStyle = getSnackbarStyle();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: snackbarStyle.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={snackbarStyle.iconName}
          size={24}
          color={COLORS.text.white}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        
        {action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideSnackbar}
        >
          <Ionicons name="close" size={20} color={COLORS.text.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Hook for managing snackbar state
export const useSnackbar = () => {
  const [snackbar, setSnackbar] = React.useState<{
    visible: boolean;
    message: string;
    type: SnackbarType;
    action?: {
      label: string;
      onPress: () => void;
    };
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showSnackbar = (
    message: string,
    type: SnackbarType = 'info',
    action?: {
      label: string;
      onPress: () => void;
    }
  ) => {
    setSnackbar({
      visible: true,
      message,
      type,
      action,
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const showSuccess = (message: string, action?: { label: string; onPress: () => void }) => {
    showSnackbar(message, 'success', action);
  };

  const showError = (message: string, action?: { label: string; onPress: () => void }) => {
    showSnackbar(message, 'error', action);
  };

  const showWarning = (message: string, action?: { label: string; onPress: () => void }) => {
    showSnackbar(message, 'warning', action);
  };

  const showInfo = (message: string, action?: { label: string; onPress: () => void }) => {
    showSnackbar(message, 'info', action);
  };

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: 56,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  message: {
    flex: 1,
    color: COLORS.text.white,
    fontSize: 16,
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    color: COLORS.text.white,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
});

export default Snackbar;