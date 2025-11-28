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
                // Check for tenant query parameter first
                const urlParams = new URLSearchParams(window.location.search);
                const rawTenantParam = urlParams.get('tenant');
                const tenantParam = rawTenantParam?.trim();

                let resolution;

                if (tenantParam) {
                    // Use tenant from query parameter
                    resolution = {
                        tenantId: tenantParam,
                        source: 'query' as const,
                        isValid: true,
                    };
                    console.log('Tenant from query parameter:', tenantParam);
                } else {
                    // Resolve tenant from URL
                    resolution = await resolveTenantCached(
                        window.location.hostname,
                        window.location.pathname
                    );
                }

                console.log('Tenant Resolution:', resolution);

                if (resolution.isValid && resolution.tenantId) {
                    // Try to get tenant config
                    const config = await getTenantConfig(resolution.tenantId);

                    if (config) {
                        setTenant(config);
                        console.log('Tenant Config Loaded:', config);
                    } else {
                        // Use default config for platform/staging/demo
                        console.log('Constructing default config for:', resolution.tenantId);

                        // Robust name detection
                        let tenantName = 'DineOS Staging';
                        if (resolution.tenantId === 'platform') tenantName = 'DineOS Platform';
                        else if (resolution.tenantId === 'demo' || resolution.tenantId.includes('demo')) tenantName = 'Demo Restaurant';

                        console.log('Determined tenant name:', tenantName);

                        const newTenantConfig = {
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
                                theme: (resolution.tenantId === 'demo' || resolution.tenantId.includes('demo')) ? 'minimal' : undefined,
                                primaryColor: '#1F2937',
                                secondaryColor: '#6B7280',
                                accentColor: '#10B981',
                            },
                            homepageSettings: {
                                heroTitle: (resolution.tenantId === 'demo' || resolution.tenantId.includes('demo')) ? 'Demo Restaurant' : undefined,
                                heroSubtitle: (resolution.tenantId === 'demo' || resolution.tenantId.includes('demo')) ? 'Simple. Elegant. Delicious.' : undefined,
                                ctaPrimary: 'Get Started',
                                ctaSecondary: 'View Menu',
                                showFeatures: true,
                                showMenuPreview: true,
                                showTestimonials: false,
                            },
                            isActive: true,
                            createdAt: new Date().toISOString(),
                        };

                        console.log('Setting tenant config:', newTenantConfig);
                        setTenant(newTenantConfig as TenantConfig);
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
