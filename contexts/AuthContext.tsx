// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import axios from 'axios';

// Enhanced User type
export interface User {
  uid: string;
  name: string;
  position: string;
  email?: string | null;
  location?: string;
  photoURL?: string;
  department?: string;
  phoneNumber?: string;
  joinDate?: string;
  schedule?: ScheduleItem[];
}

export interface ScheduleItem {
  date: string;
  shift: string;
  location?: string;
  notes?: string;
}

// Enhanced AuthContext type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Enhanced login function with better error handling
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!username.trim() || !password.trim()) {
        throw new Error('Username dan password tidak boleh kosong');
      }

      console.log('Attempting login for user:', username);
      
      const data = await authService.loginUser(username.trim(), password);
      console.log('Login successful, received token');

      // Store token
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('loginTime', new Date().toISOString());
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Get user profile
      const profile = await authService.getProfile();
      console.log('Profile loaded successfully');
      
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear any stored data on error
      await AsyncStorage.multiRemove(['token', 'loginTime']);
      delete axios.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsAuthenticated(false);

      // Enhanced error messages
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 401:
            throw new Error('Username atau password salah. Silakan coba lagi.');
          case 403:
            throw new Error('Akun Anda tidak memiliki akses. Hubungi administrator.');
          case 404:
            throw new Error('Server tidak ditemukan. Periksa koneksi internet Anda.');
          case 429:
            throw new Error('Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.');
          case 500:
            throw new Error('Terjadi kesalahan server. Coba lagi nanti.');
          default:
            throw new Error(serverMessage || `Terjadi kesalahan (${status}). Silakan coba lagi.`);
        }
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Koneksi internet bermasalah. Silakan coba lagi.');
      } else {
        throw new Error(error.message || 'Terjadi kesalahan tidak terduga. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout function
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout API if available
      try {
        await authService.logoutUser?.();
      } catch (logoutError) {
        console.warn('Logout API call failed:', logoutError);
        // Continue with local logout even if API fails
      }

      // Clear local storage
      await AsyncStorage.multiRemove(['token', 'loginTime', 'userProfile']);
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even on error
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const profile = await authService.getProfile();
      setUser(profile);
      
      // Cache profile
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If profile refresh fails, logout user
      await logout();
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedProfile = await authService.updateProfile?.(updates);
      
      if (updatedProfile) {
        setUser(updatedProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      } else {
        // If update API returns nothing, merge with current user
        const newUser = { ...user, ...updates };
        setUser(newUser);
        await AsyncStorage.setItem('userProfile', JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Check authentication status on app start
  const checkAuthStatus = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const [token, loginTime, cachedProfile] = await AsyncStorage.multiGet([
        'token',
        'loginTime',
        'userProfile'
      ]);

      const tokenValue = token[1];
      const loginTimeValue = loginTime[1];
      const cachedProfileValue = cachedProfile[1];

      if (!tokenValue) {
        console.log('No token found, user not authenticated');
        return;
      }

      // Check token expiry (optional - if you have token expiry logic)
      if (loginTimeValue) {
        const loginDate = new Date(loginTimeValue);
        const now = new Date();
        const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        // If logged in more than 24 hours ago, force re-login
        if (hoursSinceLogin > 24) {
          console.log('Token expired, logging out');
          await logout();
          return;
        }
      }

      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;

      // Try to load cached profile first
      if (cachedProfileValue) {
        try {
          const parsedProfile = JSON.parse(cachedProfileValue);
          setUser(parsedProfile);
          setIsAuthenticated(true);
          console.log('Loaded cached profile');
        } catch (parseError) {
          console.warn('Failed to parse cached profile:', parseError);
        }
      }

      // Then refresh from server
      try {
        await refreshProfile();
      } catch (refreshError) {
        console.warn('Failed to refresh profile from server:', refreshError);
        // If we have cached profile, continue with that
        if (!user && !cachedProfileValue) {
          await logout();
        }
      }

    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Auto-refresh profile periodically (optional)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const refreshInterval = setInterval(() => {
      refreshProfile().catch(console.error);
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshProfile,
    updateProfile,
    clearError,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Enhanced useAuth hook with better error handling
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hooks
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthLoading = () => {
  const { loading } = useAuth();
  return loading;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};