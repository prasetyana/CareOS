/**
 * Footer - Default Theme
 */

import React from 'react';
import type { TenantConfig } from '@core/tenant/tenantConfig';

interface FooterProps {
    tenant: TenantConfig;
}

const Footer: React.FC<FooterProps> = ({ tenant }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{tenant.name}</h3>
                    <p className="text-gray-400 mb-6">
                        Powered by DineOS
                    </p>
                    <p className="text-gray-500 text-sm">
                        © {currentYear} {tenant.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
