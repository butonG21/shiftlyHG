const { width, height } = Dimensions.get('window');

// screens/LoginScreen.tsx - FIXED VERSION NO SCROLLING
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
  Text,
  TextInput as RNTextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';

// Custom Text Component to avoid Paper conflicts
const CustomText: React.FC<{ style?: any; children: React.ReactNode; numberOfLines?: number }> = ({ 
  style, 
  children, 
  numberOfLines 
}) => (
  <Text style={style} numberOfLines={numberOfLines}>
    {children}
  </Text>
);

// Custom Snackbar Component
const CustomSnackbar: React.FC<{
  visible: boolean;
  message: string;
  onDismiss: () => void;
  type?: 'error' | 'success' | 'warning';
}> = ({ visible, message, onDismiss, type = 'error' }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Animate in
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 5 seconds
      timeoutRef.current = setTimeout(() => {
        onDismiss();
      }, 5000);
    } else {
      // Animate out
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, onDismiss]);

  if (!visible && !isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'error': return '#FF5252';
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      default: return '#FF5252';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error': return 'alert-circle';
      case 'success': return 'check-circle';
      case 'warning': return 'alert';
      default: return 'alert-circle';
    }
  };

  return (
    <Animated.View
      style={[
        styles.customSnackbar,
        {
          backgroundColor: getBackgroundColor(),
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
          opacity: animatedValue,
        },
      ]}
    >
      <MaterialCommunityIcons 
        name={getIcon()} 
        size={18} 
        color="#FFFFFF" 
        style={styles.snackbarIcon}
      />
      <CustomText style={styles.customSnackbarText} numberOfLines={2}>
        {message}
      </CustomText>
      <TouchableOpacity onPress={onDismiss} style={styles.snackbarCloseButton}>
        <MaterialCommunityIcons 
          name="close" 
          size={18} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const LoginScreen: React.FC = () => {
  const { login, error: contextError, clearError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Responsive sizing based on screen height
  const isSmallScreen = height < 700;
  const isMediumScreen = height >= 700 && height < 800;
  const isLargeScreen = height >= 800;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showErrorMessage('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');
    setShowSnackbar(false);
    clearError(); // Clear context error

    try {
      console.log('🚀 Starting login process...');
      await login(username.trim(), password);
      console.log('✅ Login successful, user will be redirected...');
    } catch (err: any) {
      console.log('❌ Login failed:', err.message);
      
      let errorMessage = '';
      
      if (err.message.includes('Network Error') || err.message.includes('network')) {
        errorMessage = 'No internet connection. Please check your network and try again.';
      } else if (err.message.includes('401') || err.message.includes('Invalid') || err.message.includes('credentials')) {
        errorMessage = 'Invalid username or password. Please try again.';
      } else if (err.message.includes('500') || err.message.includes('Server')) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      showErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showErrorMessage = (message: string) => {
    console.log('🔴 Showing error message:', message);
    setError(message);
    setShowSnackbar(true);
  };

  const handleInputFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleInputBlur = () => {
    setFocusedField(null);
  };

  const handleDismissSnackbar = () => {
    console.log('📝 Dismissing snackbar...');
    setShowSnackbar(false);
    setTimeout(() => {
      setError('');
    }, 300);
  };

  const isFormValid = username.trim().length > 0 && password.length > 0;

  // Dynamic styles based on screen size
  const dynamicStyles = {
    logoSize: isSmallScreen ? 60 : isMediumScreen ? 80 : 100,
    logoIconSize: isSmallScreen ? 28 : isMediumScreen ? 34 : 40,
    appNameSize: isSmallScreen ? 28 : isMediumScreen ? 32 : 36,
    cardPadding: isSmallScreen ? 16 : isMediumScreen ? 20 : 24,
    inputPadding: isSmallScreen ? 12 : 16,
    spacing: isSmallScreen ? 12 : isMediumScreen ? 16 : 20,
    containerPadding: isSmallScreen ? 16 : 20,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.circle1]} />
        <View style={[styles.patternCircle, styles.circle2]} />
        <View style={[styles.patternCircle, styles.circle3]} />
        <View style={[styles.patternCircle, styles.circle4]} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.scrollContainer}>
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                paddingHorizontal: dynamicStyles.containerPadding
              }
            ]}
          >
            {/* Logo Section - Compact */}
            <View style={[styles.logoSection, { marginBottom: dynamicStyles.spacing }]}>
              <Animated.View 
                style={[
                  { transform: [{ scale: logoScale }] },
                  { marginBottom: isSmallScreen ? 8 : 12 }
                ]}
              >
                <LinearGradient
                  colors={[COLORS.secondary, COLORS.secondaryDark]}
                  style={[styles.logoGradient, {
                    width: dynamicStyles.logoSize,
                    height: dynamicStyles.logoSize,
                    borderRadius: dynamicStyles.logoSize / 2,
                  }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={dynamicStyles.logoIconSize} 
                    color="#FFFFFF" 
                  />
                </LinearGradient>
              </Animated.View>
              
              <CustomText style={[styles.appName, { 
                fontSize: dynamicStyles.appNameSize,
                marginBottom: isSmallScreen ? 4 : 8 
              }]}>
                Shiftly
              </CustomText>
              <CustomText style={[styles.appTagline, {
                fontSize: isSmallScreen ? 13 : 14,
                lineHeight: isSmallScreen ? 18 : 20
              }]}>
                Smart Shift Management{isSmallScreen ? ' for Modern Workforce' : '\nfor Modern Workforce'}
              </CustomText>
            </View>

            {/* Login Card */}
            <BlurView intensity={20} tint="light" style={styles.loginCard}>
              <View style={[styles.cardContent, { padding: dynamicStyles.cardPadding }]}>
                {/* Card Header */}
                <View style={[styles.cardHeader, { marginBottom: dynamicStyles.spacing }]}>
                  <CustomText style={[styles.cardTitle, {
                    fontSize: isSmallScreen ? 18 : isMediumScreen ? 20 : 24,
                    marginBottom: isSmallScreen ? 4 : 6
                  }]}>
                    Welcome Back
                  </CustomText>
                  <CustomText style={[styles.cardSubtitle, {
                    fontSize: isSmallScreen ? 12 : 13,
                    lineHeight: isSmallScreen ? 16 : 18
                  }]}>
                    Sign in to your account to continue
                  </CustomText>
                </View>

                {/* Form */}
                <View style={[styles.formContainer, { gap: dynamicStyles.spacing }]}>
                  {/* Username Input */}
                  <View style={styles.inputContainer}>
                    <CustomText style={[styles.inputLabel, {
                      fontSize: isSmallScreen ? 12 : 13,
                      marginBottom: 6
                    }]}>Username</CustomText>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'username' && styles.inputWrapperFocused,
                      { 
                        paddingHorizontal: dynamicStyles.inputPadding,
                        paddingVertical: isSmallScreen ? 8 : 10
                      }
                    ]}>
                      <MaterialCommunityIcons 
                        name="account" 
                        size={isSmallScreen ? 18 : 20} 
                        color={focusedField === 'username' ? COLORS.secondary : COLORS.text.secondary}
                        style={styles.inputIcon}
                      />
                      <RNTextInput
                        style={[styles.textInput, {
                          fontSize: isSmallScreen ? 14 : 16,
                          paddingVertical: isSmallScreen ? 8 : 12
                        }]}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => handleInputFocus('username')}
                        onBlur={handleInputBlur}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <CustomText style={[styles.inputLabel, {
                      fontSize: isSmallScreen ? 12 : 13,
                      marginBottom: 6
                    }]}>Password</CustomText>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'password' && styles.inputWrapperFocused,
                      { 
                        paddingHorizontal: dynamicStyles.inputPadding,
                        paddingVertical: isSmallScreen ? 8 : 10
                      }
                    ]}>
                      <MaterialCommunityIcons 
                        name="lock" 
                        size={isSmallScreen ? 18 : 20} 
                        color={focusedField === 'password' ? COLORS.secondary : COLORS.text.secondary}
                        style={styles.inputIcon}
                      />
                      <RNTextInput
                        style={[styles.textInput, {
                          fontSize: isSmallScreen ? 14 : 16,
                          paddingVertical: isSmallScreen ? 8 : 12
                        }]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        onFocus={() => handleInputFocus('password')}
                        onBlur={handleInputBlur}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <MaterialCommunityIcons 
                          name={showPassword ? 'eye-off' : 'eye'} 
                          size={isSmallScreen ? 18 : 20} 
                          color={focusedField === 'password' ? COLORS.secondary : COLORS.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity 
                    style={[
                      styles.loginButton,
                      (!isFormValid || loading) && styles.loginButtonDisabled,
                      { marginTop: isSmallScreen ? 8 : 12 }
                    ]}
                    onPress={handleLogin}
                    disabled={!isFormValid || loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isFormValid && !loading ? [COLORS.secondary, COLORS.secondaryDark] : [COLORS.text.light, COLORS.background.secondary]}
                      style={[styles.loginButtonGradient, {
                        paddingVertical: isSmallScreen ? 14 : 16,
                        paddingHorizontal: isSmallScreen ? 20 : 24
                      }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <MaterialCommunityIcons 
                            name="loading" 
                            size={isSmallScreen ? 18 : 20} 
                            color="#FFFFFF"
                            style={styles.loadingIcon}
                          />
                          <CustomText style={[styles.loginButtonText, {
                            fontSize: isSmallScreen ? 14 : 16
                          }]}>Signing in...</CustomText>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <CustomText style={[styles.loginButtonText, {
                            fontSize: isSmallScreen ? 14 : 16
                          }]}>Sign In</CustomText>
                          <MaterialCommunityIcons 
                            name="arrow-right" 
                            size={isSmallScreen ? 18 : 20} 
                            color="#FFFFFF" 
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Additional Options */}
                <View style={[styles.additionalOptions, {
                  marginTop: isSmallScreen ? 12 : 16
                }]}>
                  <TouchableOpacity style={styles.forgotPassword}>
                    <CustomText style={[styles.forgotPasswordText, {
                      fontSize: isSmallScreen ? 12 : 13
                    }]}>
                      Forgot password?
                    </CustomText>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>

            {/* Footer */}
            <View style={[styles.footer, { 
              marginTop: dynamicStyles.spacing,
              gap: isSmallScreen ? 8 : 12 
            }]}>
              <CustomText style={[styles.footerText, {
                fontSize: isSmallScreen ? 11 : 12,
                lineHeight: isSmallScreen ? 14 : 16
              }]}>
                © 2025 Shiftly • Crafted with 💜 by AF
                {!isSmallScreen && '\nEmpowering Modern Workplaces'}
              </CustomText>
              <View style={[styles.versionContainer, {
                paddingHorizontal: isSmallScreen ? 8 : 10,
                paddingVertical: isSmallScreen ? 4 : 6
              }]}>
                <CustomText style={[styles.versionText, {
                  fontSize: isSmallScreen ? 10 : 11
                }]}>v2.1.0</CustomText>
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* Custom Snackbar - Fixed Positioning */}
      <View style={styles.snackbarOverlay} pointerEvents="box-none">
        <CustomSnackbar
          visible={showSnackbar}
          message={error}
          onDismiss={handleDismissSnackbar}
          type="error"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -150,
    right: -100,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
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
    top: '25%',
    left: -50,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  circle4: {
    width: 120,
    height: 120,
    bottom: '25%',
    right: -30,
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  content: {
    alignItems: 'center',
    minHeight: height - 60,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
  },
  logoGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appName: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  loginCard: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    backgroundColor: COLORS.glass.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: 20,
  },
  cardContent: {
    // Remove flex: 1 that was causing issues
  },
  cardHeader: {
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  formContainer: {
    // Remove flex that was causing form to disappear
  },
  inputContainer: {
    // No specific height, let content determine
  },
  inputLabel: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.primary,
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineWidth: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginRight: 8,
  },
  additionalOptions: {
    alignItems: 'center',
  },
  forgotPassword: {
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.secondary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  versionContainer: {
    backgroundColor: COLORS.glass.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  versionText: {
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.light,
  },
  // Fixed Snackbar Overlay
  snackbarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  // Custom Snackbar Styles
  customSnackbar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 25,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 10000,
  },
  snackbarIcon: {
    marginRight: 10,
  },
  customSnackbarText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  snackbarCloseButton: {
    padding: 6,
  },
});

export default LoginScreen;