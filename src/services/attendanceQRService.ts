// src/services/attendanceQRService.ts
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

// Constants
const ATTENDANCE_API_BASE = 'http://attendance-api.shabuhachi.id/service';
const DEVELOPMENT_MODE = false; // Automatically detect development mode

// Development dummy data
const DUMMY_DATA = {
  userid: '123456',
  longitude: '106.6542219',
  latitude: '-6.3018433',
};

// Types
export interface LocationData {
  latitude: string;
  longitude: string;
  address?: string;
}

export interface QRValidationRequest {
  userid: string;
  barcode: string;
  latitude: string;
  longitude: string;
  process_stat: string;
}

export interface QRValidationResponse {
  success: number;
  message: string;
}

export interface StatusCheckRequest {
  userid: string;
}

export interface StatusCheckResponse {
  success: boolean;
  mset_code: string;
  date: string;
  status: string;
  status_desc: string;
}

export interface AttendanceSubmissionRequest {
  userid: string;
  image: any; // File object
  address: string;
  barcode: string;
  latitude: string;
  mset_code: string;
  process_stat: string;
  status: string;
  longitude: string;
}

export interface AttendanceSubmissionResponse {
  success: number;
  message: string;
}

export interface TripReportRequest {
  userid: string;
}

export interface TripReportResponse {
  success: boolean;
  mset_date: string;
  mset_date_breakout: string;
  mset_date_breakin: string;
  mset_date_clockout: string;
  mset_start_time: string;
  mset_start_address: string;
  mset_start_image: string;
  mset_break_out_time: string;
  mset_break_out_address: string | null;
  mset_break_out_image: string | null;
  mset_break_in_time: string;
  mset_break_in_address: string | null;
  mset_break_in_image: string | null;
  mset_end_time: string;
  mset_end_address: string | null;
  mset_end_image: string | null;
}

// Utility functions
const generateFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `attendance_${year}${month}${day}_${hours}${minutes}${seconds}`;
};

// Callback function for user notifications
let userNotificationCallback: ((message: string, type: 'success' | 'error' | 'warning' | 'info') => void) | null = null;

// Set notification callback (to be called from UI components)
export const setUserNotificationCallback = (callback: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void) => {
  userNotificationCallback = callback;
};

