/**
 * Hero Section - Minimal Theme
 * Clean, centered design with subtle elegance
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface HeroProps {
    tenant: TenantConfig;
}

const Hero: React.FC<HeroProps> = ({ tenant }) => {
    const navigate = useNavigate();

    const heroTitle = tenant.homepageSettings?.heroTitle || `${tenant.name}`;
    const heroSubtitle = tenant.homepageSettings?.heroSubtitle || 'Simple. Elegant. Delicious.';
    const ctaPrimary = tenant.homepageSettings?.ctaPrimary || 'Get Started';
    const ctaSecondary = tenant.homepageSettings?.ctaSecondary || 'View Menu';

    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-900">
            {/* Minimal decorative element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700"></div>

            <div className="container mx-auto px-4 py-24 md:py-32">
                <div className="text-center max-w-3xl mx-auto">
                    {/* Minimal logo or initial */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-900 dark:border-white flex items-center justify-center">
                            <span className="text-2xl font-light text-gray-900 dark:text-white">
                                {tenant.name.charAt(0)}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900 dark:text-white tracking-tight">
                        {heroTitle}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 font-light">
                        {heroSubtitle}
                    </p>

                    {/* CTA Buttons - Minimal style */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-10 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-light rounded-none hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 min-w-[160px]"
                        >
                            {ctaPrimary}
                        </button>

                        <button
                            onClick={() => navigate('/account/menu')}
                            className="px-10 py-3 bg-transparent text-gray-900 dark:text-white font-light rounded-none border border-gray-900 dark:border-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 min-w-[160px]"
                        >
                            {ctaSecondary}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom decorative line */}
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>
        </div>
    );
};

export default Hero;
