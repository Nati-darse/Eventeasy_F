import { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import { authAPI } from '../services/api';

/**
 * Authentication Hook
 * Provides authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AppContent);
  
  if (!context) {
    throw new Error('useAuth must be used within an AppContextProvider');
  }

  const { isLoggedin, setIsLoggedin, userData, setUserData } = context;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Login user
   * @param {object} credentials - Login credentials
   * @returns {Promise<boolean>} Success status
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUserData(response.user);
        setIsLoggedin(true);
        return true;
      }
      
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user
   * @param {object} userData - Registration data
   * @returns {Promise<boolean>} Success status
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.register(userData);
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUserData(response.user);
        setIsLoggedin(true);
        return true;
      }
      
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUserData(null);
      setIsLoggedin(false);
    }
  };

  /**
   * Send verification OTP
   * @param {string} email - User email
   * @returns {Promise<boolean>} Success status
   */
  const sendVerificationOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.sendVerificationOTP(email);
      return response.success;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP
   * @param {string} otp - OTP code
   * @returns {Promise<boolean>} Success status
   */
  const verifyOTP = async (otp) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.verifyOTP(otp);
      
      if (response.success) {
        setUserData(response.user);
        return true;
      }
      
      throw new Error(response.message || 'OTP verification failed');
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await authAPI.isAuthenticated();
      if (response.success) {
        setIsLoggedin(true);
        if (response.userData) {
          setUserData(response.userData);
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      logout();
    }
  };

  /**
   * Get user profile
   */
  const getUserProfile = async () => {
    try {
      const response = await authAPI.getUserProfile();
      if (response) {
        setUserData(response);
      }
    } catch (err) {
      console.error('Failed to get user profile:', err);
    }
  };

  return {
    // State
    isLoggedin,
    userData,
    loading,
    error,
    
    // Methods
    login,
    register,
    logout,
    sendVerificationOTP,
    verifyOTP,
    checkAuthStatus,
    getUserProfile,
    
    // Utilities
    clearError: () => setError(null),
    isAuthenticated: isLoggedin,
    isVerified: userData?.isVerified || false,
    userRole: userData?.role || null,
  };
};

export default useAuth;