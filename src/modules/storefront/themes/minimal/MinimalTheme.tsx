/**
 * Minimal Theme
 * Clean and elegant design with focus on simplicity
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';
import Hero from './components/Hero';
import Features from './components/Features';
import MenuPreview from './components/MenuPreview';
import Footer from './components/Footer';

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
