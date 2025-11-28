/**
 * Minimal Theme
 * Clean and elegant design with focus on simplicity
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';
import { Hero, Features, MenuPreview, Footer } from './components';

interface MinimalThemeProps {
    tenant: TenantConfig;
}

const MinimalTheme: React.FC<MinimalThemeProps> = ({ tenant }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Hero tenant={tenant} />
            <Features tenant={tenant} />
            <MenuPreview tenant={tenant} />
            <Footer tenant={tenant} />
        </div>
    );
};

export default MinimalTheme;
