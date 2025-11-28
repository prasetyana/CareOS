/**
 * Footer - Minimal Theme
 * Clean, simple footer
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface FooterProps {
    tenant: TenantConfig;
}

const Footer: React.FC<FooterProps> = ({ tenant }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    {/* Tenant name */}
                    <h3 className="text-xl font-light mb-3 text-gray-900 dark:text-white">
                        {tenant.name}
                    </h3>

                    {/* Powered by */}
                    <p className="text-sm text-gray-500 dark:text-gray-500 font-light mb-6">
                        Powered by DineOS
                    </p>

                    {/* Divider */}
                    <div className="w-12 h-px bg-gray-300 dark:bg-gray-700 mx-auto mb-6"></div>

                    {/* Copyright */}
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-light">
                        © {currentYear} {tenant.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
