import React from 'react';
import { useLocation, Outlet } from "react-router-dom";
import { Navigate } from '@ui/Navigate';
import { useAuth } from '@core/hooks/useAuth';

const ProtectedCustomerRoute: React.FC = () => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!isAuthenticated || user?.role !== 'customer') {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedCustomerRoute;
