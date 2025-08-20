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

// Enhanced Loading Screen Component
const LoadingScreen: React.FC = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const pulseStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scale.value,
      [1, 1.1],
      [0.3, 0.1]
    );
    
    return {
      opacity,
      transform: [{ scale: scale.value * 3 }],
    };
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#00425A" />
      <LinearGradient
        colors={['#00425A', '#005C7A', '#007B9A']}
        style={styles.loadingContainer}
      >
        {/* Background Pattern */}
        <View style={styles.loadingPattern}>
          <View style={[styles.patternCircle, styles.circle1]} />
          <View style={[styles.patternCircle, styles.circle2]} />
          <View style={[styles.patternCircle, styles.circle3]} />
        </View>

        {/* Main Loading Content */}
        <View style={styles.loadingContent}>
          {/* Animated Logo Container */}
          <View style={styles.logoContainer}>
            {/* Pulse Background */}
            <Animated.View style={[styles.pulseBackground, pulseStyle]} />
            
            {/* Main Logo */}
            <Animated.View style={[styles.animatedLogo, animatedStyle]}>
              <LinearGradient
                colors={['#F9B233', '#FFD700', '#FFA500']}
                style={styles.logoGradient}
              >
                <MaterialCommunityIcons 
                  name="calendar-clock" 
                  size={48} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* App Name and Loading Text */}
          <View style={styles.textContainer}>
            <Text style={styles.appName}>Shiftly</Text>
            <Text style={styles.loadingSubtitle}>Memuat aplikasi...</Text>
            
            {/* Loading Indicator */}
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator 
                size="small" 
                color="#F9B233" 
                style={styles.loadingIndicator}
              />
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.companyText}>PT. Company Name</Text>
        </View>
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
            {/*
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{
                title: 'Jadwal',
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
    borderRadius: 100,
    backgroundColor: 'rgba(249, 178, 51, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle3: {
    width: 100,
    height: 100,
    top: '30%',
    right: '20%',
    backgroundColor: 'rgba(249, 178, 51, 0.08)',
  },
  loadingContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pulseBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9B233',
  },
  animatedLogo: {
    shadowColor: '#F9B233',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 2,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 24,
  },
  loadingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: 12,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F9B233',
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 0.4,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  companyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 4,
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