const logStep = (step: string, data?: any) => {
  console.log(`[ATTENDANCE QR] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

// Enhanced logging with user notification for critical issues
const logStepWithNotification = (step: string, data?: any, notifyUser = false, notificationType: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  console.log(`[ATTENDANCE QR] ${step}`, data ? JSON.stringify(data, null, 2) : '');
  
  if (notifyUser && userNotificationCallback) {
    userNotificationCallback(step, notificationType);
  }
};

// Get current user ID with enhanced error handling and fallback
const getCurrentUserId = async (): Promise<string> => {
  try {
    logStep('Getting current user ID');
    
    if (DEVELOPMENT_MODE) {
      logStep('Development mode: using dummy user ID');
      return DUMMY_DATA.userid;
    }

    // Check if AsyncStorage is available
    if (typeof AsyncStorage === 'undefined') {
      logStep('AsyncStorage is not available');
      throw new Error('AsyncStorage is not available');
    }

    logStep('Fetching user profile from AsyncStorage');
    const userProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    
    if (!userProfile) {
      logStep('No user profile found in AsyncStorage');
      
      // Try to get token as fallback
       const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
       if (token) {
         logStep('Found token, but no user profile - this might indicate a login issue');
         // Try to extract user info from token if it's a JWT
         try {
           const tokenParts = token.split('.');
           if (tokenParts.length === 3) {
             const payload = JSON.parse(atob(tokenParts[1]));
             const userId = payload.uid || payload.user_id || payload.id || payload.sub;
             if (userId) {
               logStep('Extracted user ID from token', userId);
               return userId;
             }
           }
         } catch (tokenError) {
           logStep('Could not extract user ID from token', tokenError);
         }
       }
       
       logStepWithNotification('Data pengguna tidak ditemukan. Silakan login ulang.', null, true, 'error');
       throw new Error('No user profile or valid token found');
    }

    logStep('User profile found, parsing JSON');
    let parsedProfile;
    try {
      parsedProfile = JSON.parse(userProfile);
      logStep('Parsed user profile', parsedProfile);
    } catch (parseError) {
      logStep('JSON parsing error - corrupted user profile data', parseError);
      
      // Try to clear corrupted data and re-authenticate
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      throw new Error('Corrupted user profile data - cleared from storage');
    }
    
    // Try different possible user ID fields with priority order
    const userId = parsedProfile.uid || 
                   parsedProfile._id || 
                   parsedProfile.id || 
                   parsedProfile.user_id ||
                   parsedProfile.username ||
                   parsedProfile.email;
    
    if (!userId) {
      logStep('No valid user ID found in profile', parsedProfile);
      
      // Log available fields for debugging
      const availableFields = Object.keys(parsedProfile);
      logStep('Available fields in user profile', availableFields);
      
      throw new Error('No valid user ID found in profile');
    }

    // Validate the user ID format
    const userIdStr = String(userId).trim();
    if (userIdStr === '' || userIdStr === 'null' || userIdStr === 'undefined') {
      logStep('Invalid user ID format', { userId, userIdStr });
      throw new Error('Invalid user ID format');
    }

    logStep('User ID successfully retrieved', userIdStr);
    return userIdStr;
  } catch (error) {
    logStep('Error getting user ID', error);
    
    if (error instanceof SyntaxError) {
      logStep('JSON parsing error - corrupted user profile data');
    } else if (error instanceof Error) {
      logStep('Error details', {
        message: error.message,
        stack: error.stack
      });
    }
    
    // In production, we might want to trigger a re-login flow
    // For now, we'll throw the error to be handled by the calling function
    throw error;
  }
};

// Get current location
export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    logStep('Requesting location permissions');
    
    if (DEVELOPMENT_MODE) {
      logStep('Using dummy location data for development');
      return {
        latitude: DUMMY_DATA.latitude,
        longitude: DUMMY_DATA.longitude,
      };
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    logStep('Getting current position');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const locationData: LocationData = {
      latitude: location.coords.latitude.toString(),
      longitude: location.coords.longitude.toString(),
    };

    logStep('Location obtained', locationData);
    return locationData;
  } catch (error) {
    logStep('Error getting location', error);
    throw error;
  }
};

// Reverse geocoding to get address
export const reverseGeocode = async (latitude: string, longitude: string): Promise<string> => {
  try {
    logStep('Starting reverse geocoding', { latitude, longitude });
    
    if (DEVELOPMENT_MODE) {
      const dummyAddress = 'MMX3+7M8, Sampora, Kecamatan Cisauk, Banten, Indonesia, 15341';
      logStep('Using dummy address for development', dummyAddress);
      return dummyAddress;
    }

    const result = await Location.reverseGeocodeAsync({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    if (result.length > 0) {
      const address = result[0];
      const formattedAddress = [
        address.street,
        address.district,
        address.city,
        address.region,
        address.country,
        address.postalCode
      ].filter(Boolean).join(', ');
      
      logStep('Address obtained', formattedAddress);
      return formattedAddress;
    }
    
    throw new Error('No address found for the given coordinates');
  } catch (error) {
    logStep('Error in reverse geocoding', error);
    throw error;
  }
};

// Step 1: Validate QR code and location
export const validateQRAndLocation = async (barcode: string): Promise<QRValidationResponse> => {
  try {
    logStep('Step 1: Starting QR code and location validation');
    
    const userid = await getCurrentUserId();
    const location = await getCurrentLocation();
    
    const requestData: QRValidationRequest = {
      userid,
      barcode,
      latitude: location.latitude,
      longitude: location.longitude,
      process_stat: '0', // Always '0' for initial validation
    };

    logStep('Sending validation request', requestData);

    const formData = new FormData();
    Object.entries(requestData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await axios.post<QRValidationResponse>(
      `${ATTENDANCE_API_BASE}/saveLocation1.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      }
    );

    logStep('Validation response received', response.data);
    
    if (response.data.success === 1) {
      logStep('QR code and location validation successful');
    } else {
      logStep('QR code and location validation failed', response.data.message);
    }

    return response.data;
  } catch (error) {
    logStep('Error in QR validation', error);
    throw error;
  }
};

