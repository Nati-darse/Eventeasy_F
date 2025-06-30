import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const GoogleAuth = ({ onSuccess, onError, role = 'attendee', buttonText = 'Continue with Google' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const handleCredentialResponse = useCallback(async (response) => {
    setIsLoading(true);
    try {
      const result = await axios.post('https://eventeasy-56uy.onrender.com/Event-Easy/auth/google', {
        credential: response.credential,
        role: role,
      }, {
        withCredentials: true,
        timeout: 15000,
      });

      if (result.data.success) {
        localStorage.setItem('token', result.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${result.data.token}`;
        onSuccess(result.data);
      } else {
        onError(result.data.message || 'Google authentication failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Google authentication failed. Please try again.';
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [role, onSuccess, onError]);

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) {
        setTimeout(initializeGoogle, 100);
        return;
      }

      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '743436275575-5ct6m52ltsp6spge1ltf8f2hk7mu03u2.apps.googleusercontent.com';
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        // Render the button immediately after initialization
        const container = document.getElementById('google-signin-container');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%',
          });
        }
        
        setIsGoogleReady(true);
      } catch (error) {
        onError('Failed to initialize Google authentication');
      }
    };

    // Load Google script if not already loaded
    if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setTimeout(initializeGoogle, 500);
      };
      
      script.onerror = () => {
        onError('Failed to load Google authentication');
      };
      
      document.head.appendChild(script);
    } else {
      setTimeout(initializeGoogle, 100);
    }
  }, [handleCredentialResponse, onError]);

  return (
    <div>
      <div id="google-signin-container"></div>
      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-sm text-gray-500">Signing in...</span>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;