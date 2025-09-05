import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Text } from '@radix-ui/themes';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // No loading UI needed since skeleton loaders handle it
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
