
/**
 * Default Theme
 * Clean and professional design for restaurants
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantConfig } from '@core/tenant/tenantConfig';
// CustomerHome is replaced by sections
import CustomerOrders from '../../customer/pages/CustomerOrders';
import CustomerProfile from '../../customer/pages/CustomerProfile';
import CustomerMenu from '../../customer/pages/CustomerMenu';
import CustomerMenuDetail from '../../customer/pages/CustomerMenuDetail';
import StorefrontLayout from './layouts/StorefrontLayout';
import Hero from './components/Hero';
import Features from './components/Features';
import MenuPreview from './components/MenuPreview';
import Footer from './components/Footer';

// New Sections & Components
import SearchBar from './sections/SearchBar';
import UserGreeting from './sections/UserGreeting';
import QuickActions from './sections/QuickActions';
import PromoSection from './sections/PromoSection';
import MenuSection from './sections/MenuSection';
import LocationModal from '../../customer/components/LocationModal';
import { useAuth } from '@core/contexts/AuthContext';

interface DefaultThemeProps {
    tenant: TenantConfig;
    mode?: 'public' | 'customer';
}

const DefaultTheme: React.FC<DefaultThemeProps> = ({ tenant, mode = 'public' }) => {
    const { user } = useAuth();

    // Customer Mode (Logged In - Account Routes)
    if (mode === 'customer') {
        return (
            <StorefrontLayout tenant={tenant}>
                <Routes>
                    {/* Redirect old home route to root */}
                    <Route path="home" element={<Navigate to="/" replace />} />
                    <Route path="menu" element={<CustomerMenu />} />
                    <Route path="menu/:slug" element={<CustomerMenuDetail />} />
                    <Route path="orders" element={<CustomerOrders />} />
                    <Route path="profile" element={<CustomerProfile />} />
                    {/* Default redirect to home (root) */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </StorefrontLayout>
        );
    }

    // Public Mode (Root Path)

    // If user is logged in, show Customer Dashboard at root
    if (user) {
        return (
            <StorefrontLayout tenant={tenant}>
                <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto w-full">
                    {/* 1. Status Widget + Search Bar (Desktop Only) */}
                    <div className="hidden lg:flex items-center gap-3 sticky top-[-20px] z-20 -mt-5 mb-5">
                        <SearchBar />
                        <UserGreeting />
                    </div>

                    {/* 2. Promo Slider */}
                    <PromoSection />

                    {/* 3. Quick Actions */}
                    <QuickActions />

                    {/* 4. Personalized Menu Sections */}
                    <MenuSection />

                    {/* Modals */}
                    <LocationModal />
                </div>
            </StorefrontLayout>
        );
    }

    // If user is logged out, show Marketing Landing Page
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <Hero tenant={tenant} />
            <Features tenant={tenant} />
            <MenuPreview tenant={tenant} />
            <Footer tenant={tenant} />
        </div>
    );
};

export default DefaultTheme;
