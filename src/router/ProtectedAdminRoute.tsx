

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { useLocation, Outlet } from "react-router-dom";
import { Navigate } from '../components/Navigate';
import { useAuth } from '../hooks/useAuth';

const ProtectedAdminRoute: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'tenant_admin' && user?.role !== 'platform_admin')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;