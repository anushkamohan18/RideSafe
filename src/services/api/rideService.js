import axios from 'axios';
import { apiClient } from './apiClient';

// Import the base API instance - adjust path based on your API setup
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create a simple API instance if index.js doesn't exist
const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return { data: await response.json() };
  },
  
  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return { data: await response.json() };
  },
  
  patch: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return { data: await response.json() };
  }
};

// Create axios instance with base configuration
const rideClient = axios.create({
  baseURL: `${API_BASE_URL}/rides`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
rideClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
rideClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Ride API methods
export const rideAPI = {
  // Create a new ride request
  createRide: async (rideData) => {
    try {
      console.log('Creating ride with data:', rideData);
      
      // Validate required fields
      const requiredFields = ['pickupLatitude', 'pickupLongitude', 'dropoffLatitude', 'dropoffLongitude', 'pickupAddress', 'dropoffAddress'];
      for (const field of requiredFields) {
        if (!rideData[field] && rideData[field] !== 0) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // For development, always return mock success
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: returning mock response');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockRide = {
          id: Math.floor(Math.random() * 1000000),
          userId: 1,
          pickupLatitude: rideData.pickupLatitude,
          pickupLongitude: rideData.pickupLongitude,
          pickupAddress: rideData.pickupAddress,
          dropoffLatitude: rideData.dropoffLatitude,
          dropoffLongitude: rideData.dropoffLongitude,
          dropoffAddress: rideData.dropoffAddress,
          vehicleType: rideData.vehicleType,
          estimatedCost: rideData.estimatedCost,
          distance: rideData.distance,
          estimatedDuration: rideData.estimatedDuration,
          status: 'pending',
          createdAt: new Date().toISOString(),
          scheduledTime: rideData.scheduledTime,
          notes: rideData.notes,
          rideType: rideData.rideType,
          driver: null
        };
        
        return {
          data: {
            ride: mockRide,
            message: 'Ride created successfully'
          }
        };
      }

      // Try real API call
      const response = await apiClient.post('/rides', rideData);
      return response;
      
    } catch (error) {
      console.error('Ride creation error:', error);
      throw error;
    }
  },

  // Get ride by ID
  getRideById: async (rideId) => {
    try {
      console.log('Fetching ride:', rideId);
      
      // For development, return mock data but try to use stored ride data first
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to get stored ride data from sessionStorage first
        const storedRideData = sessionStorage.getItem(`ride_${rideId}`);
        let baseRideData = {};
        
        if (storedRideData) {
          try {
            baseRideData = JSON.parse(storedRideData);
            console.log('Using stored ride data:', baseRideData);
          } catch (e) {
            console.warn('Failed to parse stored ride data');
          }
        }
        
        // Simulate driver assignment after some time
        const hasDriver = Math.random() > 0.3; // 70% chance of having a driver
        
        const mockRide = {
          id: parseInt(rideId),
          userId: 1,
          // Use stored data if available, otherwise use defaults
          pickupLatitude: baseRideData.pickupLatitude || 19.0760,
          pickupLongitude: baseRideData.pickupLongitude || 72.8777,
          pickupAddress: baseRideData.pickupAddress || "Mumbai Central Station, Mumbai, Maharashtra, India",
          dropoffLatitude: baseRideData.dropoffLatitude || 19.0896,
          dropoffLongitude: baseRideData.dropoffLongitude || 72.8656,
          dropoffAddress: baseRideData.dropoffAddress || "Gateway of India, Mumbai, Maharashtra, India",
          vehicleType: baseRideData.vehicleType || 'car',
          estimatedCost: baseRideData.estimatedCost || 150.00,
          distance: baseRideData.distance || 8.5,
          estimatedDuration: baseRideData.estimatedDuration || 25,
          status: hasDriver ? 'accepted' : 'pending',
          createdAt: baseRideData.createdAt || new Date().toISOString(),
          scheduledTime: baseRideData.scheduledTime || null,
          notes: baseRideData.notes || '',
          rideType: baseRideData.rideType || 'now',
          driver: hasDriver ? {
            id: 1,
            name: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            rating: 4.8,
            total_rides: 245,
            vehicle: {
              make: 'Honda',
              model: 'City',
              license_plate: 'MH 01 AB 1234',
              color: 'White'
            },
            currentLocation: {
              latitude: (baseRideData.pickupLatitude || 19.0760) + (Math.random() - 0.5) * 0.01,
              longitude: (baseRideData.pickupLongitude || 72.8777) + (Math.random() - 0.5) * 0.01
            }
          } : null
        };
        
        return {
          data: {
            ride: mockRide
          }
        };
      }

      const response = await apiClient.get(`/rides/${rideId}`);
      return response;
      
    } catch (error) {
      console.error('Get ride error:', error);
      throw error;
    }
  },

  // Get user rides
  getUserRides: async (page = 1, limit = 20, status = null) => {
    try {
      // For development, return mock data
      if (process.env.NODE_ENV === 'development') {
        const mockRides = [
          {
            id: 1,
            pickup_address: "Mumbai Central Station",
            dropoff_address: "Gateway of India",
            estimated_cost: 150.00,
            status: 'completed',
            vehicle_type: 'car',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            driver: {
              name: 'Rajesh Kumar',
              rating: 4.8,
              vehicle: { make: 'Honda', model: 'City' }
            }
          },
          {
            id: 2,
            pickup_address: "Bandra West",
            dropoff_address: "Airport Terminal 2",
            estimated_cost: 320.00,
            status: 'in_progress',
            vehicle_type: 'suv',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            driver: {
              name: 'Priya Sharma',
              rating: 4.9,
              vehicle: { make: 'Toyota', model: 'Innova' }
            }
          },
          {
            id: 3,
            pickup_address: "Andheri East",
            dropoff_address: "Powai Lake",
            estimated_cost: 180.00,
            status: 'cancelled',
            vehicle_type: 'car',
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            driver: null // Cancelled rides don't show driver info
          }
        ];

        const filteredRides = status ? mockRides.filter(ride => ride.status === status) : mockRides;
        
        return {
          data: {
            rides: filteredRides,
            total: filteredRides.length,
            page,
            limit
          }
        };
      }

      const params = { page, limit };
      if (status) params.status = status;
      
      const response = await apiClient.get('/rides', { params });
      return response;
      
    } catch (error) {
      console.error('Get user rides error:', error);
      throw error;
    }
  },

  // Cancel ride
  cancelRide: async (rideId) => {
    try {
      console.log('Cancelling ride:', rideId);
      
      // For development, return mock success
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update stored ride data to cancelled status immediately
        const storedRideData = sessionStorage.getItem(`ride_${rideId}`);
        if (storedRideData) {
          try {
            const rideData = JSON.parse(storedRideData);
            rideData.status = 'cancelled';
            rideData.cancelledAt = new Date().toISOString();
            rideData.driver = null; // Remove driver assignment
            sessionStorage.setItem(`ride_${rideId}`, JSON.stringify(rideData));
            console.log('Ride data updated to cancelled status');
          } catch (e) {
            console.warn('Failed to update stored ride data');
          }
        }
        
        return {
          data: {
            message: 'Ride cancelled successfully',
            status: 'cancelled',
            ride: {
              id: parseInt(rideId),
              status: 'cancelled',
              cancelledAt: new Date().toISOString()
            }
          }
        };
      }

      const response = await apiClient.delete(`/rides/${rideId}`);
      return response;
      
    } catch (error) {
      console.error('Cancel ride error:', error);
      throw error;
    }
  }
};

export default rideAPI;