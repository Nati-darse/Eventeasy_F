import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../hooks/useToast';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: showError, success: showSuccess, warning: showWarning, info: showInfo } = useToast();

  // Enhanced error handling
  const handleError = (error, context = '') => {
    console.error(`${context} error:`, error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const serverMessage = error.response.data?.message;
      
      // Map common error messages to user-friendly versions
      if (serverMessage) {
        if (serverMessage.includes('User already exists')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (serverMessage.includes('Invalid email or password') || serverMessage.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (serverMessage.includes('User not found')) {
          errorMessage = 'No account found with this email. Please check your email or create a new account.';
        } else if (serverMessage.includes('Email and password are required')) {
          errorMessage = 'Please enter both email and password.';
        } else if (serverMessage.includes('Google OAuth user')) {
          errorMessage = 'This account was created with Google. Please use Google Sign-In instead.';
        } else if (serverMessage.includes('Validation Error')) {
          errorMessage = 'Please check your input and try again.';
        } else if (serverMessage.includes('already exists')) {
          errorMessage = 'This information is already in use. Please try different details.';
        } else {
          errorMessage = serverMessage;
        }
      } else {
        errorMessage = `Server error (${error.response.status}). Please try again later.`;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'Unable to connect to server. Please check your internet connection and try again.';
    } else {
      // Something else happened
      errorMessage = error.message || errorMessage;
    }
    
    setError(errorMessage);
    showError(errorMessage);
    return errorMessage;
  };

  // Setup axios interceptors for better error handling
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          setIsLoggedin(false);
          setUserData(null);
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('Login')) {
            window.location.href = '/Login_Attendee';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [showError]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      getAuthState();
    } else {
      setLoading(false);
    }
  }, []);
  
  const getUserData = async () => {
    try {
      setError(null);
      const { data } = await axios.get('http://localhost:5000/Event-Easy/user/data', { 
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (data && data.name) {
        setUserData(data);
        return data;
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      handleError(error, 'Get user data');
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isLoggedin) {
      getUserData();
    } else {
      setUserData(null);
    }
  }, [isLoggedin]);
  
  const getAuthState = async () => {
    try {
      setError(null);
      const { data } = await axios.get('http://localhost:5000/Event-Easy/users/is-auth', { 
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      handleError(error, 'Get auth state');
      // Clear token if authentication fails
      localStorage.removeItem('token');
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  // Enhanced logout function
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/Event-Easy/users/logout', {}, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      localStorage.removeItem('token');
      delete axios.defaults.headers.common["Authorization"];
      setIsLoggedin(false);
      setUserData(null);
      setError(null);
    }
  };

  // Enhanced login function
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔐 Frontend login attempt:', { 
        email: credentials.email, 
        hasPassword: !!credentials.password 
      });
      
      const response = await axios.post(
        'http://localhost:5000/Event-Easy/users/login',
        credentials,
        { withCredentials: true }
      );

      console.log('✅ Login response:', response.data);

      if (response.data?.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Store user email for OTP resend
        if (userData && userData.email) {
          localStorage.setItem('userEmail', userData.email);
        } else if (userData && userData.data && userData.data.user && userData.data.user.email) {
          localStorage.setItem('userEmail', userData.data.user.email);
        } else if (credentials && credentials.email) {
          localStorage.setItem('userEmail', credentials.email);
        }
        setIsLoggedin(true);
        await getUserData();
        return { success: true, data: response.data };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.log('❌ Login error response:', error.response?.data);
      const errorMessage = handleError(error, 'Login');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Enhanced register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(
        'http://localhost:5000/Event-Easy/users/register',
        userData,
        { withCredentials: true }
      );

      if (response.data?.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Store user email for OTP resend
        if (userData && userData.email) {
          localStorage.setItem('userEmail', userData.email);
        } else if (userData && userData.data && userData.data.user && userData.data.user.email) {
          localStorage.setItem('userEmail', userData.data.user.email);
        } else if (userData && userData.data && userData.data.user && userData.data.user.email) {
          localStorage.setItem('userEmail', userData.data.user.email);
        }
        setIsLoggedin(true);
        await getUserData();
        return { success: true, data: response.data };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Register');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    loading,
    error,
    setError,
    handleError,
    logout,
    login,
    register,
    // Toast functions
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};

export const appContent = AppContent;