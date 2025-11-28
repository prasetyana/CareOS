/**
 * Tenant-Aware App Wrapper
 * Resolves tenant from URL and provides tenant context to the app
 */

import React, { useEffect, useState } from 'react';
import { resolveTenantCached } from '@core/tenant/tenantResolver';
import { getTenantConfig, type TenantConfig } from '@core/tenant/tenantConfig';

interface TenantAppWrapperProps {
    children: (tenant: TenantConfig | null, loading: boolean) => React.ReactNode;
}

export const TenantAppWrapper: React.FC<TenantAppWrapperProps> = ({ children }) => {
    const [tenant, setTenant] = useState<TenantConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTenant() {
            try {
                // Resolve tenant from current URL
                const resolution = await resolveTenantCached(
                    window.location.hostname,
                    window.location.pathname
                );

                console.log('Tenant Resolution:', resolution);

                if (resolution.isValid && resolution.tenantId) {
                    // Try to get tenant config
                    const config = await getTenantConfig(resolution.tenantId);

                    if (config) {
                        setTenant(config);
                        console.log('Tenant Config Loaded:', config);
                    } else {
                        // Use default config for platform/staging/demo
                        const tenantName = resolution.tenantId === 'platform'
                            ? 'DineOS Platform'
                            : resolution.tenantId === 'demo'
                                ? 'Demo Restaurant'
                                : 'DineOS Staging';

                        setTenant({
                            id: resolution.tenantId,
                            slug: resolution.tenantId,
                            name: tenantName,
                            subdomain: resolution.tenantId,
                            capabilities: {
                                hasLiveChat: true,
                                hasReservations: true,
                                hasLoyaltyProgram: true,
                                hasOnlineOrdering: true,
                                hasAnalytics: true,
                                hasMultiLocation: false,
                                maxMenuItems: 1000,
                                maxStaff: 100,
                                maxLocations: 1,
                                maxOrdersPerDay: 10000,
                                canCustomizeTheme: true,
                                canCustomizeDomain: true,
                                canCustomizeEmail: true,
                            },
                            branding: {
                                theme: resolution.tenantId === 'demo' ? 'minimal' : undefined,
                                primaryColor: '#1F2937',
                                secondaryColor: '#6B7280',
                                accentColor: '#10B981',
                            },
                            homepageSettings: {
                                heroTitle: resolution.tenantId === 'demo' ? 'Demo Restaurant' : undefined,
                                heroSubtitle: resolution.tenantId === 'demo' ? 'Simple. Elegant. Delicious.' : undefined,
                                ctaPrimary: 'Get Started',
                                ctaSecondary: 'View Menu',
                                showFeatures: true,
                                showMenuPreview: true,
                                showTestimonials: false,
                            },
                            isActive: true,
                            createdAt: new Date().toISOString(),
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading tenant:', error);
            } finally {
                setLoading(false);
            }
        }

        loadTenant();
    }, []);

    return <>{children(tenant, loading)}</>;
};
