
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { useLocation, Outlet } from "react-router-dom";
import { Navigate } from '../components/Navigate';
import { useAuth } from '../hooks/useAuth';

const ProtectedCsRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated || user?.role !== 'cs') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedCsRoute;