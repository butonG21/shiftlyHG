// Location Service
// Handles GPS location permissions and retrieval

import * as Location from 'expo-location';

// Location accuracy constants
const LOCATION_ACCURACY = {
  HIGH: Location.Accuracy.High,
  BALANCED: Location.Accuracy.Balanced,
  LOW: Location.Accuracy.Low,
} as const;

// Testing mode configuration
const TESTING_MODE = {
  enabled: true, // Set to false for production
  dummyLocation: {
    latitude: '-6.3018433',
    longitude: '106.6542219'
  }
};

/**
 * Enable or disable testing mode
 */
export const setTestingMode = (enabled: boolean, customLocation?: LocationCoordinates) => {
  TESTING_MODE.enabled = enabled;
  if (customLocation) {
    TESTING_MODE.dummyLocation = customLocation;
  }
  console.log(`🧪 Testing mode ${enabled ? 'enabled' : 'disabled'}`);
  if (enabled) {
    console.log(`📍 Using dummy location: ${TESTING_MODE.dummyLocation.latitude}, ${TESTING_MODE.dummyLocation.longitude}`);
  }
};

/**
 * Check if testing mode is currently enabled
 */
export const isTestingModeEnabled = (): boolean => {
  return TESTING_MODE.enabled;
};

/**
 * Get current dummy location
 */
export const getDummyLocation = (): LocationCoordinates => {
  return TESTING_MODE.dummyLocation;
};

export interface LocationCoordinates {
  latitude: string;
  longitude: string;
}

export interface LocationError {
  code: string;
  message: string;
}

/**
 * Request location permissions from the user
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Check if location permissions are already granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

/**
 * Get current GPS coordinates
 */
export const getCurrentLocation = async (): Promise<LocationCoordinates> => {
  try {
    // Check if permission is granted
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) {
        throw new Error('Location permission is required for attendance');
      }
    }

    console.log('Requesting current location with highest accuracy...');
    
    // Get current position with highest accuracy for maximum precision
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
      timeInterval: 1000,
      distanceInterval: 0.5,
    });
    
    console.log('Location request completed:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    });

    return {
      latitude: location.coords.latitude.toString(),
      longitude: location.coords.longitude.toString(),
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw new Error('Failed to get current location. Please ensure GPS is enabled.');
  }
};

/**
 * Get location with timeout and retry mechanism
 */
export const getCurrentLocationWithRetry = async (
  maxRetries: number = 3,
  timeoutMs: number = 20000
): Promise<LocationCoordinates> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Getting location - attempt ${attempt}/${maxRetries}`);
      
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Location request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between location request and timeout
      const location = await Promise.race([
        getCurrentLocation(),
        timeoutPromise
      ]);
      
      console.log('Location obtained successfully:', location);
      return location;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Location attempt ${attempt} failed:`, error);
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = attempt * 500; // Reduced wait time for faster retry
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Failed to get location after multiple attempts');
};

/**
 * Check if location services are enabled
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
};

/**
 * Get location using watch position for faster initial response
 */
export const getFastAccurateLocation = async (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    let watchSubscription: Location.LocationSubscription | null = null;
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
      if (!resolved) {
        resolved = true;
        reject(new Error('Fast location timeout'));
      }
    }, 5000); // 5 second timeout for fast method
    
    const startWatch = async () => {
      try {
        watchSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High, // High instead of Highest for speed
            timeInterval: 100, // Very frequent updates
            distanceInterval: 0.1,
          },
          (location) => {
            if (!resolved && location.coords.accuracy && location.coords.accuracy <= 20) {
              resolved = true;
              clearTimeout(timeout);
              if (watchSubscription) {
                watchSubscription.remove();
              }
              
              const coordinates = {
                latitude: location.coords.latitude.toString(),
                longitude: location.coords.longitude.toString(),
              };
              
              console.log(`⚡ Fast location acquired - Accuracy: ${location.coords.accuracy}m`);
              resolve(coordinates);
            }
          }
        );
      } catch (error) {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      }
    };
    
    startWatch();
  });
};

/**
 * Get multiple location readings and return the most accurate one
 */
export const getHighAccuracyLocation = async (): Promise<LocationCoordinates> => {
  try {
    console.log('🎯 Getting optimized location readings...');
    const readings: Array<{ coords: LocationCoordinates; accuracy: number }> = [];
    const maxReadings = 2; // Reduced from 3 to 2 for faster processing
    const targetAccuracy = 10; // Stop early if we get accuracy better than 10m
    
    for (let i = 1; i <= maxReadings; i++) {
      try {
        console.log(`📍 Location reading ${i}/${maxReadings}...`);
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
            timeInterval: 300, // Reduced from 500ms
            distanceInterval: 0.1,
          });
        
        const accuracy = location.coords.accuracy || 999999;
        const coords = {
          latitude: location.coords.latitude.toString(),
          longitude: location.coords.longitude.toString(),
        };
        
        readings.push({ coords, accuracy });
        console.log(`✅ Reading ${i} completed - Accuracy: ${accuracy}m`);
        
        // Early exit if we get good enough accuracy
        if (accuracy <= targetAccuracy) {
          console.log(`🎯 Target accuracy achieved (${accuracy}m ≤ ${targetAccuracy}m), stopping early`);
          break;
        }
        
        // Shorter delay between readings
        if (i < maxReadings) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms
        }
      } catch (error) {
        console.warn(`⚠️ Reading ${i} failed:`, error);
      }
    }
    
    if (readings.length === 0) {
      throw new Error('Failed to get any location readings');
    }
    
    // Sort by accuracy (lower is better) and return the most accurate
    readings.sort((a, b) => a.accuracy - b.accuracy);
    const bestReading = readings[0];
    
    console.log(`🏆 Best accuracy: ${bestReading.accuracy}m from ${readings.length} readings`);
    return bestReading.coords;
  } catch (error) {
    console.error('❌ Error getting high accuracy location:', error);
    throw error;
  }
};

