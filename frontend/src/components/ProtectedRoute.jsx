import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-brand-500"></div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location, 
          message: 'Please log in to access this page.' 
        }} 
        replace 
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
