// src/services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import apiClient, { ApiResponse, ApiError, extractApiData, handleApiError } from './api';
import { STORAGE_KEYS } from '../constants/storage';

// Login response interface matching new API format
interface LoginData {
  token: string;
  user: User;
  expiresIn: string;
}

interface ProfileImageUploadData {
  user: {
    uid: string;
    name: string;
    profileImage: string;
    profileImageThumbnail: string;
  };
  imageVariants: {
    original: string;
    thumbnail: string;
    small: string;
    medium: string;
  };
  uploadInfo: {
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    fileId: string;
  };
}

// Auth service functions
export const loginUser = async (username: string, password: string): Promise<LoginData> => {
  try {
    console.log('Making login request to: /auth/login');
    
    const response = await apiClient.post<ApiResponse<LoginData>>('/auth/login', {
      username: username.trim(),
      password: password.trim(),
    });

    console.log('Login response received:', JSON.stringify(response.data, null, 2));
    
    const loginData = extractApiData(response);
    
    // Store token and login time immediately after successful login
    if (loginData.token) {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, loginData.token],
        [STORAGE_KEYS.LOGIN_TIME, new Date().toISOString()],
      ]);
      console.log('Token stored successfully');
    }
    
    return loginData;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export const getUserProfile = async (): Promise<User> => {
  try {
    console.log('Fetching user profile...');
    
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    
    console.log('Profile response received');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    const userData = extractApiData(response);
    
    // Store the profile data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Get profile error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export const updateProfile = async (profileData: Partial<User>): Promise<User> => {
  try {
    console.log('Updating profile with data:', profileData);
    
    const response = await apiClient.put<ApiResponse<User>>('/users/me', profileData);
    const userData = extractApiData(response);
    
    // Update stored profile data
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    console.log('Logging out user...');
    
    // Clear all stored data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TOKEN,
      STORAGE_KEYS.LOGIN_TIME,
      STORAGE_KEYS.USER_PROFILE,
    ]);
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout');
  }
};

export const verifyToken = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/auth/verify');
    return response.status === 200;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export const getUserStats = async (): Promise<any> => {
  try {
    console.log('Fetching user stats...');
    
    const response = await apiClient.get<ApiResponse<any>>('/users/stats');
    return extractApiData(response);
  } catch (error) {
    console.error('Get user stats error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export const deleteProfileImage = async (): Promise<void> => {
  try {
    console.log('Deleting profile image...');
    
    await apiClient.delete('/users/me/profile-image');
    console.log('Profile image deleted successfully');
  } catch (error) {
    console.error('Delete profile image error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export const getProfileImage = async (size: 'thumbnail' | 'small' | 'medium' | 'original' = 'thumbnail'): Promise<string> => {
  try {
    console.log(`Fetching profile image (${size})...`);
    
    const response = await apiClient.get(`/users/me/profile-image?size=${size}`);
    return response.data.imageUrl || '';
  } catch (error) {
    console.error('Get profile image error:', error);
    return '';
  }
};

export const uploadProfilePhoto = async (imageUri: string): Promise<ProfileImageUploadData> => {
  try {
    console.log('Uploading profile photo...');
    
    const formData = new FormData();
    formData.append('profileImage', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await apiClient.post<ApiResponse<ProfileImageUploadData>>(
      '/users/me/profile-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const uploadData = extractApiData(response);
    console.log('Profile photo uploaded successfully');
    return uploadData;
  } catch (error) {
    console.error('Upload profile photo error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

export { apiClient };