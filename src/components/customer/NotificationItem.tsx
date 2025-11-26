
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../data/mockDB';
import { ShoppingBag, Ticket, Calendar, Gift, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTenantParam } from '../../hooks/useTenantParam';

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  onClose?: () => void;
}

const getNotificationMeta = (type: Notification['type']) => {
  switch (type) {
    case 'order_status': return { Icon: ShoppingBag, color: 'bg-green-500' };
    case 'new_promo': return { Icon: Ticket, color: 'bg-orange-500' };
    case 'reservation_reminder': return { Icon: Calendar, color: 'bg-blue-500' };
    case 'reward_update': return { Icon: Gift, color: 'bg-yellow-500' };
    case 'general_info': return { Icon: Info, color: 'bg-gray-500' };
    default: return { Icon: Info, color: 'bg-gray-500' };
  }
};

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

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead, onClose }) => {
  const navigate = useNavigate();
  const { Icon, color } = getNotificationMeta(notification.type);
  const { withTenant } = useTenantParam();

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.link) {
      navigate(withTenant(notification.link));
      if (onClose) onClose();
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ backgroundColor: 'rgba(var(--color-brand-primary-rgb), 0.05)' }}
      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer"
    >
      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <p className={`font-medium text-sm ${notification.read ? 'text-text-muted' : 'text-text-primary'}`}>
          {notification.title}
        </p>
        <p className={`text-sm mt-0.5 ${notification.read ? 'text-text-muted' : 'text-text-primary'}`}>
          {notification.message}
        </p>
        <p className="text-xs text-accent mt-1.5">{formatTime(notification.timestamp)}</p>
      </div>
      {!notification.read && (
        <div className="w-2.5 h-2.5 bg-accent rounded-full flex-shrink-0 mt-1.5" aria-label="Unread"></div>
      )}
    </motion.div>
  );
};

export default NotificationItem;
