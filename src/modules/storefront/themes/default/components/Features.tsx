/**
 * Features Section - Default Theme
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface FeaturesProps {
    tenant: TenantConfig;
}

const Features: React.FC<FeaturesProps> = ({ tenant }) => {
    // Check if features should be shown
    if (tenant.homepageSettings?.showFeatures === false) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Easy Ordering</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Browse our menu and place orders with just a few clicks
                    </p>
                </div>

                <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Real-time Updates</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Track your order status in real-time from kitchen to delivery
                    </p>
                </div>

                <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Rewards Program</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Earn points with every order and unlock exclusive rewards
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Features;
