import axios from 'axios';

const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extract error message from axios error
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred';
  }

  // Network error (server not reachable)
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Unable to connect to server. Please check your connection and ensure the backend is running.';
  }

  // Response error (server responded with error status)
  if (error.response) {
    const { data, status } = error.response;
    
    // Try to get message from response data
    if (data?.message) {
      return data.message;
    }
    
    // Fallback messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'This resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error ${status}: ${data?.error || 'An error occurred'}`;
    }
  }

  // Request error (request was made but no response)
  if (error.request) {
    return 'No response from server. Please try again later.';
  }

  // Generic error message
  return error.message || 'An unexpected error occurred';
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log booking requests for debugging
    if (config.url === '/bookings' && config.method === 'post') {
      console.log('API Request Interceptor - Booking payload:', {
        url: config.url,
        method: config.method,
        data: config.data,
        dataStringified: JSON.stringify(config.data, null, 2),
        seatsInData: config.data?.seats,
        seatsType: Array.isArray(config.data?.seats) ? config.data.seats.map(s => ({ value: s, type: typeof s })) : 'not an array'
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    // Enhance error with formatted message
    error.userMessage = getErrorMessage(error);
    return Promise.reject(error);
  }
);

// Trip API
export const getTrips = (filters = {}) => {
  // Add timestamp to prevent caching
  const params = {
    ...filters,
    _t: Date.now()
  };
  return api.get('/trips', { 
    params,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};

export const getTrip = (id) => {
  return api.get(`/trips/${id}`);
};

export const createTrip = (tripData) => {
  return api.post('/trips', tripData);
};

export const updateTrip = (id, tripData) => {
  return api.put(`/trips/${id}`, tripData);
};

export const deleteTrip = (id) => {
  return api.delete(`/trips/${id}`);
};

// Booking API
export const createBooking = (bookingData) => {
  return api.post('/bookings', bookingData);
};

export const getUserBookings = () => {
  return api.get('/bookings/user');
};

export const getBooking = (id) => {
  return api.get(`/bookings/${id}`);
};

export const cancelBooking = (id) => {
  return api.put(`/bookings/${id}/cancel`);
};

export const getBookings = () => {
  return api.get('/bookings/all');
};

// User API
export const getUserProfile = () => {
  return api.get('/users/profile');
};

