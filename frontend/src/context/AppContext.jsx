import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const { data } = await axios.get('http://localhost:5000/Event-Easy/user/data', { 
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (data && data.name) {
        setUserData(data);
      } else {
        console.error('Failed to fetch user data: No user data found.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserData();
    } else {
      setUserData(null);
    }
  }, [isLoggedin]);
  
  const getAuthState = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/Event-Easy/users/is-auth', { 
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
      }
    } catch (error) {
      console.error('Error fetching auth state:', error);
      // Clear token if authentication fails
      localStorage.removeItem('token');
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
    loading
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};

export const appContent = AppContent;