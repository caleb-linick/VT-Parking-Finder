/**
 * apiService.js
 * 
 * A centralized service for handling API requests with JWT authentication.
 * This service automatically attaches JWT tokens to requests and handles token refresh.
 * 
 * Features:
 * - Automatic token inclusion in request headers
 * - Centralized error handling
 * - Response interceptors for potential token refresh
 * - Simplified API for common operations (GET, POST, PUT, DELETE)
 * 
 * @author VT Parking Finder Team
 * @version 1.2.0
 */

import axios from 'axios';

// Create an axios instance with custom config
const api = axios.create({
  baseURL: '/', // Uses the proxy in development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If token is invalid/expired, handle logout
      if (error.response.data && error.response.data.error === 'Invalid or expired token') {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * API service object with methods for common operations
 */
const apiService = {
  /**
   * Get current authentication status
   * 
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get user data from localStorage
   * 
   * @returns {Object|null} User data or null if not authenticated
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  /**
   * Login a user and store authentication data
   * 
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} Promise that resolves to user data
   */
  async login(username, password) {
    const response = await api.post('/login', { username, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        username: response.data.username,
        car: response.data.car || '',
        favorites: []
      }));
    }
    
    return response.data;
  },
  
  /**
   * Register a new user
   * 
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} Promise that resolves to user data
   */
  async signup(username, password) {
    const response = await api.post('/signup', { username, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.user_id,
        username: response.data.username,
        car: response.data.car || '',
        favorites: []
      }));
    }
    
    return response.data;
  },
  
  /**
   * Update user's car information
   * 
   * @param {string} carModel - Car model information
   * @returns {Promise} Promise that resolves to success message
   */
  async updateCar(carModel) {
    const response = await api.put('/car', { model: carModel });
    
    // Update local user data
    const user = this.getUser();
    if (user) {
      user.car = carModel;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },
  
  /**
   * Fetch user's favorite parking spots
   * 
   * @returns {Promise} Promise that resolves to array of favorite IDs
   */
  async getFavorites() {
    const response = await api.get('/favorites');
    
    // Update local user data
    const user = this.getUser();
    if (user) {
      user.favorites = response.data;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },
  
  /**
   * Update user's favorite parking spots
   * 
   * @param {Array} favorites - Array of favorite parking spot IDs
   * @returns {Promise} Promise that resolves to success message
   */
  async updateFavorites(favorites) {
    const response = await api.post('/favorites', { favorites });
    
    // Update local user data
    const user = this.getUser();
    if (user) {
      user.favorites = favorites;
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },
  
  /**
   * Get latest sensor data
   * 
   * @param {number} sensorId - ID of the sensor
   * @returns {Promise} Promise that resolves to sensor data
   */
  async getSensorData(sensorId = 1) {
    const response = await api.get(`/sensor-data?sensor_id=${sensorId}`);
    return response.data;
  },
  
  /**
   * Logout the current user
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default apiService;