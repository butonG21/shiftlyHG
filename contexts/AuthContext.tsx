// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { User, ScheduleItem } from '../types/user';

// Enhanced AuthContext type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  manualRefreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  LOGIN_TIME: 'loginTime',
  USER_PROFILE: 'userProfile',
} as const;

// Token expiry time in hours
const TOKEN_EXPIRY_HOURS = 24;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Helper function to clear all auth data
  const clearAuthData = useCallback(async (): Promise<void> => {
    console.log('Clearing auth data...');
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('Auth data cleared');
  }, []);

  // Helper function to check if token is expired
  const isTokenExpired = useCallback((loginTime: string): boolean => {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursSinceLogin = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLogin > TOKEN_EXPIRY_HOURS;
  }, []);

  // Enhanced login function with simplified error handling
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

      // Store token and login time
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, data.token],
        [STORAGE_KEYS.LOGIN_TIME, new Date().toISOString()],
      ]);
      
      // Get user profile
      const profile = await authService.getProfile();
      console.log('Profile loaded successfully');
      
      // Cache profile
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      
      // Set user state and authentication status
      setUser(profile);
      setIsAuthenticated(true);
      setError(null);
      
      console.log('Login completed successfully, user authenticated');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Clear any stored data on error
      await clearAuthData();
      
      // Set error message
      const errorMessage = error.message || 'Terjadi kesalahan tidak terduga. Silakan coba lagi.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout API if available
      try {
        await authService.logoutUser();
      } catch (logoutError) {
        console.warn('Logout API call failed:', logoutError);
        // Continue with local logout even if API fails
      }

      await clearAuthData();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even on error
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  }, [clearAuthData]);

  // Refresh user profile - simplified to prevent loops
  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Refreshing profile from server...');
      const profile = await authService.getProfile();
      console.log('Profile refreshed successfully');
      
      setUser(profile);
      setIsAuthenticated(true);
      
      // Cache updated profile
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If profile refresh fails, logout user
      await logout();
    }
  }, [logout]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedProfile = await authService.updateProfile(updates);
      
      if (updatedProfile) {
        setUser(updatedProfile);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      } else {
        // If update API returns nothing, merge with current user
        const newUser = { ...user, ...updates };
        setUser(newUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newUser));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [user]);

  // Manual refresh profile function for components to call when needed
  const manualRefreshProfile = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      console.log('Cannot refresh profile: user not authenticated');
      return;
    }
    
    try {
      console.log('Manual profile refresh requested...');
      await refreshProfile();
      console.log('Manual profile refresh completed');
    } catch (error) {
      console.error('Manual profile refresh failed:', error);
    }
  }, [isAuthenticated, user, refreshProfile]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Check authentication status on app start
  const checkAuthStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      const [token, loginTime, cachedProfile] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.LOGIN_TIME,
        STORAGE_KEYS.USER_PROFILE,
      ]);

      const tokenValue = token[1];
      const loginTimeValue = loginTime[1];
      const cachedProfileValue = cachedProfile[1];

      if (!tokenValue) {
        console.log('No token found, user not authenticated');
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Check token expiry
      if (loginTimeValue && isTokenExpired(loginTimeValue)) {
        console.log('Token expired, logging out');
        await logout();
        return;
      }

      // Try to load cached profile first
      if (cachedProfileValue) {
        try {
          const parsedProfile = JSON.parse(cachedProfileValue);
          setUser(parsedProfile);
          setIsAuthenticated(true);
          console.log('Loaded cached profile, user authenticated');
        } catch (parseError) {
          console.warn('Failed to parse cached profile:', parseError);
          // If cached profile is corrupted, try to get fresh profile
          await refreshProfile();
        }
      } else {
        // No cached profile, get fresh from server
        console.log('No cached profile, fetching from server...');
        await refreshProfile();
      }

    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  }, [isTokenExpired, logout, refreshProfile]);

  useEffect(() => {
    checkAuthStatus();
  }, []); // Only run once on mount

  // Auto-refresh profile periodically (optional) - removed to prevent infinite loops
  // useEffect(() => {
  //   if (!isAuthenticated || !user) return;

  //   const refreshInterval = setInterval(() => {
  //     refreshProfile().catch(console.error);
  //   }, 5 * 60 * 1000); // Refresh every 5 minutes

  //   return () => clearInterval(refreshInterval);
  // }, [isAuthenticated, user, refreshProfile]);

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshProfile,
    manualRefreshProfile,
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