
import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@core/hooks/useNotifications';
import NotificationContent from './NotificationContent';
import { Bell, X } from 'lucide-react';
import { useTenantParam } from '@core/hooks/useTenantParam';

const NotificationPanel: React.FC = () => {
    const { closeNotificationPanel, markAllAsRead, unreadCount } = useNotifications();
    const { withTenant } = useTenantParam();

    return (
        <aside className="h-full w-full rounded-3xl bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-xl border border-white/40 dark:border-neutral-700/40 shadow-2xl shadow-black/10 p-3.5 flex flex-col font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                <h3 className="font-semibold tracking-tight text-text-primary dark:text-gray-100 flex items-center gap-2">
                    <Bell size={20} />
                    Notifikasi
                </h3>
                <button onClick={closeNotificationPanel} className="p-2 -mr-2 text-text-muted dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                    <X size={20} />
                </button>
            </div>
            {unreadCount > 0 && (
                <div className="pt-4 flex justify-end flex-shrink-0">
                    <button onClick={markAllAsRead} className="text-xs font-medium tracking-wide text-accent hover:underline">Tandai semua dibaca</button>
                </div>
            )}
            <div className="flex-grow overflow-y-auto custom-scrollbar -mx-4 px-4 mt-4">
                <NotificationContent onClose={closeNotificationPanel} />
            </div>
            <div className="pt-4 mt-auto border-t border-black/10 dark:border-white/10 text-center flex-shrink-0">
                <Link to={withTenant("/akun/notifikasi")} onClick={closeNotificationPanel} className="text-sm font-medium text-accent hover:underline">
                    Lihat Semua Halaman Notifikasi
                </Link>
            </div>
        </aside>
    );
};

export default NotificationPanel;