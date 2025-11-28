
import React from 'react';
import { useNotifications } from '@core/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import { BellOff } from 'lucide-react';
import { Notification } from '@core/data/mockDB';
import SkeletonLoader from '@ui/SkeletonLoader';

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

interface NotificationContentProps {
  onClose: () => void;
}

const NotificationContent: React.FC<NotificationContentProps> = ({ onClose }) => {
  const { notifications, loading, markAsRead } = useNotifications();
  const groupedNotifications = groupNotificationsByDate(notifications);
  const dateGroups = Object.keys(groupedNotifications);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <SkeletonLoader className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-grow space-y-2">
              <SkeletonLoader className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <SkeletonLoader className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center pt-20 text-text-muted">
        <BellOff size={48} className="mx-auto mb-4 text-neutral-300 dark:text-neutral-600" />
        <p className="font-medium">Tidak ada notifikasi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {dateGroups.map(date => (
        <div key={date}>
          <h2 className="text-sm font-medium tracking-wide text-text-muted uppercase pb-2 border-b border-black/10 dark:border-white/10 mb-2">
            {date}
          </h2>
          <div className="divide-y divide-black/5 dark:divide-white/5 -my-2">
            {groupedNotifications[date].map(notif => (
              <NotificationItem key={notif.id} notification={notif} onRead={markAsRead} onClose={onClose} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContent;
