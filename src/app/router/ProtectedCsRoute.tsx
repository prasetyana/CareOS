import React from 'react';
import { useLocation, Outlet } from "react-router-dom";
import { Navigate } from '@ui/Navigate';
import { useAuth } from '@core/hooks/useAuth';

const ProtectedCsRoute: React.FC = () => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!isAuthenticated || (user?.role !== 'cs' && user?.role !== 'admin' && user?.role !== 'platform_admin')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedCsRoute;
