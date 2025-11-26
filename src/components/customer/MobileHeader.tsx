import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../hooks/useTheme';
import { useTenantParam } from '../../hooks/useTenantParam';

import RealTimeStatusWidget from './dashboard-home/RealTimeStatusWidget';

interface MobileHeaderProps {
    title: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title }) => {
    const { user } = useAuth();
    const { unreadCount, openNotificationPanel } = useNotifications();
    const { mode, toggleMode } = useTheme();
    const { withTenant } = useTenantParam();

    return (
        <header className="fixed top-0 left-0 right-0 h-20 bg-surface/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 z-20">
            {title === 'Beranda' ? (
                <div className="flex-1 min-w-0 mr-2">
                    <RealTimeStatusWidget />
                </div>
            ) : (
                <h1 className="text-xl font-bold text-text-primary dark:text-gray-100">{title}</h1>
            )}
            <div className="flex items-center gap-2 relative z-50">
                <button
                    onClick={toggleMode}
                    className="p-2.5 rounded-full text-text-muted dark:text-gray-400 relative"
                    aria-label="Toggle theme"
                >
                    {mode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button
                    onClick={openNotificationPanel}
                    className="p-2.5 rounded-full text-text-muted dark:text-gray-400 relative"
                    aria-label="Notifikasi"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface dark:ring-[#1C1C1E]"></span>
                    )}
                </button>
                {user && (
                    <Link to={withTenant("/akun/pengaturan")}>
                        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-white text-sm overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default MobileHeader;