/**
 * Get location with comprehensive error handling and fallback strategy
 */
export const getLocationForAttendance = async (): Promise<LocationCoordinates> => {
  try {
    console.log('🎯 Starting location acquisition for attendance...');
    const startTime = Date.now();
    
    // Check if testing mode is enabled
    if (TESTING_MODE.enabled) {
      console.log('🧪 Testing mode enabled - Using dummy location data');
      console.log(`📍 Dummy coordinates: ${TESTING_MODE.dummyLocation.latitude}, ${TESTING_MODE.dummyLocation.longitude}`);
      
      // Simulate some delay to mimic real location acquisition
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const endTime = Date.now();
      console.log(`⚡ Location acquired successfully in ${endTime - startTime}ms`);
      return TESTING_MODE.dummyLocation;
    }
    
    // Check if location services are enabled
    console.log('🔍 Checking if location services are enabled...');
    const locationEnabled = await isLocationEnabled();
    if (!locationEnabled) {
      console.error('❌ Location services are disabled');
      throw new Error('Location services are disabled. Please enable GPS in your device settings.');
    }
    console.log('✅ Location services are enabled');

    let coordinates: LocationCoordinates;
    
    try {
       // Try fast watch position method first
       console.log('⚡ Attempting fast location acquisition...');
       coordinates = await getFastAccurateLocation();
       console.log('✅ Fast location acquisition successful');
     } catch (error) {
       console.warn('⚠️ Fast method failed, trying optimized readings...', error);
       
       try {
         // Try optimized multiple readings as second option
         const timeoutPromise = new Promise<never>((_, reject) => 
           setTimeout(() => reject(new Error('Location timeout')), 6000) // Reduced timeout
         );
         
         coordinates = await Promise.race([
           getHighAccuracyLocation(),
           timeoutPromise
         ]);
         
         console.log('✅ Optimized location readings successful');
       } catch (error2) {
         console.warn('⚠️ Optimized method also failed, falling back to single reading...', error2);
         
         // Fallback to single reading with balanced accuracy for speed
         const location = await Location.getCurrentPositionAsync({
           accuracy: Location.Accuracy.Balanced, // Faster than Highest
           timeInterval: 1000,
           distanceInterval: 1,
         });
         
         coordinates = {
           latitude: location.coords.latitude.toString(),
           longitude: location.coords.longitude.toString(),
         };
         
         console.log(`✅ Fallback location acquired`);
         console.log(`📊 Fallback accuracy: ${location.coords.accuracy}m`);
       }
     }
    
    const endTime = Date.now();
    console.log(`⚡ Location acquired successfully in ${endTime - startTime}ms`);
    
    // Validate coordinates
    console.log('🔍 Validating coordinates...');
    if (!coordinates.latitude || !coordinates.longitude) {
      console.error('❌ Invalid coordinates: missing latitude or longitude');
      throw new Error('Invalid location coordinates received');
    }
    
    const lat = parseFloat(coordinates.latitude);
    const lng = parseFloat(coordinates.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Invalid coordinates format:', { lat, lng });
      throw new Error('Invalid location coordinates format');
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error('❌ Coordinates out of range:', { lat, lng });
      throw new Error('Location coordinates are out of valid range');
    }
    
    console.log('✅ Coordinates validated successfully:', { lat, lng });
    return coordinates;
  } catch (error) {
    console.error('❌ Error getting location for attendance:', error);
    throw error;
  }
};

/**
 * Reverse geocode coordinates to get address
 * Converts latitude and longitude to human-readable address
 */
export const reverseGeocode = async (
  latitude: string,
  longitude: string
): Promise<string> => {
  try {
    console.log('🔄 Starting reverse geocoding process...');
    console.log(`📍 Input coordinates: ${latitude}, ${longitude}`);
    
    const startTime = Date.now();
    
    // Convert string coordinates to numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates provided');
    }
    
    console.log(`🔍 Performing reverse geocoding for: ${lat}, ${lng}`);
    
    // Use expo-location reverse geocoding
    const result = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });
    
    const endTime = Date.now();
    console.log(`⏱️ Reverse geocoding completed in ${endTime - startTime}ms`);
    console.log('📊 Reverse geocoding result:', JSON.stringify(result, null, 2));
    
    if (!result || result.length === 0) {
      console.warn('⚠️ No address found for coordinates, using fallback');
      return `Lat: ${latitude}, Lng: ${longitude}`;
    }
    
    const address = result[0];
    
    // Build formatted address string
    const addressParts = [];
    
    if (address.name) addressParts.push(address.name);
    if (address.street) addressParts.push(address.street);
    if (address.streetNumber) addressParts.push(address.streetNumber);
    if (address.district) addressParts.push(address.district);
    if (address.city) addressParts.push(address.city);
    if (address.region) addressParts.push(address.region);
    if (address.country) addressParts.push(address.country);
    if (address.postalCode) addressParts.push(address.postalCode);
    
    const formattedAddress = addressParts.length > 0 
      ? addressParts.join(', ')
      : `Lat: ${latitude}, Lng: ${longitude}`;
    
    console.log('✅ Formatted address:', formattedAddress);
    
    return formattedAddress;
  } catch (error) {
    console.error('❌ Error during reverse geocoding:', error);
    console.log('🔄 Falling back to coordinate string');
    
    // Fallback to coordinate string if reverse geocoding fails
    return `Lat: ${latitude}, Lng: ${longitude}`;
  }
};