// Step 2: Check attendance status
export const checkAttendanceStatus = async (): Promise<StatusCheckResponse> => {
  try {
    logStep('Step 2: Checking attendance status');
    
    const userid = await getCurrentUserId();
    
    const requestData: StatusCheckRequest = {
      userid,
    };

    logStep('Sending status check request', requestData);

    const formData = new FormData();
    formData.append('userid', userid);

    const response = await axios.post<StatusCheckResponse>(
      `${ATTENDANCE_API_BASE}/checkStatus1.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      }
    );

    logStep('Status check response received', response.data);
    
    if (response.data.success) {
      logStep('Status check successful', {
        mset_code: response.data.mset_code,
        status: response.data.status,
        status_desc: response.data.status_desc,
      });
    } else {
      logStep('Status check failed');
    }

    return response.data;
  } catch (error) {
    logStep('Error in status check', error);
    throw error;
  }
};

// Step 3: Submit attendance with photo
export const submitAttendanceWithPhoto = async (
  imageUri: string,
  barcode: string,
  statusData: StatusCheckResponse
): Promise<AttendanceSubmissionResponse> => {
  try {
    logStep('Step 3: Submitting attendance with photo');
    
    const userid = await getCurrentUserId();
    const location = await getCurrentLocation();
    const address = await reverseGeocode(location.latitude, location.longitude);
    
    const filename = generateFilename();
    
    logStep('Preparing attendance submission', {
      filename,
      address,
      mset_code: statusData.mset_code,
      status: statusData.status,
    });

    const formData = new FormData();
    
    // Add image file
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${filename}.jpg`,
    } as any);
    
    // Add other form data
    const requestData = {
      userid,
      address,
      barcode,
      latitude: location.latitude,
      mset_code: statusData.mset_code,
      process_stat: '1', // Always '1' for final submission
      status: statusData.status,
      longitude: location.longitude,
    };

    Object.entries(requestData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    logStep('Sending attendance submission', requestData);

    const response = await axios.post<AttendanceSubmissionResponse>(
      `${ATTENDANCE_API_BASE}/saveLocation1.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // Longer timeout for image upload
      }
    );

    logStep('Attendance submission response received', response.data);
    
    if (response.data.success === 1) {
      logStep('Attendance submission successful');
    } else {
      logStep('Attendance submission failed', response.data.message);
    }

    return response.data;
  } catch (error) {
    logStep('Error in attendance submission', error);
    throw error;
  }
};

// Helper function for retry mechanism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get trip report data with retry mechanism
export const getTripReport = async (retryCount = 0): Promise<TripReportResponse> => {
  const maxRetries = 3;
  const retryDelay = 1000 * (retryCount + 1); // Progressive delay: 1s, 2s, 3s
  
  try {
    logStep('Getting trip report data', { attempt: retryCount + 1, maxRetries: maxRetries + 1 });
    
    const userid = await getCurrentUserId();
    logStep('User ID obtained for trip report', userid);
    
    // Validate userid before proceeding
    if (!userid || userid.trim() === '') {
      logStepWithNotification('Tidak dapat mengambil ID pengguna. Silakan login ulang.', null, true, 'error');
      throw new Error('Invalid user ID');
    }
    
    const requestData: TripReportRequest = {
      userid,
    };

    logStep('Sending trip report request', requestData);
    logStep('API endpoint', `${ATTENDANCE_API_BASE}/getTripReport1.php`);

    const formData = new FormData();
    formData.append('userid', userid);

    const response = await axios.post<TripReportResponse>(
      `${ATTENDANCE_API_BASE}/getTripReport1.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 45000, // Extended timeout for production environment
        validateStatus: (status) => {
          logStep('HTTP response status', status);
          return status < 500; // Accept 4xx errors
        },
      }
    );

    logStep('Trip report response received', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    if (response.data && response.data.success) {
      logStep('Trip report successful', {
        date: response.data.mset_date,
        start_time: response.data.mset_start_time,
        start_address: response.data.mset_start_address,
      });
      return response.data;
    } else {
      logStep('Trip report failed or no data', {
        responseData: response.data,
        responseStatus: response.status
      });
      
      // Check if it's a valid response structure but with success: false
      if (response.data && typeof response.data === 'object') {
        logStep('Returning response data even though success is false');
        return {
          ...response.data,
          success: false
        } as TripReportResponse;
      }
      
      // If we get here and have retries left, try again
      if (retryCount < maxRetries) {
        logStepWithNotification(`Gagal mengambil data absensi, mencoba lagi... (${retryCount + 1}/${maxRetries + 1})`, { retryCount, maxRetries }, true, 'warning');
        await delay(retryDelay);
        return getTripReport(retryCount + 1);
      }
      
      // Return empty/default data instead of throwing error
      logStepWithNotification('Data absensi hari ini belum tersedia. Silakan coba lagi nanti.', null, true, 'info');
      return getDefaultTripReportResponse();
    }
  } catch (error) {
    logStep('Error in trip report', { error, attempt: retryCount + 1 });
    
    // Enhanced error logging for production debugging
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestURL: error.config?.url,
        requestMethod: error.config?.method,
        timeout: error.config?.timeout,
        headers: error.config?.headers,
        baseURL: error.config?.baseURL,
        isNetworkError: !error.response,
        isTimeoutError: error.code === 'ECONNABORTED',
        timestamp: new Date().toISOString()
      };
      
      logStep('Axios error details', errorDetails);
      
      // Log specific error types for better debugging
      if (error.code === 'ECONNABORTED') {
        logStepWithNotification('Koneksi timeout. Periksa koneksi internet Anda.', errorDetails, true, 'warning');
      } else if (!error.response) {
        logStepWithNotification('Tidak dapat terhubung ke server. Periksa koneksi internet.', errorDetails, true, 'warning');
      } else if (error.response.status >= 500) {
        logStepWithNotification('Server sedang bermasalah. Mencoba lagi...', errorDetails, true, 'warning');
      }
      
      // Retry on network errors or server errors (5xx)
      const shouldRetry = !error.response || error.response.status >= 500;
      if (shouldRetry && retryCount < maxRetries) {
        logStepWithNotification(`Koneksi bermasalah, mencoba lagi... (${retryCount + 1}/${maxRetries + 1})`, { retryCount, maxRetries }, true, 'warning');
        await delay(retryDelay);
        return getTripReport(retryCount + 1);
      }
    } else if (error instanceof Error) {
      logStep('General error details', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Retry on general errors if we have retries left
      if (retryCount < maxRetries) {
        logStepWithNotification(`Terjadi kesalahan, mencoba lagi... (${retryCount + 1}/${maxRetries + 1})`, { retryCount, maxRetries }, true, 'warning');
        await delay(retryDelay);
        return getTripReport(retryCount + 1);
      }
    } else {
      logStep('Unknown error type', error);
    }
    
    // Return empty data structure to maintain UI consistency
    logStepWithNotification('Tidak dapat mengambil data absensi. Silakan coba lagi nanti.', null, true, 'error');
    return getDefaultTripReportResponse();
  }
};

