// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  StatusBar 
} from 'react-native';
import { 
  ActivityIndicator, 
  Text 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

import LoginScreen from '../src/screens/LoginScreen';
import HomeScreen from '../src/screens/HomeScreen';
import ScheduleScreen from '../src/screens/ScheduleScreen';
import { useAuth } from '../src/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Schedule: undefined;
  Profile: undefined;
  Settings: undefined;
  LeaveRequest: undefined;
  ShiftSwap: undefined;
  History: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Modern Splash Screen Component with Purple-Blue Gradient
const LoadingScreen: React.FC = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const scale2 = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const dotsOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    // Logo rotation animation (slower and smoother)
    rotation.value = withRepeat(
      withTiming(360, { duration: 4000 }),
      -1,
      false
    );
    
    // Logo scale pulse animation (primary)
    scale.value = withRepeat(
      withTiming(1.4, { duration: 2000 }),
      -1,
      true
    );

    // Secondary pulse animation
    scale2.value = withRepeat(
      withTiming(1.2, { duration: 1800 }),
      -1,
      true
    );

    // Dots animation
    dotsOpacity.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );

    // Entrance animations
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const pulseOpacity = interpolate(
      scale.value,
      [0.8, 1.4],
      [0.8, 0.2]
    );
    
    return {
      opacity: pulseOpacity,
      transform: [{ scale: scale.value }],
    };
  });

  const pulseStyle2 = useAnimatedStyle(() => {
    const pulseOpacity = interpolate(
      scale2.value,
      [1, 1.2],
      [0.6, 0.1]
    );
    
    return {
      opacity: pulseOpacity,
      transform: [{ scale: scale2.value }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const dotsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: dotsOpacity.value,
      transform: [{ scale: dotsOpacity.value }],
    };
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#1e3c72']}
        style={styles.loadingContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Modern Background Pattern */}
        <View style={styles.loadingPattern}>
          <View style={[styles.patternCircle, styles.circle1]} />
          <View style={[styles.patternCircle, styles.circle2]} />
          <View style={[styles.patternCircle, styles.circle3]} />
          <View style={[styles.patternCircle, styles.circle4]} />
        </View>

        {/* Main Loading Content */}
        <Animated.View style={[styles.loadingContent, contentAnimatedStyle]}>
          {/* Animated Logo Container */}
          <View style={styles.logoContainer}>
            {/* Multiple Pulse Backgrounds */}
            <Animated.View style={[styles.pulseBackground2, pulseStyle2]} />
            <Animated.View style={[styles.pulseBackground, pulseStyle]} />
            
            {/* Main Logo with Glass Effect */}
            <Animated.View style={[styles.animatedLogo, logoAnimatedStyle]}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6', '#a855f7']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons 
                  name="calendar-clock" 
                  size={50} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* App Name and Tagline */}
          <View style={styles.textContainer}>
            <Text style={styles.appName}>Shiftly</Text>
            <Text style={styles.appTagline}>Smart Shift Management{"\n"}for Modern Workforce</Text>
            
            {/* Modern Loading Indicator */}
            <View style={styles.loadingIndicatorContainer}>
              <Animated.View style={[styles.loadingDots, dotsAnimatedStyle]}>
                <Animated.View style={[styles.modernDot, styles.dot1]} />
                <Animated.View style={[styles.modernDot, styles.dot2]} />
                <Animated.View style={[styles.modernDot, styles.dot3]} />
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {/* Version Info with Glass Effect */}
        <Animated.View style={[styles.versionContainer, contentAnimatedStyle]}>
          <Text style={styles.versionText}>Version 2.1.0</Text>
          <Text style={styles.companyText}>© 2024 Shiftly Team</Text>
        </Animated.View>
      </LinearGradient>
    </>
  );
};

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Navigation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <LinearGradient
          colors={['#00425A', '#005C7A']}
          style={styles.errorContainer}
        >
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={64} 
            color="#FF5252" 
          />
          <Text style={styles.errorTitle}>Terjadi Kesalahan</Text>
          <Text style={styles.errorMessage}>
            Aplikasi mengalami masalah. Silakan tutup dan buka kembali aplikasi.
          </Text>
          <Text style={styles.errorDetail}>
            {this.state.error?.message}
          </Text>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
}

const AppNavigator: React.FC = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        {isAuthenticated && user ? (
          // Authenticated stack
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                animation: 'fade',
              }}
            />
            {/* Add other authenticated screens here */}
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right',
              }}
            />
            {/*
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Profil',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#00425A',
                },
                headerTitleStyle: {
                  color: '#FFFFFF',
                  fontWeight: '700',
                },
                headerTintColor: '#FFFFFF',
              }}
            />
            */}
          </>
        ) : (
          // Unauthenticated stack
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animation: 'fade',
            }}
          />
        )}
      </Stack.Navigator>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -150,
    right: -150,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -100,
    left: -100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  circle3: {
    width: 150,
    height: 150,
    top: '20%',
    right: '15%',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  circle4: {
    width: 100,
    height: 100,
    bottom: '30%',
    left: '10%',
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  pulseBackground: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  pulseBackground2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  animatedLogo: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingIndicatorContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  modernDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  dot1: {
    opacity: 1,
    backgroundColor: '#6366f1',
  },
  dot2: {
    opacity: 0.7,
    backgroundColor: '#8b5cf6',
  },
  dot3: {
    opacity: 0.5,
    backgroundColor: '#a855f7',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  companyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  errorDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default AppNavigator;