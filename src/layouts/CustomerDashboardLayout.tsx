
import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { Outlet } from "react-router-dom";
import CustomerSidebar from '@modules/customer/components/CustomerSidebar';
import CartPanel from '@modules/customer/components/CartPanel';
import { useCart } from '@core/hooks/useCart';
import { useCustomerLayout } from '@core/contexts/CustomerLayoutContext';
import { useChat } from '@core/hooks/useChat';
import ChatPanel from '@modules/customer/components/ChatPanel';
import { useNotifications } from '@core/hooks/useNotifications';
import NotificationPanel from '@modules/customer/components/NotificationPanel';

import { useTheme } from '@core/hooks/useTheme';

const CustomerDashboardLayout: React.FC = () => {
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useCustomerLayout();
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
    const { isCartOpen } = useCart();
    const { isChatOpen } = useChat();
    const { isNotificationPanelOpen } = useNotifications();
    const { mode } = useTheme();

    React.useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    const isSidePanelOpen = isCartOpen || isChatOpen || isNotificationPanelOpen;

    return (
        <div
            className="relative min-h-screen w-full font-sans bg-cover bg-center bg-fixed transition-colors duration-300 bg-bg-base"
            style={{
                backgroundImage: mode === 'light' ? "url('https://picsum.photos/seed/restaurant-bg/1920/1080')" : 'none'
            }}
        >
            <div className="max-w-[1440px] mx-auto p-6">
                <div className="flex h-[calc(100vh-48px)] gap-6">

                    {/* Sidebar Column */}
                    <div className="hidden lg:block relative z-10">
                        <CustomerSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                    </div>

                    {/* Main Content Column */}
                    <main className="flex-1 rounded-3xl bg-surface backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-2xl shadow-black/10 overflow-hidden min-w-0">
                        <div className="h-full overflow-y-auto overflow-x-hidden px-4 pt-8 pb-4 custom-scrollbar">
                            <Outlet />
                        </div>
                    </main>

                    {/* Cart / Chat / Notification Panel Column */}
                    <div className={`hidden lg:block transition-all duration-300 ease-in-out overflow-hidden ${isSidePanelOpen ? 'w-[18rem]' : 'w-0'}`}>
                        {isCartOpen && <CartPanel />}
                        {isChatOpen && <ChatPanel />}
                        {isNotificationPanelOpen && <NotificationPanel />}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CustomerDashboardLayout;
