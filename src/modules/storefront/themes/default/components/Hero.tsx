/**
 * Hero Section - Default Theme
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface HeroProps {
    tenant: TenantConfig;
}

const Hero: React.FC<HeroProps> = ({ tenant }) => {
    const navigate = useNavigate();

    const heroTitle = tenant.homepageSettings?.heroTitle || `Welcome to ${tenant.name}`;
    const heroSubtitle = tenant.homepageSettings?.heroSubtitle || 'Experience delicious food and exceptional service';
    const ctaPrimary = tenant.homepageSettings?.ctaPrimary || 'Sign In';
    const ctaSecondary = tenant.homepageSettings?.ctaSecondary || 'Browse Menu';

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-4xl mx-auto">
                {/* Tenant Logo/Name */}
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {heroTitle}
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                    {heroSubtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                        {ctaPrimary}
                    </button>

                    <button
                        onClick={() => navigate('/account/menu')}
                        className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                    >
                        {ctaSecondary}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
