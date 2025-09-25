// QR Attendance Service
// Handles API calls for QR-based attendance system

import { reverseGeocode } from './locationService';

export interface LocationValidationRequest {
  process_stats: number;
  latitude: string;
  barcode: string;
  userid: string;
  longitude: string; // Fixed: API uses 'longitude' (corrected spelling)
}

export interface LocationValidationResponse {
  success: number;
  message?: string;
}

export interface StatusCheckResponse {
  success: boolean;
  mset_code: string;
  date: string;
  status: string;
  status_desc: string;
}

export interface AttendanceSubmissionRequest {
  image: Blob;
  filename: string;
  mset_code: string;
  barcode: string;
  userid: string;
  longitude: string; // Fixed: API uses 'longitude' (corrected spelling)
  latitude: string;
  status: string;
  address: string;
}

export interface AttendanceSubmissionResponse {
  success: number;
  message?: string;
}

// Testing interfaces
export interface SimpleAttendanceRequest {
  userid: string;
  address: string;
  barcode: string;
  latitude: string;
  longitude: string;
  mset_code: string;
  process_stat: string;
  status: string;
}

export interface ImageAttendanceRequest {
  userid: string;
  image: Blob;
  address: string;
  barcode: string;
  latitude: string;
  longitude: string;
  mset_code: string;
  process_stat: string;
  status: string;
}

const BASE_URL = 'http://attendance-api.shabuhachi.id';

/**
 * Retry mechanism for network requests
 */
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      const errorObj = error as any;
      
      // Don't retry on timeout errors or if it's the last attempt
      if (errorObj.name === 'AbortError' || attempt === maxRetries + 1) {
        throw error;
      }
      
      console.warn(`⚠️ Request attempt ${attempt} failed, retrying in ${delay}ms...`, errorObj.message || 'Unknown error');
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
  
  throw lastError;
};

/**
 * Generate filename based on current date and time
 * Format: attendance_YYYYMMDD_HHMMSS
 */
export const generateImageFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `attendance_${year}${month}${day}_${hours}${minutes}${seconds}`;
};

/**
 * Step 1: Validate QR code and user location
 */
export const validateLocation = async (
  request: LocationValidationRequest
): Promise<LocationValidationResponse> => {
  console.log('🚀 API Request - Validate Location:', {
    url: `${BASE_URL}/service/saveLocation1.php`,
    method: 'POST',
    payload: request
  });
  
  const formData = new FormData();
  formData.append('process_stat', request.process_stats.toString());
  formData.append('latitude', request.latitude);
  formData.append('barcode', request.barcode);
  formData.append('userid', request.userid);
  formData.append('longitude', request.longitude);
  
  // Log FormData contents
  console.log('📦 FormData Body Contents:', {
    process_stat: request.process_stats.toString(),
    latitude: request.latitude,
    barcode: request.barcode,
    userid: request.userid,
    longitude: request.longitude
  });

  return retryRequest(async () => {
    const startTime = Date.now();
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${BASE_URL}/service/saveLocation1.php`, {
        method: 'POST',
        // Don't set Content-Type header manually - browser will add boundary automatically
        body: formData,
        signal: controller.signal,
        // Add additional headers for better compatibility
        headers: {
          'Accept': 'application/json, text/plain, */*',
        },
      });
      
      clearTimeout(timeoutId);
    const endTime = Date.now();

    console.log(`⏱️ API Response Time: ${endTime - startTime}ms`);
    console.log('📡 API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read response as text first to avoid 'Already read' error
    const responseText = await response.text();
    console.log('✅ API Response - Validate Location:');
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Raw Response Text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📊 Parsed Response Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ JSON Parse Error - Response Text:', responseText);
      console.error('❌ Parse Error Details:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse JSON response: ${errorMessage}. Response: ${responseText.substring(0, 200)}...`);
    }
    return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorObj = fetchError as any;
      
      if (errorObj.name === 'AbortError') {
        console.error('❌ Request timeout - Location validation took too long');
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }
      
      console.error('❌ Network error during location validation:', fetchError);
      throw new Error('Network request failed. Please check your internet connection and try again.');
    }
  });
};

