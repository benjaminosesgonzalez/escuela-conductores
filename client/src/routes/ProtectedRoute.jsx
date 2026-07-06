import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
