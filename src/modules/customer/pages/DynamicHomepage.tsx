/**
 * Dynamic Homepage
 * Routes users to appropriate homepage based on authentication state and tenant type
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@core/hooks/useAuth';
import { useTenant } from '@core/tenant';
import { ThemeRenderer } from '@modules/storefront';
import PlatformLandingPage from '@modules/platform/pages/PlatformLandingPage';

const DynamicHomepage: React.FC = () => {
    const { user } = useAuth();
    const { tenant } = useTenant();

    // If user is logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/akun/beranda" replace />;
    }

    // If platform tenant, show platform homepage
    if (tenant?.slug === 'platform') {
        return <PlatformLandingPage />;
    }

    // Show tenant's themed homepage
    return <ThemeRenderer tenant={tenant!} />;
};

export default DynamicHomepage;
