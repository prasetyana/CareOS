import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}d lalu`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m lalu`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}j lalu`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}h lalu`;
};


const NotificationDropdown: React.FC = () => {
    const { notifications, loading } = useNotifications();

    return (
        <div 
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-scale-in"
            style={{ transformOrigin: 'top right' }}
        >
            <div className="p-4 border-b dark:border-gray-700">
                <h3 className="font-semibold text-brand-dark dark:text-gray-200">Notifikasi</h3>
            </div>
            <ul className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">
                {loading ? (
                    <li className="p-4 text-center text-sm text-brand-secondary dark:text-gray-400">Memuat...</li>
                ) : notifications.length === 0 ? (
                    <li className="p-4 text-center text-sm text-brand-secondary dark:text-gray-400">Tidak ada notifikasi baru.</li>
                ) : (
                    notifications.slice(0, 5).map(notif => (
                        <li key={notif.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                            <Link to={notif.link || '#'} className="block">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium text-sm text-brand-dark dark:text-gray-200">{notif.title}</p>
                                    {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-500"></span>}
                                </div>
                                <p className="text-xs text-brand-secondary dark:text-gray-400 mt-1">{formatTime(notif.timestamp)}</p>
                            </Link>
                        </li>
                    ))
                )}
            </ul>
            <div className="p-2 border-t dark:border-gray-700 text-center">
                 <a href="#" className="text-sm font-medium text-brand-primary hover:underline">Lihat semua notifikasi</a>
            </div>
        </div>
    );
};

export default NotificationDropdown;
