// services/authService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../src/types/user';
import apiClient, { ApiResponse, ApiError, extractApiData, handleApiError } from '../src/services/api';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  LOGIN_TIME: 'loginTime',
  USER_PROFILE: 'userProfile',
} as const;



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
    
    // console.log('Profile response received');
    // console.log('Response status:', response.status);
    // console.log('Response data:', JSON.stringify(response.data, null, 2));
    
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
    
    const response = await apiClient.put<ApiResponse<User>>('/users/me', profileData);
    
    // console.log('Profile update response:', response.data);
    
    const updatedUser = extractApiData(response);
    
    // Update stored profile
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
    return updatedUser;
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
    
    // Call logout endpoint
    await apiClient.post<ApiResponse<null>>('/auth/logout');
    
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error for logout - we still want to clear local storage
  } finally {
    // Always clear local storage regardless of API call success
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    console.log('Local storage cleared');
  }
};

// Verify token endpoint
export const verifyToken = async (): Promise<boolean> => {
  try {
    console.log('Verifying token...');
    
    await apiClient.get<ApiResponse<null>>('/auth/verify');
    
    console.log('Token verified successfully');
    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// Get user statistics
export const getUserStats = async (): Promise<any> => {
  try {
    // console.log('Fetching user statistics...');
    
    const response = await apiClient.get<ApiResponse<any>>('/users/me/stats');
    
    const stats = extractApiData(response);
    return stats;
  } catch (error) {
    console.error('Get user stats error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Delete profile image
export const deleteProfileImage = async (): Promise<void> => {
  try {
    console.log('Deleting profile image...');
    
    await apiClient.delete<ApiResponse<null>>('/users/profile/image');
    
    console.log('Profile image deleted successfully');
  } catch (error) {
    console.error('Delete profile image error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Get profile image
export const getProfileImage: (size?: 'thumbnail' | 'small' | 'medium' | 'original') => Promise<string> = async (size = 'thumbnail') => {
  try {
    console.log('Getting profile image...');
    
    const response = await apiClient.get<ApiResponse<{ imageUrl: string }>>(`/users/profile/image?size=${size}`);
    
    const imageData = extractApiData(response);
    return imageData.imageUrl;
  } catch (error) {
    console.error('Get profile image error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
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
    
    const response = await apiClient.post<ApiResponse<ProfileImageUploadData>>('/users/profile/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Profile photo upload response:', response.data);
    
    const uploadData = extractApiData(response);
    return uploadData;
  } catch (error) {
    console.error('Upload profile photo error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw handleApiError(error as ApiError);
  }
};

// Export API client for direct use if needed
export { apiClient };