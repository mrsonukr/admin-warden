import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchWardenData, updateWardenProfile } from '../services/api';
import { decodeJWT } from '../utils/jwtUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage immediately
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });
  const [user, setUser] = useState(() => {
    // Initialize from localStorage immediately
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    // Initialize from localStorage immediately
    return localStorage.getItem('token') || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [wardenData, setWardenData] = useState(null);

  // Function to fetch warden data
  const fetchWardenInfo = async (token) => {
    try {
      const decoded = decodeJWT(token);
      if (decoded && decoded.warden_id) {
        const response = await fetchWardenData(decoded.warden_id, token);
        if (response.warden) {
          setWardenData(response.warden);
          return response.warden;
        }
      }
    } catch (error) {
      console.error('Error fetching warden data:', error);
    }
    return null;
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedAuth = localStorage.getItem('isAuthenticated');
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (savedAuth === 'true' && savedUser && savedToken) {
        setIsAuthenticated(true);
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        
        // Fetch warden data
        await fetchWardenInfo(savedToken);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setWardenData(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      setToken(userData.token);
      localStorage.setItem('token', userData.token);
      
      // Fetch warden data after login
      await fetchWardenInfo(userData.token);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setWardenData(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateWardenProfileData = async (wardenId, profileData) => {
    try {
      const response = await updateWardenProfile(wardenId, profileData, token);
      if (response.success) {
        // Update local warden data
        setWardenData(prev => ({
          ...prev,
          ...profileData
        }));
        return response;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating warden profile:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    wardenData,
    isLoading,
    login,
    logout,
    fetchWardenInfo,
    updateWardenProfile: updateWardenProfileData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
