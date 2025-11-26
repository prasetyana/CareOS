import React from 'react';
import { useWindowSize } from '../hooks/useWindowSize';
import CustomerDashboardLayout from './CustomerDashboardLayout';
import CustomerDashboardMobileLayout from './CustomerDashboardMobileLayout';

const ResponsiveCustomerLayout: React.FC = () => {
    const { width } = useWindowSize();
    const isMobile = width < 1024; // Tailwind's 'lg' breakpoint

    return (
        <>
            {isMobile ? <CustomerDashboardMobileLayout /> : <CustomerDashboardLayout />}
        </>
    );
};

export default ResponsiveCustomerLayout;
