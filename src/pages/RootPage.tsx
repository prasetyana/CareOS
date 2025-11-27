import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { detectTenantFromSubdomain } from '../lib/tenantDetection';
import PlatformLandingPage from '../pages/platform/PlatformLandingPage';

/**
 * Smart root component that decides whether to show the platform landing page
 * or redirect to tenant login based on subdomain detection
 */
const RootPage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we're on a tenant subdomain
        const tenantSlug = detectTenantFromSubdomain();

        if (tenantSlug) {
            // We're on a tenant subdomain (e.g., demo.careos.cloud)
            // Redirect to login page for that tenant
            console.log('🔀 Tenant subdomain detected, redirecting to login:', tenantSlug);
            navigate('/login', { replace: true });
        }
        // Otherwise, stay on platform landing page (careos.cloud)
    }, [navigate]);

    // Show platform landing page (will be replaced by redirect if on tenant subdomain)
    return <PlatformLandingPage />;
};

export default RootPage;
