/**
 * Location Service for Web Application
 * Provides geolocation, address lookup, and distance calculation functionality
 */

class LocationService {
  constructor() {
    this.watchId = null;
    this.lastKnownPosition = null;
    this.listeners = new Set();
    
    // Mock Delhi coordinates as fallback
    this.fallbackLocation = {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 100
    };
  }

  /**
   * Get current position using browser geolocation API
   */
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          
          this.lastKnownPosition = location;
          this.notifyListeners(location);
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Location access failed';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch position changes
   */
  watchPosition(callback, errorCallback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 10000,
      ...options
    };

    if (!navigator.geolocation) {
      errorCallback?.(new Error('Geolocation is not supported'));
      return null;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        };
        
        this.lastKnownPosition = location;
        this.notifyListeners(location);
        callback(location);
      },
      (error) => {
        errorCallback?.(error);
      },
      defaultOptions
    );

    return this.watchId;
  }

  /**
   * Clear position watch
   */
  clearWatch() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Add location change listener
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of location change
   */
  notifyListeners(location) {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  /**
   * Convert degrees to radians
   */
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get address from coordinates using reverse geocoding
   */
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service (you can replace with Google Maps Geocoding API)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return {
          formattedAddress: data.display_name,
          street: data.address?.road || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
          postalCode: data.address?.postcode || ''
        };
      }
      
      throw new Error('No address found');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        street: '',
        city: 'Unknown',
        state: '',
        country: '',
        postalCode: ''
      };
    }
  }

  /**
   * Get coordinates from address using forward geocoding
   */
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name
        };
      }
      
      throw new Error('Address not found');
    } catch (error) {
      console.error('Forward geocoding error:', error);
      throw error;
    }
  }

  /**
   * Check if location services are enabled
   */
  async checkLocationPermission() {
    if (!this.isGeolocationAvailable) {
      return {
        enabled: false,
        status: 'unavailable',
        message: 'Geolocation is not available in this browser'
      };
    }

    try {
      // Try to get position to check if permission is granted
      await this.getCurrentPosition({ timeout: 5000 });
      return {
        enabled: true,
        status: 'granted',
        message: 'Location permission granted'
      };
    } catch (error) {
      return {
        enabled: false,
        status: 'denied',
        message: 'Location permission denied or unavailable'
      };
    }
  }

  /**
   * Request location permission
   */
  async requestLocationPermission() {
    if (!this.isGeolocationAvailable) {
      throw new Error('Geolocation is not available in this browser');
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      try {
        await this.getCurrentPosition({ timeout: 1000 });
        return 'granted';
      } catch {
        return 'denied';
      }
    }
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(latitude, longitude, precision = 6) {
    return {
      lat: parseFloat(latitude).toFixed(precision),
      lng: parseFloat(longitude).toFixed(precision),
      string: `${parseFloat(latitude).toFixed(precision)}, ${parseFloat(longitude).toFixed(precision)}`
    };
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(latitude, longitude) {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Get last known position
   */
  getLastKnownPosition() {
    return this.lastKnownPosition || this.fallbackLocation;
  }

  /**
   * Clear cached location data
   */
  clearCache() {
    this.lastKnownPosition = null;
    this.clearWatch();
  }

  /**
   * Calculate bearing between two points
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.toRad(lon2 - lon1);
    const lat1Rad = this.toRad(lat1);
    const lat2Rad = this.toRad(lat2);
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    const bearing = Math.atan2(y, x);
    return (bearing * 180 / Math.PI + 360) % 360; // Convert to degrees and normalize
  }

  /**
   * Get estimated travel time (placeholder implementation)
   */
  async getEstimatedTravelTime(fromLat, fromLon, toLat, toLon, mode = 'driving') {
    try {
      const distance = this.calculateDistance(fromLat, fromLon, toLat, toLon);
      
      // Rough estimates based on mode
      const speeds = {
        walking: 5, // km/h
        cycling: 15, // km/h
        driving: 40, // km/h (accounting for city traffic)
        transit: 25 // km/h
      };
      
      const speed = speeds[mode] || speeds.driving;
      const timeInHours = distance / speed;
      const timeInMinutes = Math.round(timeInHours * 60);
      
      return {
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        duration: timeInMinutes,
        mode: mode
      };
    } catch (error) {
      console.error('Error calculating travel time:', error);
      return {
        distance: 0,
        duration: 0,
        mode: mode
      };
    }
  }

  /**
   * Check if point is within radius of another point
   */
  isWithinRadius(lat1, lon1, lat2, lon2, radiusKm) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusKm;
  }

  /**
   * Generate route waypoints (simple linear interpolation)
   */
  generateRouteWaypoints(fromLat, fromLon, toLat, toLon, numberOfPoints = 10) {
    const waypoints = [];
    
    for (let i = 0; i <= numberOfPoints; i++) {
      const ratio = i / numberOfPoints;
      const lat = fromLat + (toLat - fromLat) * ratio;
      const lon = fromLon + (toLon - fromLon) * ratio;
      
      waypoints.push({
        latitude: lat,
        longitude: lon,
        index: i
      });
    }
    
    return waypoints;
  }

  // Legacy compatibility methods
  async init() { return true; }
  getCurrentLocation(options) { return this.getCurrentPosition(options); }
  startForegroundTracking(callback, options) { return this.watchPosition(callback, options); }
  stopForegroundTracking() { return this.clearWatch(); }
}

export default new LocationService();