// src/services/attendanceQRService.ts
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';

// Constants
const ATTENDANCE_API_BASE = 'http://attendance-api.shabuhachi.id/service';
const DEVELOPMENT_MODE = false; // Use __DEV__ for React Native development mode

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

const logStep = (step: string, data?: any) => {
  console.log(`[ATTENDANCE QR] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

// Get current user ID
const getCurrentUserId = async (): Promise<string> => {
  if (DEVELOPMENT_MODE) {
    logStep('Using dummy user ID for development');
    return DUMMY_DATA.userid;
  }
  
  try {
    const userProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (userProfile) {
      const user = JSON.parse(userProfile);
      return user.uid || user._id || user.username;
    }
    throw new Error('User profile not found');
  } catch (error) {
    logStep('Error getting user ID', error);
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

// Get trip report data
export const getTripReport = async (): Promise<TripReportResponse> => {
  try {
    logStep('Getting trip report data');
    
    const userid = await getCurrentUserId();
    
    const requestData: TripReportRequest = {
      userid,
    };

    logStep('Sending trip report request', requestData);

    const formData = new FormData();
    formData.append('userid', userid);

    const response = await axios.post<TripReportResponse>(
      `${ATTENDANCE_API_BASE}/getTripReport1.php`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000,
      }
    );

    logStep('Trip report response received', response.data);
    
    if (response.data.success) {
      logStep('Trip report successful', {
        date: response.data.mset_date,
        start_time: response.data.mset_start_time,
        start_address: response.data.mset_start_address,
      });
    } else {
      logStep('Trip report failed');
    }

    return response.data;
  } catch (error) {
    logStep('Error in trip report', error);
    throw error;
  }
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