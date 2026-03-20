import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAdminOnly = false }) => {
  // 1. Get user data from localStorage (set during login)
  const user = JSON.parse(localStorage.getItem('user'));

  // 2. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the route is for admins only, check the role
  if (isAdminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />; // Redirect non-admins to home
  }

  // 4. If all checks pass, render the child components (the page)
  return <Outlet />;
};

export default ProtectedRoute;