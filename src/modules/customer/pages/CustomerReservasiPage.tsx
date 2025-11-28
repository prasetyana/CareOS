import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTenantParam } from '@core/hooks/useTenantParam';
import SegmentedControl from '@ui/SegmentedControl';

const CustomerReservasiPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { withTenant } = useTenantParam();

    const tabs = [
        { name: 'Buat Reservasi', href: withTenant('/akun/reservasi/buat') },
        { name: 'Reservasi Saya', href: withTenant('/akun/reservasi/reservasi') },
        { name: 'Riwayat Reservasi', href: withTenant('/akun/reservasi/riwayat') },
    ];
    const tabNames = tabs.map(t => t.name);

    const getCurrentTabName = () => {
        const currentTab = tabs.find(tab => location.pathname.startsWith(tab.href.split('?')[0]));
        if (!currentTab && location.pathname === '/akun/reservasi') {
            return 'Buat Reservasi';
        }
        return currentTab ? currentTab.name : tabNames[0];
    }

    const [activeTab, setActiveTab] = useState(getCurrentTabName());

    useEffect(() => {
        setActiveTab(getCurrentTabName());
    }, [location.pathname]);

    const handleTabChange = (tabName: string) => {
        const selectedTab = tabs.find(tab => tab.name === tabName);
        if (selectedTab) {
            navigate(selectedTab.href);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight font-sans text-text-primary dark:text-gray-100">Reservasi</h1>
                <p className="text-text-muted mt-1 dark:text-gray-400">Kelola reservasi Anda yang akan datang atau buat yang baru.</p>
            </div>
            <div className="flex justify-center">
                <SegmentedControl
                    id="reservasi-tabs"
                    options={tabNames}
                    value={activeTab}
                    onChange={(val) => handleTabChange(val as string)}
                />
            </div>
            <Outlet />
        </div>
    );
};

export default CustomerReservasiPage;
