// screens/LoginScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Card,
  IconButton,
  Snackbar
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

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
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleInputBlur = () => {
    setFocusedField(null);
  };

  const isFormValid = username.trim().length > 0 && password.length > 0;

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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Animated.View 
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: logoScale }] }
                ]}
              >
                <LinearGradient
                  colors={[COLORS.secondary, COLORS.secondaryDark]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={40} 
                    color="#FFFFFF" 
                  />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.appName}>Shiftly</Text>
              <Text style={styles.appTagline}>
                Smart Shift Management{"\n"}for Modern Workforce
              </Text>
            </View>

            {/* Login Card */}
            <BlurView intensity={20} tint="light" style={styles.loginCard}>
              <View style={styles.cardContent}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Welcome Back</Text>
                  <Text style={styles.cardSubtitle}>
                    Sign in to your account to continue
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.formContainer}>
                  {/* Username Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Username</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'username' && styles.inputWrapperFocused
                    ]}>
                      <MaterialCommunityIcons 
                        name="account" 
                        size={20} 
                        color={focusedField === 'username' ? COLORS.secondary : COLORS.text.secondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => handleInputFocus('username')}
                        onBlur={handleInputBlur}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        mode="flat"
                        theme={{
                          colors: {
                            primary: 'transparent',
                            background: 'transparent',
                          }
                        }}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'password' && styles.inputWrapperFocused
                    ]}>
                      <MaterialCommunityIcons 
                        name="lock" 
                        size={20} 
                        color={focusedField === 'password' ? COLORS.secondary : COLORS.text.secondary}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        onFocus={() => handleInputFocus('password')}
                        onBlur={handleInputBlur}
                        underlineColor="transparent"
                        activeUnderlineColor="transparent"
                        mode="flat"
                        theme={{
                          colors: {
                            primary: 'transparent',
                            background: 'transparent',
                          }
                        }}
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <MaterialCommunityIcons 
                          name={showPassword ? 'eye-off' : 'eye'} 
                          size={20} 
                          color={focusedField === 'password' ? COLORS.secondary : COLORS.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Error Message */}
                  {error ? (
                    <View style={styles.errorContainer}>
                      <MaterialCommunityIcons 
                        name="alert-circle" 
                        size={20} 
                        color="#FF5252" 
                      />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Login Button */}
                  <TouchableOpacity 
                    style={[
                      styles.loginButton,
                      (!isFormValid || loading) && styles.loginButtonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={!isFormValid || loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isFormValid && !loading ? [COLORS.secondary, COLORS.secondaryDark] : [COLORS.text.light, COLORS.background.secondary]}
                      style={styles.loginButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <MaterialCommunityIcons 
                            name="loading" 
                            size={20} 
                            color="#FFFFFF"
                            style={styles.loadingIcon}
                          />
                          <Text style={styles.loginButtonText}>Signing in...</Text>
                        </View>
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.loginButtonText}>Sign In</Text>
                          <MaterialCommunityIcons 
                            name="arrow-right" 
                            size={20} 
                            color="#FFFFFF" 
                          />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Additional Options */}
                <View style={styles.additionalOptions}>
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © 2025 Shiftly • Crafted with 💜 by AF • Empowering Modern Workplaces
              </Text>
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>v2.1.0</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar for additional feedback */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={{ backgroundColor: '#FF5252' }}
      >
        {error}
      </Snackbar>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.xs,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTagline: {
    fontSize: TYPOGRAPHY.fontSize.base,
     fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.white,
    textAlign: 'center',
    lineHeight: 24,
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
  },
  cardContent: {
    padding: SPACING.xl,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
     fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
     fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: SPACING.lg,
  },
  inputContainer: {
    gap: SPACING.xs,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
     fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
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
    marginRight: SPACING.sm,
  },
  textInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
     fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.primary,
    backgroundColor: 'transparent',
    paddingVertical: SPACING.sm,
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.status.error,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.status.error,
  },
  errorText: {
    color: COLORS.text.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
     fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  loginButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.2,
     shadowRadius: 8,
     elevation: 6,
    marginTop: SPACING.xs,
  },
  loginButtonDisabled: {
    shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 2,
  },
  loginButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: SPACING.xs,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginRight: SPACING.xs,
  },
  additionalOptions: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  forgotPassword: {
    paddingVertical: SPACING.xs,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.secondary,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.white,
    textAlign: 'center',
  },
  versionContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.glass.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  versionText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.light,
  },
});

export default LoginScreen;