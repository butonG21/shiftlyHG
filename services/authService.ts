// services/authService.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../contexts/AuthContext';

const BASE_URL = 'https://jadwal-backend-production.up.railway.app/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  LOGIN_TIME: 'loginTime',
  USER_PROFILE: 'userProfile',
} as const;

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear storage and redirect to login
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      // Clear the authorization header from the apiClient instance
      delete apiClient.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

// Enhanced error handler
const handleApiError = (error: any): never => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Terjadi kesalahan server';
    
    switch (status) {
      case 400:
        throw new Error(`Data tidak valid: ${message}`);
      case 401:
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      case 403:
        throw new Error('Anda tidak memiliki akses untuk melakukan aksi ini.');
      case 404:
        throw new Error('Data tidak ditemukan atau endpoint tidak tersedia.');
      case 422:
        throw new Error(`Validasi gagal: ${message}`);
      case 429:
        throw new Error('Terlalu banyak permintaan. Coba lagi dalam beberapa menit.');
      case 500:
        throw new Error('Terjadi kesalahan server internal. Coba lagi nanti.');
      case 502:
        throw new Error('Server sedang dalam pemeliharaan. Coba lagi nanti.');
      case 503:
        throw new Error('Layanan sedang tidak tersedia. Coba lagi nanti.');
      default:
        throw new Error(`Kesalahan server (${status}): ${message}`);
    }
  } else if (error.request) {
    // Network error
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Server tidak dapat ditemukan. Periksa koneksi internet Anda.');
    } else if (error.code === 'TIMEOUT') {
      throw new Error('Koneksi timeout. Coba lagi dalam beberapa saat.');
    } else {
      throw new Error('Terjadi kesalahan jaringan. Periksa koneksi internet Anda.');
    }
  } else {
    // Something else happened
    throw new Error(error.message || 'Terjadi kesalahan tidak terduga.');
  }
};

// Types for API responses
interface LoginResponse {
  token: string;
  user: User;
  expiresIn?: number;
  refreshToken?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// Auth service functions
export const loginUser = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('Sending login request...');
    
    const response: AxiosResponse<LoginResponse> = await apiClient.post('/auth/login', {
      username: username.trim(),
      password,
    });

    console.log('Login response received');
    return response.data;
  } catch (error) {
    console.error('Login service error:', error);
    handleApiError(error);
  }
};

export const getProfile = async (): Promise<User> => {
  try {
    console.log('Fetching user profile...');
    
    const response: AxiosResponse<User> = await apiClient.get('/users/me');
    
    console.log('Profile fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw handleApiError(error);
  }
};

export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  try {
    console.log('Updating user profile...');
    
    const response: AxiosResponse<User> = await apiClient.put('/users/me', updates);
    
    console.log('Profile updated successfully');
    return response.data;
  } catch (error) {
    console.error('Update profile error:', error);
    handleApiError(error);
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    console.log('Changing password...');
    
    await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    
    console.log('Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    handleApiError(error);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Sending logout request...');
    
    // Optional: Call logout endpoint to invalidate token on server
    await apiClient.post('/auth/logout');
    
    console.log('Logout successful');
  } catch (error) {
    console.warn('Logout API call failed:', error);
    // Don't throw error for logout failures - continue with local logout
  }
};

export const refreshToken = async (refreshTokenValue: string): Promise<LoginResponse> => {
  try {
    console.log('Refreshing token...');
    
    const response: AxiosResponse<LoginResponse> = await apiClient.post('/auth/refresh', {
      refreshToken: refreshTokenValue,
    });
    
    console.log('Token refreshed successfully');
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    handleApiError(error);
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    console.log('Sending forgot password request...');
    
    await apiClient.post('/auth/forgot-password', { email });
    
    console.log('Forgot password email sent');
  } catch (error) {
    console.error('Forgot password error:', error);
    handleApiError(error);
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    console.log('Resetting password...');
    
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    
    console.log('Password reset successfully');
  } catch (error) {
    console.error('Reset password error:', error);
    handleApiError(error);
  }
};

// Schedule related functions
export const getSchedule = async (startDate?: string, endDate?: string): Promise<any[]> => {
  try {
    console.log('Fetching schedule...');
    
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response: AxiosResponse<any[]> = await apiClient.get('/schedule', { params });
    
    console.log('Schedule fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Get schedule error:', error);
    handleApiError(error);
  }
};

export const requestLeave = async (leaveData: {
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
}): Promise<void> => {
  try {
    console.log('Submitting leave request...');
    
    await apiClient.post('/leave/request', leaveData);
    
    console.log('Leave request submitted successfully');
  } catch (error) {
    console.error('Request leave error:', error);
    handleApiError(error);
  }
};

export const requestShiftSwap = async (swapData: {
  targetUserId: string;
  myShiftDate: string;
  targetShiftDate: string;
  reason?: string;
}): Promise<void> => {
  try {
    console.log('Submitting shift swap request...');
    
    await apiClient.post('/shift/swap-request', swapData);
    
    console.log('Shift swap request submitted successfully');
  } catch (error) {
    console.error('Request shift swap error:', error);
    handleApiError(error);
  }
};

export const getNotifications = async (): Promise<any[]> => {
  try {
    console.log('Fetching notifications...');
    
    const response: AxiosResponse<any[]> = await apiClient.get('/notifications');
    
    console.log('Notifications fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    handleApiError(error);
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    handleApiError(error);
  }
};

// Utility functions
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn('Server health check failed:', error);
    return false;
  }
};

export const uploadProfilePhoto = async (photoUri: string): Promise<string> => {
  try {
    console.log('Uploading profile photo...');
    
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);
    
    const response: AxiosResponse<{ photoUrl: string }> = await apiClient.post(
      '/users/upload-photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for file upload
      }
    );
    
    console.log('Profile photo uploaded successfully');
    return response.data.photoUrl;
  } catch (error) {
    console.error('Upload profile photo error:', error);
    handleApiError(error);
  }
};

// Export API client for direct use if needed
export { apiClient };

// Export base URL for reference
export { BASE_URL };