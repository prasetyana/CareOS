/**
 * Default Theme
 * Clean and professional design for restaurants
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TenantConfig } from '@core/tenant/tenantConfig';
import Hero from './components/Hero';
import Features from './components/Features';
import MenuPreview from './components/MenuPreview';
import Footer from './components/Footer';

interface DefaultThemeProps {
    tenant: TenantConfig;
}

const DefaultTheme: React.FC<DefaultThemeProps> = ({ tenant }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Hero tenant={tenant} />
            <Features tenant={tenant} />
            <MenuPreview tenant={tenant} />
            <Footer tenant={tenant} />
        </div>
    );
};

export default DefaultTheme;
