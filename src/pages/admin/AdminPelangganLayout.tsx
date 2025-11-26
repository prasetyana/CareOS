

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { NavLink, Outlet } from "react-router-dom";
import { Users, MessageSquare, MessageCircle, BarChart2 } from 'lucide-react';
import { useLiveChat } from '../../contexts/LiveChatContext';
import { useTenantParam } from '../../hooks/useTenantParam';

const pelangganTabs = [
    { name: 'Daftar Pelanggan', href: 'daftar-pelanggan', icon: Users },
    { name: 'Ulasan & Feedback', href: 'ulasan-feedback', icon: MessageSquare },
    { name: 'Live Chat', href: 'live-chat', icon: MessageCircle },
    { name: 'Statistik Chat', href: 'statistik-chat', icon: BarChart2 },
];

const AdminPelangganLayout: React.FC = () => {
    const { attentionRequiredCount } = useLiveChat();
    const { withTenant } = useTenantParam();

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
            ? 'bg-gray-100 dark:bg-gray-700 text-brand-primary'
            : 'text-brand-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-brand-dark dark:hover:text-gray-200'
        }`;

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <aside className="lg:col-span-3 xl:col-span-2 sticky top-24 self-start">
                <nav className="space-y-1">
                    {pelangganTabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={withTenant(tab.href)}
                            className={navLinkClasses}
                        >
                            <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span className="truncate">{tab.name}</span>
                            {tab.name === 'Live Chat' && attentionRequiredCount > 0 && (
                                <span className="ml-auto bg-danger text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {attentionRequiredCount}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="lg:col-span-9 xl:col-span-10 mt-6 lg:mt-0">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPelangganLayout;