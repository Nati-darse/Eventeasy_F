import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  
    getAuthState();
  }, []);
  

  const getUserData = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/Event-Easy/user/data', { withCredentials: true });
  
      console.log("Fetched user data:", data); // Log this to see the full response!
  
      if (data && data.name) {
        setUserData(data); // Assuming user data is directly in the response
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
      getUserData(); // User is likely still logged in, fetch their data
    } else {
      setUserData(null); // No token, so nuke userData
    }
  }, []);
  
  

  const getAuthState = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/Event-Easy/users/is-auth', { withCredentials: true });
  
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
        console.log("Auth state fetched successfully:", data.userData);
      } else {
        console.error('Failed to fetch auth state:', data.message);
      }
    } catch (error) {
      console.error('Error fetching auth state:', error);
    }
  };

useEffect(() => {
  getAuthState(); // Check auth state on load
}, []);


  const value = {
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};

export const appContent = AppContent;
