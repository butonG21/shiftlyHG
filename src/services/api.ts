// src/services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

const BASE_URL = 'https://jadwal-backend-production.up.railway.app/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Response interface matching new backend format
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Error response interface
export interface ApiError {
  success: false;
  message: string;
  error?: any;
  timestamp: string;
}

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

// Response interceptor for error handling and response formatting
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Return the response data directly for successful requests
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      // Clear the authorization header from the apiClient instance
      delete apiClient.defaults.headers.common['Authorization'];
    }
    
    // Format error response to match our ApiError interface
    const errorResponse: ApiError = {
      success: false,
      message: error.response?.data?.message || error.message || 'Network error occurred',
      error: error.response?.data?.error || error.code,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    };
    
    return Promise.reject(errorResponse);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: ApiError): never => {
  console.error('API Error:', error);
  
  // Throw a user-friendly error message
  if (error.message) {
    throw new Error(error.message);
  }
  
  // Fallback error message
  throw new Error('Terjadi kesalahan pada server. Silakan coba lagi.');
};

// Helper function to extract data from API response
export const extractApiData = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success) {
    return response.data.data;
  }
  
  // If success is false, throw an error
  throw new Error(response.data.message || 'API request failed');
};

export default apiClient;
export { BASE_URL };