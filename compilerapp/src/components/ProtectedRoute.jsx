import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// 1. Make sure you have this component defined
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

// 2. Ensure proper export
export default ProtectedRoute;