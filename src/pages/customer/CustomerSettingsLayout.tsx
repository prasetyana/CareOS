import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ScrollableTabs from '../../components/ScrollableTabs';
import { useTenantParam } from '../../hooks/useTenantParam';

const settingsTabs = [
    { name: 'Profil', href: 'profil' },
    { name: 'Keamanan', href: 'keamanan' },
    { name: 'Notifikasi', href: 'preferensi' },
    { name: 'Alamat', href: 'alamat' },
    { name: 'Pembayaran', href: 'pembayaran' },
];
const tabNames = settingsTabs.map(t => t.name);

const CustomerSettingsLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { withTenant } = useTenantParam();

    const getCurrentTabName = () => {
        const currentPathEnd = location.pathname.split('/').pop();
        const currentTab = settingsTabs.find(tab => tab.href === currentPathEnd);
        // Default to 'Profil' if no match or on base /akun/pengaturan path
        if (!currentTab) {
            return 'Profil';
        }
        return currentTab.name;
    };

    const [activeTab, setActiveTab] = useState(getCurrentTabName());

    useEffect(() => {
        // This effect ensures the active tab state is in sync with the URL
        // e.g., when the user navigates using browser back/forward buttons
        setActiveTab(getCurrentTabName());
    }, [location.pathname]);

    const handleTabChange = (tabName: string) => {
        const selectedTab = settingsTabs.find(tab => tab.name === tabName);
        if (selectedTab) {
            // Navigate to the new route, which will trigger the useEffect above
            // and update the Outlet's content.
            navigate(withTenant(selectedTab.href));
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight font-sans text-text-primary dark:text-gray-100">Pengaturan Akun</h1>
                <p className="text-text-muted mt-1 dark:text-gray-400">Kelola profil, keamanan, dan preferensi Anda.</p>
            </div>
            <div className="flex justify-center">
                <ScrollableTabs
                    id="settings-tabs"
                    options={tabNames}
                    value={activeTab}
                    onChange={(val) => handleTabChange(val as string)}
                />
            </div>

            <div>
                <Outlet />
            </div>
        </div>
    );
};

export default CustomerSettingsLayout;