// Helper function to get default trip report response
const getDefaultTripReportResponse = (): TripReportResponse => {
  return {
    success: false,
    mset_date: '',
    mset_date_breakout: '',
    mset_date_breakin: '',
    mset_date_clockout: '',
    mset_start_time: '00:00:00',
    mset_start_address: '',
    mset_start_image: '',
    mset_break_out_time: '00:00:00',
    mset_break_out_address: null,
    mset_break_out_image: null,
    mset_break_in_time: '00:00:00',
    mset_break_in_address: null,
    mset_break_in_image: null,
    mset_end_time: '00:00:00',
    mset_end_address: null,
    mset_end_image: null,
  };
};

// Complete attendance flow
export const completeAttendanceFlow = async (
  barcode: string,
  imageUri: string
): Promise<{
  success: boolean;
  message: string;
  statusData?: StatusCheckResponse;
}> => {
  try {
    logStep('Starting complete attendance flow');
    
    // Step 1: Validate QR code and location
    const validationResult = await validateQRAndLocation(barcode);
    if (validationResult.success !== 1) {
      return {
        success: false,
        message: validationResult.message || 'QR code or location validation failed',
      };
    }

    // Step 2: Check attendance status
    const statusData = await checkAttendanceStatus();
    if (!statusData.success) {
      return {
        success: false,
        message: 'Failed to check attendance status',
      };
    }

    // Step 3: Submit attendance with photo
    const submissionResult = await submitAttendanceWithPhoto(imageUri, barcode, statusData);
    if (submissionResult.success !== 1) {
      return {
        success: false,
        message: submissionResult.message || 'Failed to submit attendance',
      };
    }

    logStep('Complete attendance flow successful');
    
    return {
      success: true,
      message: 'Attendance recorded successfully',
      statusData,
    };
  } catch (error) {
    logStep('Error in complete attendance flow', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export default {
  getCurrentLocation,
  reverseGeocode,
  validateQRAndLocation,
  checkAttendanceStatus,
  submitAttendanceWithPhoto,
  getTripReport,
  completeAttendanceFlow,
};