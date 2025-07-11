// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This is optional.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