/**
 * Step 2: Check status for save location and attendance data
 */
export const checkAttendanceStatus = async (userId: string): Promise<StatusCheckResponse> => {
  try {
    // Create form data for POST request
    const formData = new FormData();
    formData.append('userid', userId);
    
    console.log('🚀 API Request - Check Status:', {
      url: `${BASE_URL}/service/checkStatus1.php`,
      method: 'POST',
      userid: userId
    });
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/service/checkStatus1.php`, {
      method: 'POST',
      body: formData,
    });
    const endTime = Date.now();

    console.log(`⏱️ API Response Time: ${endTime - startTime}ms`);
    console.log('📡 API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read response as text first to avoid 'Already read' error
    const responseText = await response.text();
    console.log('✅ API Response - Check Status:');
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Raw Response Text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📊 Parsed Response Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ JSON Parse Error - Response Text:', responseText);
      console.error('❌ Parse Error Details:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse JSON response: ${errorMessage}. Response: ${responseText.substring(0, 200)}...`);
    }
    return data;
  } catch (error) {
    console.error('❌ Error checking attendance status:', error);
    throw error;
  }
};

/**
 * Step 3: Submit attendance with selfie image
 */
export const submitAttendance = async (
  request: AttendanceSubmissionRequest
): Promise<AttendanceSubmissionResponse> => {
  console.log('🚀 API Request - Submit Attendance:', {
    url: `${BASE_URL}/service/saveLocation1.php`,
    method: 'POST',
    payload: {
      filename: request.filename,
      mset_code: request.mset_code,
      barcode: request.barcode,
      userid: request.userid,
      longitude: request.longitude,
      latitude: request.latitude,
      status: request.status,
      address: request.address,
      imageSize: request.image.size || 'unknown'
    }
  });
  
  // Validate required data before FormData construction
  if (!request.image || !(request.image instanceof Blob)) {
    throw new Error('Invalid image data: must be a Blob object');
  }
  
  if (!request.filename || typeof request.filename !== 'string') {
    throw new Error('Invalid filename: must be a non-empty string');
  }
  
  // Validate all string parameters
  const requiredStringParams = ['userid', 'address', 'barcode', 'latitude', 'mset_code', 'status', 'longitude'];
  for (const param of requiredStringParams) {
    const value = request[param as keyof AttendanceSubmissionRequest];
    if (!value || typeof value !== 'string') {
      throw new Error(`Invalid ${param}: must be a non-empty string`);
    }
  }
  
  console.log('✅ All FormData parameters validated successfully');
  
  const formData = new FormData();
  formData.append('userid', request.userid);
  formData.append('version', '1.4.0'); // Added: Version parameter as shown in APIDOG reference
  formData.append('image', request.image, request.filename);
  formData.append('address', request.address);
  formData.append('barcode', request.barcode);
  formData.append('latitude', request.latitude);
  formData.append('mset_code', request.mset_code);
  formData.append('process_stat', '1');
  formData.append('status', request.status);
  formData.append('longitude', request.longitude); // Fixed: Now consistent with API parameter name
  
  // Debug: Log individual FormData entries
  console.log('🔍 FormData Debug - Individual entries:');
  // @ts-ignore - FormData.entries() typing issue in React Native
  for (const [key, value] of formData.entries()) {
    if (key === 'image') {
      console.log(`  ${key}: [File object - ${request.filename}]`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  // Log FormData contents
  console.log('📦 FormData Body Contents:', {
    userid: request.userid,
    version: '1.4.0',
    image: `File: ${request.filename} (${request.image.size} bytes)`,
    address: request.address,
    barcode: request.barcode,
    latitude: request.latitude,
    mset_code: request.mset_code,
    process_stat: '1',
    status: request.status,
    longitude: request.longitude
  });

  return retryRequest(async () => {
    const startTime = Date.now();
    
    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for file upload
    
    try {
      console.log('🌐 Making fetch request to:', `${BASE_URL}/service/saveLocation1.php`);
      
      const response = await fetch(`${BASE_URL}/service/saveLocation1.php`, {
        method: 'POST',
        // Don't set Content-Type header manually - browser will add boundary automatically
        body: formData,
        signal: controller.signal,
        // Enhanced headers for better compatibility and CORS handling
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        // Add mode and credentials for CORS handling
        mode: 'cors',
        credentials: 'omit',
      });
      
      clearTimeout(timeoutId);
    const endTime = Date.now();

    console.log(`⏱️ API Response Time: ${endTime - startTime}ms`);
    console.log('📡 API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read response as text first to avoid 'Already read' error
    const responseText = await response.text();
    console.log('✅ API Response - Submit Attendance:');
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Raw Response Text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📊 Parsed Response Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ JSON Parse Error - Response Text:', responseText);
      console.error('❌ Parse Error Details:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse JSON response: ${errorMessage}. Response: ${responseText.substring(0, 200)}...`);
    }
    return data;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const errorObj = fetchError as any;
      
      // Enhanced error logging for better debugging
      console.error('❌ Fetch Error Details:', {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
        cause: errorObj.cause,
        type: typeof errorObj,
        constructor: errorObj.constructor?.name
      });
      
      if (errorObj.name === 'AbortError') {
        console.error('❌ Request timeout - Attendance submission took too long');
        throw new Error('Upload timeout. The file might be too large or your connection is slow. Please try again.');
      }
      
      // Handle specific network error types
      if (errorObj.name === 'TypeError' && errorObj.message.includes('Failed to fetch')) {
        console.error('❌ CORS or Network connectivity issue detected');
        throw new Error('Unable to connect to server. This might be a CORS issue or network connectivity problem. Please check your internet connection and try again.');
      }
      
      if (errorObj.message?.includes('NetworkError') || errorObj.message?.includes('network')) {
        console.error('❌ Network connectivity issue');
        throw new Error('Network connectivity issue. Please check your internet connection and try again.');
      }
      
      console.error('❌ Network error during attendance submission:', fetchError);
      throw new Error(`Network request failed: ${errorObj.message || 'Unknown error'}. Please check your internet connection and try again.`);
    }
  }, 1); // Only 1 retry for file uploads to avoid multiple large uploads
};

/**
 * Fallback submission using XMLHttpRequest
 * Used when fetch API fails due to CORS or other issues
 */
const submitAttendanceXHR = async (
  request: AttendanceSubmissionRequest
): Promise<AttendanceSubmissionResponse> => {
  console.log('🔄 Attempting fallback submission using XMLHttpRequest');
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    // Prepare FormData
    formData.append('userid', request.userid);
    formData.append('version', '1.4.0');
    formData.append('image', request.image, request.filename);
    formData.append('address', request.address);
    formData.append('barcode', request.barcode);
    formData.append('latitude', request.latitude);
    formData.append('mset_code', request.mset_code);
    formData.append('process_stat', '1');
    formData.append('status', request.status);
    formData.append('longitude', request.longitude);
    
    xhr.open('POST', `${BASE_URL}/service/saveLocation1.php`, true);
    
    // Set headers
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    
    // Set timeout
    xhr.timeout = 60000; // 60 seconds
    
    xhr.onload = function() {
      console.log('📡 XHR Response Status:', xhr.status);
      console.log('📄 XHR Response Text:', xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('✅ XHR Success - Parsed Response:', data);
          resolve(data);
        } catch (parseError) {
          console.error('❌ XHR JSON Parse Error:', parseError);
          reject(new Error(`Failed to parse JSON response: ${parseError}. Response: ${xhr.responseText.substring(0, 200)}...`));
        }
      } else {
        console.error('❌ XHR HTTP Error:', xhr.status, xhr.statusText);
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    };
    
    xhr.onerror = function() {
      console.error('❌ XHR Network Error');
      reject(new Error('XMLHttpRequest network error. Please check your internet connection.'));
    };
    
    xhr.ontimeout = function() {
      console.error('❌ XHR Timeout');
      reject(new Error('XMLHttpRequest timeout. The upload took too long.'));
    };
    
    console.log('🚀 Sending XHR request...');
    xhr.send(formData);
  });
};

/**
 * Complete QR Attendance Flow
 * Combines all steps: validate location -> check status -> submit attendance
 */
export const completeQRAttendanceFlow = async (
  barcode: string,
  userid: string,
  latitude: string,
  longitude: string,
  selfieImage: Blob
) => {
  try {
    console.log('🔄 Starting QR Attendance Flow:');
    console.log('📋 Input Parameters:', {
      barcode: barcode,
      userid: userid,
      latitude: latitude,
      longitude: longitude,
      selfieImage: {
        size: selfieImage.size || 'unknown',
        type: selfieImage.type || 'unknown',
        name: (selfieImage as File).name || 'blob'
      }
    });
    
    const flowStartTime = Date.now();
    
    // Step 1: Validate location
    console.log('📍 Step 1: Validating location...');
    const locationValidation = await validateLocation({
      process_stats: 0,
      latitude,
      barcode,
      userid,
      longitude: longitude,
    });

    if (locationValidation.success !== 1) {
      throw new Error(locationValidation.message || 'Location validation failed');
    }
    console.log('✅ Step 1 completed: Location validated');

    // Step 2: Check status
    console.log('📋 Step 2: Checking attendance status...');
    const statusCheck = await checkAttendanceStatus(userid);

    if (!statusCheck.success) {
      throw new Error('Status check failed');
    }
    console.log('✅ Step 2 completed: Status checked');

    // Step 2.5: Validate mset_code (SKIPPED FOR DEVELOPMENT)
    console.log('🔍 Step 2.5: Validating mset_code...');
    // DEVELOPMENT MODE: Skip mset_code validation
    if (!statusCheck.mset_code || statusCheck.mset_code.trim() === '') {
      console.warn('⚠️ mset_code is empty/invalid, but continuing for development purposes');
      // Use fallback mset_code for development
      statusCheck.mset_code = '12345';
    }
    console.log('✅ Step 2.5 completed: mset_code processed (dev mode):', statusCheck.mset_code);

    // Step 2.6: Get address from coordinates
     console.log('🗺️ Step 2.6: Getting address from coordinates...');
     let address = '';
     try {
       address = await reverseGeocode(latitude, longitude);
       console.log('✅ Step 2.6 completed: Address obtained:', address);
     } catch (geocodeError) {
       console.warn('⚠️ Reverse geocoding failed, using fallback address:', geocodeError);
       address = `Lat: ${latitude}, Lng: ${longitude}`;
     }

     // Step 3: Submit attendance with selfie
     console.log('📸 Step 3: Submitting attendance with selfie...');
     const filename = generateImageFilename();
     
     // TESTING MODE: Try different submission methods to isolate the issue
     console.log('🧪🧪🧪 TESTING MODE ACTIVATED: Trying different submission methods...');
     console.log('🔍 DEBUG: About to start systematic testing approach');
     
     let attendanceSubmission: AttendanceSubmissionResponse;
     
     try {
       // TEST 1: Try submission without image (mimicking validateLocation)
       console.log('🧪🧪 TEST 1 STARTING: Attempting submission without image (like validateLocation)...');
       console.log('🔍 TEST 1 DEBUG: Parameters prepared, calling submitAttendanceSimple');
       attendanceSubmission = await submitAttendanceSimple({
         userid: userid,
         address: address,
         barcode: barcode,
         latitude: latitude,
         longitude: longitude,
         mset_code: statusCheck.mset_code,
         process_stat: '1',
         status: statusCheck.status
       });
       console.log('✅✅ TEST 1 SUCCESS: Submission without image worked!');
     } catch (error1) {
       console.log('❌❌ TEST 1 FAILED:', error1);
       
       // TEST 2: Try submission with image but simple headers
       try {
         console.log('🧪🧪 TEST 2 STARTING: Attempting submission with image but simple headers...');
         console.log('🔍 TEST 2 DEBUG: Parameters prepared, calling submitAttendanceWithImageSimpleHeaders');
         attendanceSubmission = await submitAttendanceWithImageSimpleHeaders({
           userid: userid,
           image: selfieImage,
           address: address,
           barcode: barcode,
           latitude: latitude,
           longitude: longitude,
           mset_code: statusCheck.mset_code,
           process_stat: '1',
           status: statusCheck.status
         });
         console.log('✅✅ TEST 2 SUCCESS: Submission with image and simple headers worked!');
       } catch (error2) {
         console.log('❌❌ TEST 2 FAILED:', error2);
         
         // TEST 3: Fall back to original unified method
         console.log('🧪🧪 TEST 3 STARTING: Falling back to original unified method...');
         console.log('🔍 TEST 3 DEBUG: Parameters prepared, calling submitAttendanceUnified');
         attendanceSubmission = await submitAttendanceUnified({
           userid: userid,
           image: selfieImage,
           filename: filename,
           address: address,
           barcode: barcode,
           latitude: latitude,
           longitude: longitude,
           mset_code: statusCheck.mset_code,
           status: statusCheck.status
         });
         console.log('✅✅ TEST 3 SUCCESS: Original unified method worked!');
       }
     }

    if (attendanceSubmission.success !== 1) {
      throw new Error(attendanceSubmission.message || 'Attendance submission failed');
    }
    
    const flowEndTime = Date.now();
    console.log(`🎉 QR Attendance Flow completed successfully in ${flowEndTime - flowStartTime}ms`);
    console.log('✅ Step 3 completed: Attendance submitted');

    return {
      success: true,
      statusData: statusCheck,
      submissionData: attendanceSubmission,
    };
  } catch (error) {
    console.error('❌ QR Attendance flow error:', error);
    throw error;
  }
};

/**
 * Unified attendance submission with automatic fallback
 * Tries fetch first, then XMLHttpRequest if fetch fails
 */
export const submitAttendanceUnified = async (
  request: AttendanceSubmissionRequest
): Promise<AttendanceSubmissionResponse> => {
  console.log('🚀 Starting unified attendance submission...');
  
  try {
    // Try fetch method first
    console.log('📡 Attempting fetch method...');
    return await submitAttendance(request);
  } catch (fetchError) {
    console.warn('⚠️ Fetch method failed, trying XMLHttpRequest fallback...');
    console.error('Fetch error details:', fetchError);
    
    try {
      // Fallback to XMLHttpRequest
      console.log('🔄 Attempting XMLHttpRequest fallback...');
      return await submitAttendanceXHR(request);
    } catch (xhrError) {
      console.error('❌ Both fetch and XMLHttpRequest failed');
      console.error('Fetch error:', fetchError);
      console.error('XHR error:', xhrError);
      
      // Throw a comprehensive error
      const fetchMsg = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      const xhrMsg = xhrError instanceof Error ? xhrError.message : 'Unknown XHR error';
      throw new Error(`All submission methods failed. Fetch: ${fetchMsg}. XHR: ${xhrMsg}`);
    }
  }
};

/**
 * Test function: Submit attendance using the same request structure as validateLocation
 * This helps isolate whether the issue is with headers, file upload, or other factors
 */
export const submitAttendanceSimple = async (
  request: SimpleAttendanceRequest
): Promise<AttendanceSubmissionResponse> => {
  console.log('🧪 TEST: Simple attendance submission (mimicking validateLocation structure)');
  
  // Use the EXACT same structure as validateLocation
  const formData = new FormData();
  formData.append('userid', request.userid);
  formData.append('version', '1.4.0');
  formData.append('address', request.address);
  formData.append('barcode', request.barcode);
  formData.append('latitude', request.latitude);
  formData.append('mset_code', request.mset_code);
  formData.append('process_stat', '1');
  formData.append('status', request.status);
  formData.append('longitude', request.longitude);
  // NOTE: Intentionally NOT including image to test if that's the issue
  
  console.log('📦 Simple FormData Contents (NO IMAGE):', {
    userid: request.userid,
    version: '1.4.0',
    address: request.address,
    barcode: request.barcode,
    latitude: request.latitude,
    mset_code: request.mset_code,
    process_stat: '1',
    status: request.status,
    longitude: request.longitude
  });

  const startTime = Date.now();
  
  // Create AbortController for timeout handling (same as validateLocation)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (same as validateLocation)
  
  try {
    console.log('🌐 Making SIMPLE fetch request to:', `${BASE_URL}/service/saveLocation1.php`);
    
    // Use EXACT same fetch configuration as validateLocation
    const response = await fetch(`${BASE_URL}/service/saveLocation1.php`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      // Use EXACT same headers as validateLocation
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      // NO mode: 'cors' or credentials: 'omit' (same as validateLocation)
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();

    console.log(`⏱️ Simple API Response Time: ${endTime - startTime}ms`);
    console.log('📡 Simple API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Simple API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Read response as text first to avoid 'Already read' error
    const responseText = await response.text();
    console.log('✅ Simple API Response:');
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Raw Response Text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📊 Simple Parsed Response Data:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Simple JSON Parse Error - Response Text:', responseText);
      console.error('❌ Parse Error Details:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse JSON response: ${errorMessage}. Response: ${responseText.substring(0, 200)}...`);
    }
    return data;
  } catch (fetchError) {
    clearTimeout(timeoutId);
    const errorObj = fetchError as any;
    
    console.error('❌ Simple Fetch Error Details:', {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
      cause: errorObj.cause,
      type: typeof errorObj,
      constructor: errorObj.constructor?.name
    });
    
    if (errorObj.name === 'AbortError') {
      console.error('❌ Simple Request timeout');
      throw new Error('Simple request timeout. Please check your internet connection and try again.');
    }
    
    console.error('❌ Simple Network error:', fetchError);
    throw new Error(`Simple network request failed: ${errorObj.message || 'Unknown error'}. Please check your internet connection and try again.`);
  }
};

/**
 * Test function: Submit attendance with image but using validateLocation headers
 */
export const submitAttendanceWithImageSimpleHeaders = async (
  request: ImageAttendanceRequest
): Promise<AttendanceSubmissionResponse> => {
  console.log('🧪 TEST: Attendance submission with image but simple headers');
  
  const formData = new FormData();
  formData.append('userid', request.userid);
  formData.append('version', '1.4.0');
  const filename = generateImageFilename();
  formData.append('image', request.image, filename); // Include image
  formData.append('address', request.address);
  formData.append('barcode', request.barcode);
  formData.append('latitude', request.latitude);
  formData.append('mset_code', request.mset_code);
  formData.append('process_stat', '1');
  formData.append('status', request.status);
  formData.append('longitude', request.longitude);
  
  console.log('📦 Image + Simple Headers FormData:', {
    userid: request.userid,
    version: '1.4.0',
    image: `File: ${filename} (${request.image.size} bytes)`,
    address: request.address,
    barcode: request.barcode,
    latitude: request.latitude,
    mset_code: request.mset_code,
    process_stat: '1',
    status: request.status,
    longitude: request.longitude
  });

  const startTime = Date.now();
  
  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // Keep 60s for file upload
  
  try {
    console.log('🌐 Making IMAGE + SIMPLE HEADERS fetch request to:', `${BASE_URL}/service/saveLocation1.php`);
    
    // Use simple headers like validateLocation but keep longer timeout for image
    const response = await fetch(`${BASE_URL}/service/saveLocation1.php`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      // Use EXACT same headers as validateLocation
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
      // NO mode: 'cors' or credentials: 'omit' (same as validateLocation)
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();

    console.log(`⏱️ Image + Simple Headers Response Time: ${endTime - startTime}ms`);
    console.log('📡 Image + Simple Headers Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Image + Simple Headers Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log('✅ Image + Simple Headers API Response:');
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📄 Raw Response Text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('📊 Image + Simple Headers Parsed Response:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Image + Simple Headers JSON Parse Error:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`Failed to parse JSON response: ${errorMessage}. Response: ${responseText.substring(0, 200)}...`);
    }
    return data;
  } catch (fetchError) {
    clearTimeout(timeoutId);
    const errorObj = fetchError as any;
    
    console.error('❌ Image + Simple Headers Fetch Error:', {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack
    });
    
    if (errorObj.name === 'AbortError') {
      console.error('❌ Image + Simple Headers timeout');
      throw new Error('Image upload timeout with simple headers.');
    }
    
    console.error('❌ Image + Simple Headers Network error:', fetchError);
    throw new Error(`Image + Simple Headers network request failed: ${errorObj.message || 'Unknown error'}`);
  }
};