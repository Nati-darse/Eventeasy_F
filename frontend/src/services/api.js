import axios from 'axios';

/**
 * API Service Configuration
 * Centralized API configuration and request handling
 */
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.api = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create axios instance with default configuration
   * @private
   * @returns {object} Axios instance
   */
  createAxiosInstance() {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Setup request and response interceptors
   * @private
   */
  setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request
   * @param {string} endpoint - API endpoint
   * @param {object} config - Request configuration
   * @returns {Promise<object>} Response data
   */
  async get(endpoint, config = {}) {
    try {
      const response = await this.api.get(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @param {object} config - Request configuration
   * @returns {Promise<object>} Response data
   */
  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @param {object} config - Request configuration
   * @returns {Promise<object>} Response data
   */
  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} config - Request configuration
   * @returns {Promise<object>} Response data
   */
  async delete(endpoint, config = {}) {
    try {
      const response = await this.api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload file with progress tracking
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {function} onProgress - Progress callback
   * @returns {Promise<object>} Response data
   */
  async uploadFile(endpoint, formData, onProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        };
      }

      const response = await this.api.post(endpoint, formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {object} error - Error object
   * @returns {Error} Formatted error
   * @private
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || `HTTP Error ${status}`;
      
      const apiError = new Error(message);
      apiError.status = status;
      apiError.data = data;
      
      return apiError;
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred.');
    }
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.setAuthToken(null);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Export specific API methods for different modules
export const authAPI = {
  register: (userData) => apiService.post('/Event-Easy/users/register', userData),
  login: (credentials) => apiService.post('/Event-Easy/users/login', credentials),
  logout: () => apiService.post('/Event-Easy/users/logout'),
  sendVerificationOTP: (email) => apiService.post('/Event-Easy/users/send-verify-otp', { email }),
  verifyOTP: (otp) => apiService.post('/Event-Easy/users/verify-otp', { otp }),
  getUserProfile: () => apiService.get('/Event-Easy/user/data'),
  isAuthenticated: () => apiService.get('/Event-Easy/users/is-auth'),
};

export const eventAPI = {
  getAllEvents: () => apiService.get('/Event-Easy/Event/events'),
  getEventById: (id) => apiService.get(`/Event-Easy/Event/events/${id}`),
  createEvent: (formData, onProgress) => apiService.uploadFile('/Event-Easy/Event/createEvents', formData, onProgress),
  updateEvent: (id, data) => apiService.put(`/Event-Easy/Event/events/${id}`, data),
  deleteEvent: (id) => apiService.delete(`/Event-Easy/Event/events/${id}`),
  attendEvent: (id) => apiService.post(`/Event-Easy/Event/events/${id}/attend`),
  leaveEvent: (id) => apiService.post(`/Event-Easy/Event/events/${id}/leave`),
  updateEventStatus: (id, status) => apiService.put(`/Event-Easy/Event/events/${id}/status`, { status }),
};

export const reviewAPI = {
  createReview: (eventId, reviewData) => apiService.post(`/Event-Easy/review/${eventId}/review`, reviewData),
  getEventReviews: (eventId) => apiService.get(`/Event-Easy/review/${eventId}/reviews`),
};

export const reportAPI = {
  createReport: (eventId, reportData) => apiService.post(`/Event-Easy/report/${eventId}`, reportData),
  getAllReports: () => apiService.get('/Event-Easy/report'),
  updateReport: (reportId, data) => apiService.put(`/Event-Easy/report/${reportId}`, data),
};

export const adminAPI = {
  getAllUsers: () => apiService.get('/Event-Easy/users/users'),
  getUserById: (id) => apiService.get(`/Event-Easy/users/user/${id}`),
  deleteUser: (id) => apiService.delete(`/Event-Easy/users/users/${id}`),
  updateUser: (id, data) => apiService.put(`/Event-Easy/users/users/${id}`, data),
};