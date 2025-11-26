import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from '../../components/customer/NotificationItem';
import { BellOff } from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Notification } from '../../data/mockDB';

const groupNotificationsByDate = (notifications: Notification[]) => {
  const groups: { [key: string]: Notification[] } = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach(notif => {
    const notifDate = new Date(notif.timestamp);
    let key = '';

    if (notifDate.toDateString() === today.toDateString()) {
      key = 'Hari Ini';
    } else if (notifDate.toDateString() === yesterday.toDateString()) {
      key = 'Kemarin';
    } else {
      key = notifDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notif);
  });
  return groups;
};

const NotificationPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <SkeletonLoader className="h-9 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <SkeletonLoader className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-grow space-y-2">
            <SkeletonLoader className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <SkeletonLoader className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
    <SkeletonLoader className="h-9 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
     <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4">
          <SkeletonLoader className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-grow space-y-2">
            <SkeletonLoader className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
            <SkeletonLoader className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CustomerNotificationsPage: React.FC = () => {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const groupedNotifications = groupNotificationsByDate(notifications);
  const dateGroups = Object.keys(groupedNotifications);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-sans text-text-primary">Notifikasi</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm font-medium text-accent hover:underline"
          >
            Tandai semua sudah dibaca
          </button>
        )}
      </div>
      
      {loading ? (
        <NotificationPageSkeleton />
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <BellOff className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-xl font-semibold text-text-primary">Tidak Ada Notifikasi</h3>
          <p className="mt-2 text-text-muted">Semua notifikasi Anda akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {dateGroups.map(date => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider pb-2 border-b border-black/10 dark:border-white/10 mb-2">
                {date}
              </h2>
              <div className="divide-y divide-black/5 dark:divide-white/5 -my-2">
                {groupedNotifications[date].map(notif => (
                   <NotificationItem key={notif.id} notification={notif} onRead={markAsRead} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerNotificationsPage;
