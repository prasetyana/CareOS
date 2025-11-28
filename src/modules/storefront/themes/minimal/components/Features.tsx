/**
 * Features Section - Minimal Theme
 * Simple grid with minimal icons
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface FeaturesProps {
    tenant: TenantConfig;
}

const Features: React.FC<FeaturesProps> = ({ tenant }) => {
    if (tenant.homepageSettings?.showFeatures === false) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
                {/* Feature 1 */}
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-light mb-3 text-gray-900 dark:text-white">Simple Ordering</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                        Effortless menu browsing and ordering experience
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-light mb-3 text-gray-900 dark:text-white">Real-time Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                        Monitor your order from kitchen to delivery
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-light mb-3 text-gray-900 dark:text-white">Quality Assured</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                        Fresh ingredients and exceptional service
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Features;
