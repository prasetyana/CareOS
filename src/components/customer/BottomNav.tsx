
import React from 'react';
import { NavLink } from "react-router-dom";
import { Home, ShoppingBag, Gift, Utensils, MessageSquare } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useLiveChat } from '../../contexts/LiveChatContext';
import { useTenantParam } from '../../hooks/useTenantParam';



const BottomNav: React.FC = () => {
    const { openChat } = useChat();
    const { customerUnreadCount } = useLiveChat();
    const { withTenant } = useTenantParam();

    const navLinks = [
        { name: 'Beranda', href: withTenant('/akun/beranda'), icon: Home, end: true },
        { name: 'Menu', href: withTenant('/akun/menu'), icon: Utensils, end: false },
        { name: 'Pesanan', href: withTenant('/akun/pesanan'), icon: ShoppingBag, end: false },
        { name: 'Hadiah', href: withTenant('/akun/poin-hadiah'), icon: Gift, end: false },
    ];

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200 ease-in-out active:scale-90 relative ${isActive
            ? 'text-accent'
            : 'text-text-muted dark:text-neutral-400 hover:text-text-primary dark:hover:text-white'
        }`;

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-24 bg-surface/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10 flex justify-around items-center rounded-t-3xl shadow-popover z-30">
            {navLinks.map((link) => (
                <NavLink
                    key={link.name}
                    to={link.href}
                    end={link.end}
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
            <button onClick={openChat} className="flex flex-col items-center justify-center gap-1 w-full h-full text-text-muted dark:text-neutral-400 active:scale-90 relative">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs font-medium">Bantuan</span>
                {customerUnreadCount > 0 && (
                    <span className="absolute top-4 right-[calc(50%-22px)] bg-danger text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface dark:border-[#1C1C1E]">
                        {customerUnreadCount}
                    </span>
                )}
            </button>
        </nav>
    );
};

export default BottomNav;