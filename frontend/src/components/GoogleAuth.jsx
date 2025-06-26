import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GoogleAuth = ({ onSuccess, onError, role = 'attendee', buttonText = 'Continue with Google' }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      const result = await axios.post('http://localhost:5000/Event-Easy/auth/google', {
        credential: response.credential,
        role: role,
      }, {
        withCredentials: true,
      });

      if (result.data.success) {
        // Store token
        localStorage.setItem('token', result.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.token}`;
        
        onSuccess(result.data);
      } else {
        onError(result.data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      onError(error.response?.data?.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="flex items-center justify-center w-full border border-gray-300 dark:border-gray-500 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
      ) : (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
          alt="Google Logo"
          className="w-5 h-5 mr-2"
        />
      )}
      {isLoading ? 'Signing in...' : buttonText}
    </button>
  );
};

export default GoogleAuth;