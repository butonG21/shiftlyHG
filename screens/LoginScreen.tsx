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
      setError('Username dan password harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
      
      // Shake animation on error
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (error) setError(''); // Clear error when user starts typing
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#00425A" />
      <LinearGradient
        colors={['#00425A', '#005C7A', '#007B9A', '#0099BA']}
        style={styles.container}
      >
        {/* Background Pattern */}
        <View style={styles.backgroundPattern}>
          <View style={[styles.patternCircle, styles.circle1]} />
          <View style={[styles.patternCircle, styles.circle2]} />
          <View style={[styles.patternCircle, styles.circle3]} />
          <View style={[styles.patternCircle, styles.circle4]} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.select({ ios: 'padding', android: 'height' })}
          keyboardVerticalOffset={Platform.select({ ios: 0, android: 20 })}
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
              <Animated.View 
                style={[
                  styles.logoSection,
                  { transform: [{ scale: logoScale }] }
                ]}
              >
                <View style={styles.logoContainer}>
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
                </View>
                
                <Text style={styles.appName}>Shiftly</Text>
                <Text style={styles.appTagline}>Kelola Jadwal Kerja Anda</Text>
              </Animated.View>

              {/* Login Card */}
              <BlurView intensity={20} tint="light" style={styles.loginCard}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>
                    <Text style={styles.cardSubtitle}>
                      Silakan masukkan kredensial Anda untuk melanjutkan
                    </Text>
                  </View>

                  <View style={styles.formContainer}>
                    {/* Username Input */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Employee ID</Text>
                      <View style={[
                        styles.inputWrapper,
                        focusedField === 'username' && styles.inputWrapperFocused
                      ]}>
                        <MaterialCommunityIcons 
                          name="account-outline" 
                          size={20} 
                          color={focusedField === 'username' ? '#F9B233' : '#666'} 
                          style={styles.inputIcon}
                        />
                        <TextInput
                          value={username}
                          onChangeText={handleUsernameChange}
                          onFocus={() => setFocusedField('username')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Masukkan Employee ID"
                          placeholderTextColor="#999"
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={styles.textInput}
                          underlineColor="transparent"
                          activeUnderlineColor="transparent"
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
                          name="lock-outline" 
                          size={20} 
                          color={focusedField === 'password' ? '#F9B233' : '#666'} 
                          style={styles.inputIcon}
                        />
                        <TextInput
                          value={password}
                          onChangeText={handlePasswordChange}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Masukkan password"
                          placeholderTextColor="#999"
                          secureTextEntry={!showPassword}
                          style={styles.textInput}
                          underlineColor="transparent"
                          activeUnderlineColor="transparent"
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeIcon}
                        >
                          <MaterialCommunityIcons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Error Message */}
                    {error ? (
                      <Animated.View style={styles.errorContainer}>
                        <MaterialCommunityIcons 
                          name="alert-circle" 
                          size={16} 
                          color="#FF5252" 
                        />
                        <Text style={styles.errorText}>{error}</Text>
                      </Animated.View>
                    ) : null}

                    {/* Login Button */}
                    <TouchableOpacity
                      onPress={handleLogin}
                      disabled={!username.trim() || !password.trim() || loading}
                      style={[
                        styles.loginButton,
                        (!username.trim() || !password.trim()) && styles.loginButtonDisabled
                      ]}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          (!username.trim() || !password.trim())
                            ? ['#CCC', '#AAA']
                            : ['#F9B233', '#FFD700', '#FFA500']
                        }
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
                            <Text style={styles.loginButtonText}>Masuk...</Text>
                          </View>
                        ) : (
                          <View style={styles.buttonContent}>
                            <Text style={styles.loginButtonText}>Masuk</Text>
                            <MaterialCommunityIcons 
                              name="arrow-right" 
                              size={20} 
                              color="#FFFFFF" 
                            />
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Additional Options */}
                    <View style={styles.additionalOptions}>
                      <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotPasswordText}>
                          Lupa Password?
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </BlurView>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Butuh bantuan? Hubungi IT Support
                </Text>
                <View style={styles.versionContainer}>
                  <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
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
    borderRadius: 100,
    backgroundColor: 'rgba(249, 178, 51, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
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
    left: -20,
    backgroundColor: 'rgba(249, 178, 51, 0.08)',
  },
  circle4: {
    width: 80,
    height: 80,
    bottom: '30%',
    right: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F9B233',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loginCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: '#F9B233',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#F9B233',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  loginButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  additionalOptions: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPassword: {
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 12,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  versionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LoginScreen;