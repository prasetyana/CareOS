/**
 * Menu Preview Section - Minimal Theme
 * Clean, simple menu showcase
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface MenuPreviewProps {
    tenant: TenantConfig;
}

const MenuPreview: React.FC<MenuPreviewProps> = ({ tenant }) => {
    const navigate = useNavigate();

    if (tenant.homepageSettings?.showMenuPreview === false) {
        return null;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-800/30 py-20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto">
                    {/* Section title */}
                    <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900 dark:text-white">
                        Our Menu
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 font-light mb-12">
                        Carefully crafted dishes made with passion
                    </p>

                    {/* Minimal divider */}
                    <div className="w-16 h-px bg-gray-300 dark:bg-gray-700 mx-auto mb-12"></div>

                    {/* CTA */}
                    <button
                        onClick={() => navigate('/account/menu')}
                        className="px-10 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-light rounded-none hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
                    >
                        Explore Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MenuPreview;
