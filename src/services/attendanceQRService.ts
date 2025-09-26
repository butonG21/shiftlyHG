// src/services/attendanceQRService.ts
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from './authService';
import { STORAGE_KEYS } from '../constants/storage';

// Constants
const ATTENDANCE_API_BASE = 'http://attendance-api.shabuhachi.id/service';
const DEVELOPMENT_MODE = __DEV__; // Use __DEV__ for React Native development mode

// Security constants

const LOCATION_VALIDATION = {
  MAX_ACCURACY_METERS: 100, // Maximum acceptable location accuracy
  MIN_COORDINATE_PRECISION: 4, // Minimum decimal places for coordinates
  MAX_LOCATION_AGE_MS: 300000, // 5 minutes max age for location data
};

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

// Security validation functions

export const validateUserAuthentication = async (): Promise<{ isValid: boolean; error?: string; userId?: string }> => {
  try {
    const profile = await getUserProfile();
    
    // Debug logging
    logStep('Profile validation debug', {
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : [],
      uid: profile?.uid,
      _id: profile?._id,
      username: profile?.name
    });
    
    if (!profile) {
      return { isValid: false, error: 'User not authenticated. Please log in again.' };
    }

    if (!profile.uid) {
      logStep('Profile validation failed - missing uid', {
        hasUid: !!profile.uid,
        uid: profile.uid
      });
      return { isValid: false, error: 'Invalid user profile. Please log in again.' };
    }

    // Check if user has required fields for attendance
    const employeeId = profile.username || profile.name;
    if (!employeeId) {
      logStep('Profile validation failed - missing employee identifier', { 
        username: profile.username,
        name: profile.name,
        employeeId: employeeId
      });
      return { isValid: false, error: 'Employee ID not found. Please contact administrator.' };
    }
    
    logStep('Employee ID found', { employeeId });

    // Additional security: Check if user has recent activity (if metadata exists)
    if (profile.metadata && profile.metadata.lastLoginAt) {
      const lastLogin = new Date(profile.metadata.lastLoginAt);
      const daysSinceLogin = (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > 90) { // 90 days inactive
        logStep('Warning: User has been inactive for more than 90 days');
      }
    }

    return { isValid: true, userId: profile.uid };
  } catch (error) {
    logStep('Error validating user authentication', error);
    return { isValid: false, error: 'Authentication validation failed' };
  }
};

export const validateLocationData = (location: LocationData, accuracy?: number): { isValid: boolean; error?: string } => {
  try {
    // Check if location data exists
    if (!location || !location.latitude || !location.longitude) {
      return { isValid: false, error: 'Location data is required' };
    }

    // Parse coordinates
    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);

    // Check if coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
      return { isValid: false, error: 'Invalid location coordinates' };
    }

    // Check coordinate ranges
    if (lat < -90 || lat > 90) {
      return { isValid: false, error: 'Invalid latitude range' };
    }

    if (lng < -180 || lng > 180) {
      return { isValid: false, error: 'Invalid longitude range' };
    }

    // Check coordinate precision (minimum decimal places)
    const latPrecision = (location.latitude.split('.')[1] || '').length;
    const lngPrecision = (location.longitude.split('.')[1] || '').length;
    
    if (latPrecision < LOCATION_VALIDATION.MIN_COORDINATE_PRECISION || 
        lngPrecision < LOCATION_VALIDATION.MIN_COORDINATE_PRECISION) {
      return { isValid: false, error: 'Location precision is insufficient' };
    }

    // Check accuracy if provided
    if (accuracy && accuracy > LOCATION_VALIDATION.MAX_ACCURACY_METERS) {
      return { isValid: false, error: 'Location accuracy is insufficient. Please try again in an open area.' };
    }

    return { isValid: true };
  } catch (error) {
    logStep('Error validating location data', error);
    return { isValid: false, error: 'Location validation failed' };
  }
};

export const validateAttendanceRequest = async (barcode: string, location: LocationData): Promise<{ isValid: boolean; error?: string }> => {
  try {
    // Validate user authentication
    const authValidation = await validateUserAuthentication();
    if (!authValidation.isValid) {
      return authValidation;
    }

    // Validate location data
    const locationValidation = validateLocationData(location);
    if (!locationValidation.isValid) {
      return locationValidation;
    }

    logStep('All attendance request validations passed');
    return { isValid: true };
  } catch (error) {
    logStep('Error in attendance request validation', error);
    return { isValid: false, error: 'Attendance validation failed' };
  }
};

