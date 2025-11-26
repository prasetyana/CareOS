
import React, { useState } from 'react';
// FIX: Re-typed import to fix "no exported member" errors.
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Utensils, Users, MoreHorizontal, Calendar, Megaphone, BarChart, Palette, Settings } from 'lucide-react';
import Modal from '../Modal';
import { useTenantParam } from '../../hooks/useTenantParam';

const mainNavLinks = [
    { name: 'Dasbor', href: '/admin/dasbor', icon: LayoutDashboard },
    { name: 'Pesanan', href: '/admin/pesanan', icon: ClipboardList },
    { name: 'Menu', href: '/admin/menu', icon: Utensils },
    { name: 'Pelanggan', href: '/admin/pelanggan', icon: Users },
];

const moreNavLinks = [
    { to: "/admin/reservasi", icon: Calendar, text: "Reservasi" },
    { to: "/admin/promosi", icon: Megaphone, text: "Promosi" },
    { to: "/admin/analitik", icon: BarChart, text: "Analitik" },
    { to: "/admin/tampilan", icon: Palette, text: "Tampilan" },
    { to: "/admin/pengaturan", icon: Settings, text: "Pengaturan" },
];

const AdminBottomNav: React.FC = () => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const { withTenant } = useTenantParam();

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200 ease-in-out active:scale-90 relative ${isActive
            ? 'text-accent'
            : 'text-text-muted hover:text-text-primary'
        }`;

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-surface/80 backdrop-blur-xl border-t border-glass-border flex justify-around items-center rounded-t-3xl shadow-popover z-30">
                {mainNavLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={withTenant(link.href)}
                        className={navLinkClasses}
                    >
                        {({ isActive }) => (
                            <>
                                <link.icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{link.name}</span>
                                {isActive && <div className="absolute bottom-2 w-1.5 h-1.5 bg-accent rounded-full"></div>}
                            </>
                        )}
                    </NavLink>
                ))}
                <button onClick={() => setIsMoreMenuOpen(true)} className="flex flex-col items-center justify-center gap-1 w-full h-full text-text-muted active:scale-90">
                    <MoreHorizontal className="w-6 h-6" />
                    <span className="text-xs font-medium">Lainnya</span>
                </button>
            </nav>

            <Modal isOpen={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} title="Menu Lainnya" mobileAs="bottom-sheet">
                <nav className="space-y-2">
                    {moreNavLinks.map(item => (
                        <NavLink
                            key={item.text}
                            to={withTenant(item.to)}
                            onClick={() => setIsMoreMenuOpen(false)}
                            className={({ isActive }) => `flex items-center p-3 rounded-lg gap-4 ${isActive ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/10'}`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.text}</span>
                        </NavLink>
                    ))}
                </nav>
            </Modal>
        </>
    );
};

export default AdminBottomNav;
