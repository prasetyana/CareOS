
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchNotificationsByUserId, markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../data/mockDB';
import { useToast } from '../hooks/useToast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: (isPolling?: boolean) => Promise<void>;
  isNotificationPanelOpen: boolean;
  toggleNotificationPanel: () => void;
  openNotificationPanel: () => void;
  closeNotificationPanel: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const previousNotificationsRef = useRef<Notification[]>([]);
  const isFirstLoadRef = useRef(true);

  const fetchNotifications = useCallback(async (isPolling = false) => {
    if (user) {
      if (!isPolling) setLoading(true);
      const data = await fetchNotificationsByUserId(user.id);

      if (!isFirstLoadRef.current) {
        // Detect new notifications
        const newNotifications = data.filter(n =>
          !previousNotificationsRef.current.some(prev => prev.id === n.id)
        );

        newNotifications.forEach(n => {
          if (!n.read) {
            addToast(n.title, 'info');
          }
        });
      } else {
        isFirstLoadRef.current = false;
      }

      previousNotificationsRef.current = data;
      setNotifications(data);
      if (!isPolling) setLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Poll every 30 seconds
      const intervalId = setInterval(() => {
        fetchNotifications(true);
      }, 30000);

      return () => clearInterval(intervalId);
    } else {
      setNotifications([]);
      setLoading(false);
    }
  }, [user, fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!user) return;
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    await markNotificationAsRead(user.id, notificationId);
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsAsRead(user.id);
  }, [user]);

  const toggleNotificationPanel = useCallback(() => setIsNotificationPanelOpen(prev => !prev), []);
  const openNotificationPanel = useCallback(() => setIsNotificationPanelOpen(true), []);
  const closeNotificationPanel = useCallback(() => setIsNotificationPanelOpen(false), []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, fetchNotifications, isNotificationPanelOpen, toggleNotificationPanel, openNotificationPanel, closeNotificationPanel }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
