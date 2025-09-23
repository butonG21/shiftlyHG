// src/contexts/AuthContext.tsx - FIXED VERSION
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { User } from '../types/user';
import { ScheduleItem } from '../types/schedule';
import { STORAGE_KEYS } from '../constants/storage';

// Enhanced AuthContext type
export interface AuthContextType {
  user: User | null;
  loading: boolean; // Only for initial app loading
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  manualRefreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token expiry time in hours
const TOKEN_EXPIRY_HOURS = 24;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Only for app initialization
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

  // 🚀 FIXED: Login function - NO setLoading(true) during login process
const login = async (username: string, password: string): Promise<void> => {
  try {
    setError(null);

    // ✅ Validate inputs BEFORE showing loading screen
    if (!username.trim()) {
      throw new Error('Username tidak boleh kosong');
    }
    if (!password.trim()) {
      throw new Error('Password tidak boleh kosong');
    }

    // ✅ Only show loading screen for actual network requests
    console.log('Attempting login for user:', username);
    
    const loginData = await authService.loginUser(username.trim(), password);
    
    if (!loginData.token) {
      throw new Error('Login response tidak mengandung token yang valid');
    }
    
    const token = loginData.token;
    
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, token],
      [STORAGE_KEYS.LOGIN_TIME, new Date().toISOString()],
    ]);
        setLoading(true);

    const profile = await authService.getUserProfile();
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    
    setUser(profile);
    setIsAuthenticated(true);
    setError(null);
    
  } catch (error) {
    // ✅ Only clear auth data for network/auth errors, not validation errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (!errorMessage.includes('tidak boleh kosong')) {
      // Only clear auth data for actual login failures, not validation
      await clearAuthData();
    }
    
    setError(errorMessage);
    throw error;
  } finally {
    setLoading(false); // ✅ Always hide loading screen
  }
};
  // Enhanced logout function
const logout = async (): Promise<void> => {
  try {
    setLoading(true); // ✅ Show loading screen during logout
    console.log('Logging out user...');
    
    // Call logout service to clear server-side session if needed
    try {
      await authService.logoutUser();
    } catch (serviceError) {
      console.warn('Logout service error (continuing with local cleanup):', serviceError);
      // Continue with local cleanup even if server logout fails
    }
    
    // Clear local auth data
    await clearAuthData();
    
    console.log('Logout completed successfully');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear local data
    await clearAuthData();
  } finally {
    setLoading(false); // ✅ Hide loading screen
  }
};
  // Refresh profile function
  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      if (!isAuthenticated) {
        console.log('User not authenticated, skipping profile refresh');
        return;
      }

      console.log('Refreshing user profile...');
      const profile = await authService.getUserProfile();
      
      // Update cached profile
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      
      setUser(profile);
      console.log('Profile refreshed successfully');
    } catch (error) {
      console.error('Profile refresh error:', error);
      
      // If profile refresh fails due to auth issues, logout
      if (error instanceof Error && error.message.includes('401')) {
        console.log('Authentication expired, logging out...');
        await logout();
      }
    }
  }, [isAuthenticated]);

  // Manual refresh profile function (with loading state)
  const manualRefreshProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      await refreshProfile();
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      // Don't use global loading for profile updates
      setError(null);
      
      console.log('Updating profile with:', updates);
      const updatedProfile = await authService.updateProfile(updates);
      
      // Update cached profile
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
      
      setUser(updatedProfile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof Error) {
        setError(error.message);
        throw error; // Let calling component handle the error
      } else {
        const errorMsg = 'Gagal memperbarui profil. Silakan coba lagi.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    }
  };

  // Clear error function
  const clearError = (): void => {
    setError(null);
  };

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      try {
        console.log('Initializing auth state...');
        
        const [token, loginTime, cachedProfile] = await AsyncStorage.multiGet([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.LOGIN_TIME,
          STORAGE_KEYS.USER_PROFILE,
        ]);
        
        const tokenValue = token[1];
        const loginTimeValue = loginTime[1];
        const cachedProfileValue = cachedProfile[1];
        
        if (!tokenValue || !loginTimeValue) {
          console.log('No valid token or login time found');
          await clearAuthData();
          return;
        }
        
        // Check if token is expired
        if (isTokenExpired(loginTimeValue)) {
          console.log('Token expired, clearing auth data');
          await clearAuthData();
          return;
        }
        
        // Verify token with server
        const isValidToken = await authService.verifyToken();
        if (!isValidToken) {
          console.log('Token verification failed, clearing auth data');
          await clearAuthData();
          return;
        }
        
        console.log('Token is valid, restoring auth state');
        
        // Try to use cached profile first
        if (cachedProfileValue) {
          try {
            const parsedProfile = JSON.parse(cachedProfileValue);
            setUser(parsedProfile);
            setIsAuthenticated(true);
            console.log('Auth state restored from cache');
            
            // Refresh profile in background
            refreshProfile();
          } catch (parseError) {
            console.error('Failed to parse cached profile:', parseError);
            // If cached profile is corrupted, fetch fresh profile
            await refreshProfile();
          }
        } else {
          // No cached profile, fetch from server
          await refreshProfile();
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        await clearAuthData();
      } finally {
        setLoading(false); // Only set to false after initialization
      }
    };
    
    initializeAuth();
  }, [clearAuthData, isTokenExpired, refreshProfile]);

  const contextValue: AuthContextType = {
    user,
    loading, // Only true during app initialization
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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