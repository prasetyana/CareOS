import React from 'react';
import { TenantConfig } from '@core/tenant/tenantConfig';
import StorefrontNavbar from '../components/StorefrontNavbar';
import Footer from '../components/Footer';

interface StorefrontLayoutProps {
    children: React.ReactNode;
    tenant: TenantConfig;
}

const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({ children, tenant }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <StorefrontNavbar tenantName={tenant.name} />

            <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                {children}
            </main>

            <div className="hidden md:block">
                <Footer tenant={tenant} />
            </div>
        </div>
    );
};

export default StorefrontLayout;
