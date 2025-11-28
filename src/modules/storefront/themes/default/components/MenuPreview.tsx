/**
 * Menu Preview Section - Default Theme
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface MenuPreviewProps {
    tenant: TenantConfig;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ tenant }) => {
    const navigate = useNavigate();

    // Check if menu preview should be shown
    if (tenant.homepageSettings?.showMenuPreview === false) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-16 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                    Our Menu
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Discover our delicious offerings
                </p>
            </div>

            <div className="text-center">
                <button
                    onClick={() => navigate('/account/menu')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                    View Full Menu
                </button>
            </div>
        </div>
    );
};

export default MenuPreview;
