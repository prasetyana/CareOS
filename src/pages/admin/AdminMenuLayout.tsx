

import React from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { NavLink, Outlet } from "react-router-dom";
import { Utensils, PlusSquare, LayoutList } from 'lucide-react';
import { useTenantParam } from '../../hooks/useTenantParam';

const menuTabs = [
    { name: 'Tambah Menu Baru', href: 'tambah-menu-baru', icon: PlusSquare },
    { name: 'Kelola Menu', href: 'kelola-menu', icon: Utensils },
    { name: 'Kategori Menu', href: 'kategori-menu', icon: LayoutList },
];

const AdminMenuLayout: React.FC = () => {
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
                    {menuTabs.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={withTenant(tab.href)}
                            className={navLinkClasses}
                        >
                            <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span className="truncate">{tab.name}</span>
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

export default AdminMenuLayout;