const logStep = (step: string, data?: any) => {
  console.log(`[ATTENDANCE QR] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

// Get current user ID
const getCurrentUserId = async (): Promise<string> => {
  try {
    // Always try to get real user data first
    const userProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (userProfile) {
      const user = JSON.parse(userProfile);
      const userId = user.uid || user._id || user.username;
      if (userId) {
        logStep('Using authenticated user ID', { userId: userId.substring(0, 6) + '***' });
        return userId;
      }
    }
    
    // Fallback to dummy data only in development mode if no user found
    if (DEVELOPMENT_MODE) {
      logStep('Warning: No authenticated user found, using dummy data for development');
      return DUMMY_DATA.userid;
    }
    
    throw new Error('User not authenticated. Please login first.');
  } catch (error) {
    logStep('Error getting user ID', error);
    throw error;
  }
};

// Enhanced location data interface
interface EnhancedLocationData extends LocationData {
  accuracy?: number;
  timestamp?: number;
}

// Get current location
export const getCurrentLocation = async (): Promise<EnhancedLocationData> => {
  try {
    logStep('Requesting location permissions');
    
    // Always try to get real location first
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (DEVELOPMENT_MODE) {
        logStep('Warning: Location permission denied, using dummy location for development');
        return {
          latitude: DUMMY_DATA.latitude,
          longitude: DUMMY_DATA.longitude,
        };
      }
      throw new Error('Location permission is required for attendance. Please enable location access.');
    }

    logStep('Getting current position with high accuracy');
    
    // Try to get location with maximum accuracy, retry if needed
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        logStep(`Location attempt ${attempts}/${maxAttempts}`);
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy
          timeInterval: 1000, // Update interval in milliseconds
          distanceInterval: 1, // Update distance in meters
        });

        const locationData: EnhancedLocationData = {
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
          accuracy: location.coords.accuracy || undefined,
          timestamp: location.timestamp,
        };

        logStep('Location obtained', {
          latitude: locationData.latitude.substring(0, 8) + '***',
          longitude: locationData.longitude.substring(0, 8) + '***',
          accuracy: locationData.accuracy,
          age: Date.now() - (locationData.timestamp || 0),
          attempt: attempts
        });

        // Check if accuracy meets our requirement (≤ 100 meters)
        if (locationData.accuracy && locationData.accuracy <= LOCATION_VALIDATION.MAX_ACCURACY_METERS) {
          logStep(`✅ Location accuracy acceptable: ${locationData.accuracy}m (≤ ${LOCATION_VALIDATION.MAX_ACCURACY_METERS}m)`);
          return locationData;
        } else if (attempts < maxAttempts) {
          logStep(`⚠️ Location accuracy insufficient: ${locationData.accuracy}m (> ${LOCATION_VALIDATION.MAX_ACCURACY_METERS}m), retrying...`);
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        } else {
          // Last attempt, accept even if accuracy is not perfect
          logStep(`⚠️ Final attempt: Using location with accuracy ${locationData.accuracy}m`);
          return locationData;
        }
      } catch (attemptError) {
        logStep(`Location attempt ${attempts} failed`, attemptError);
        if (attempts === maxAttempts) {
          throw attemptError;
        }
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we reach here, all attempts failed
    throw new Error('Unable to get location with acceptable accuracy after multiple attempts.');
  } catch (error) {
    logStep('Error getting location', error);
    
    if (DEVELOPMENT_MODE) {
      logStep('Warning: Failed to get real location, using dummy location for development', error);
      return {
        latitude: DUMMY_DATA.latitude,
        longitude: DUMMY_DATA.longitude,
      };
    }
    
    throw new Error('Unable to get current location. Please ensure GPS is enabled and try again.');
  }
};

// Reverse geocoding to get address
export const reverseGeocode = async (latitude: string, longitude: string): Promise<string> => {
  try {
    logStep('Starting reverse geocoding', { 
      latitude: latitude.substring(0, 8) + '***', 
      longitude: longitude.substring(0, 8) + '***' 
    });
    
    // Always try to get real address first
    try {
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
        
        if (formattedAddress.trim()) {
          logStep('Real address obtained', formattedAddress.substring(0, 50) + '...');
          return formattedAddress;
        }
      }
    } catch (geocodeError) {
      logStep('Reverse geocoding failed, trying fallback', geocodeError);
    }
    
    // Fallback to dummy address only in development mode
    if (DEVELOPMENT_MODE) {
      const dummyAddress = 'MMX3+7M8, Sampora, Kecamatan Cisauk, Banten, Indonesia, 15341';
      logStep('Warning: Using dummy address for development', dummyAddress);
      return dummyAddress;
    }
    
    // In production, use coordinates as fallback
    const coordinateAddress = `Lat: ${latitude.substring(0, 8)}, Lng: ${longitude.substring(0, 8)}`;
    logStep('Using coordinate-based address as fallback', coordinateAddress);
    return coordinateAddress;
  } catch (error) {
    logStep('Error in reverse geocoding', error);
    throw error;
  }
};

// Step 1: Validate QR code and location
export const validateQRAndLocation = async (barcode: string): Promise<QRValidationResponse> => {
  try {
    logStep('Step 1: Starting QR code and location validation');
    
    // Security validation first
    const authValidation = await validateUserAuthentication();
    if (!authValidation.isValid) {
      throw new Error(authValidation.error);
    }

    const userid = authValidation.userId || await getCurrentUserId();
    const location = await getCurrentLocation();
    
    // Validate location data with accuracy check
    const locationValidation = validateLocationData(location, location.accuracy);
    if (!locationValidation.isValid) {
      throw new Error(locationValidation.error);
    }

    // Check location age
    if (location.timestamp && (Date.now() - location.timestamp) > LOCATION_VALIDATION.MAX_LOCATION_AGE_MS) {
      throw new Error('Location data is too old. Please try again.');
    }
    
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
    
    // Security validation
    const authValidation = await validateUserAuthentication();
    if (!authValidation.isValid) {
      throw new Error(authValidation.error);
    }

    const userid = authValidation.userId || await getCurrentUserId();
    
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
    
    // Security validation
    if (!imageUri || typeof imageUri !== 'string') {
      throw new Error('Valid photo is required for attendance submission');
    }

    const authValidation = await validateUserAuthentication();
    if (!authValidation.isValid) {
      throw new Error(authValidation.error);
    }

    // Validate status data
    if (!statusData || !statusData.mset_code || !statusData.status) {
      throw new Error('Invalid attendance status data');
    }

    const userid = authValidation.userId || await getCurrentUserId();
    const location = await getCurrentLocation();
    
    // Validate location data
    const locationValidation = validateLocationData(location, location.accuracy);
    if (!locationValidation.isValid) {
      throw new Error(locationValidation.error);
    }

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
  completeAttendanceFlow,
};