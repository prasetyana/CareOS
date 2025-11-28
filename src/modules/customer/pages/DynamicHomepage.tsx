/**
 * Dynamic Homepage
 * Routes users to appropriate homepage based on authentication state
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import CustomerHomepage from '@modules/customer/pages/CustomerHomepage';

const DynamicHomepage: React.FC = () => {
    const { user } = useAuth();

    // If user is logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/akun/beranda" replace />;
    }

    // Show public tenant homepage for logged-out users
    return <CustomerHomepage />;
};

export default DynamicHomepage;
