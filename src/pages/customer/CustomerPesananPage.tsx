import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SegmentedControl from '../../components/SegmentedControl';
import { useTenantParam } from '../../hooks/useTenantParam';



const CustomerPesananPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { withTenant } = useTenantParam();

    const tabs = [
        { name: 'Pesanan Aktif', href: withTenant('/akun/pesanan/aktif') },
        { name: 'Riwayat Pesanan', href: withTenant('/akun/pesanan/riwayat') },
    ];
    const tabNames = tabs.map(t => t.name);

    const getCurrentTabName = () => {
        const currentTab = tabs.find(tab => location.pathname.startsWith(tab.href.split('?')[0]));
        if (!currentTab && location.pathname === '/akun/pesanan') {
            return 'Pesanan Aktif';
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
                <h1 className="text-2xl font-semibold tracking-tight font-sans text-text-primary dark:text-gray-100">Pesanan Anda</h1>
                <p className="text-text-muted mt-1 dark:text-gray-400">Lacak pesanan aktif atau lihat riwayat pesanan Anda.</p>
            </div>
            <div className="flex justify-center">
                <SegmentedControl
                    id="pesanan-tabs"
                    options={tabNames}
                    value={activeTab}
                    onChange={(val) => handleTabChange(val as string)}
                />
            </div>

            <Outlet />
        </div>
    );
};

export default CustomerPesananPage;