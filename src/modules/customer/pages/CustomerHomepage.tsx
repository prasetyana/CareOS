/**
 * Customer Homepage (Public)
 * Public-facing homepage for tenant when user is not logged in
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '@core/tenant';
import { useTheme } from '@core/hooks/useTheme';

const CustomerHomepage: React.FC = () => {
    const navigate = useNavigate();
    const { tenant } = useTenant();
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Tenant Logo/Name */}
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {tenant?.name || 'Welcome to DineOS'}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                        {tenant?.slug === 'platform'
                            ? 'Enterprise-grade multi-tenant restaurant management platform'
                            : 'Experience delicious food and exceptional service'
                        }
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            Sign In
                        </button>

                        <button
                            onClick={() => navigate('/akun/menu')}
                            className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
                        >
                            Browse Menu
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

                {/* Platform-specific content */}
                {tenant?.slug === 'platform' && (
                    <div className="mt-24 text-center">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                            Ready to grow your restaurant?
                        </h2>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Start Free Trial
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerHomepage;
