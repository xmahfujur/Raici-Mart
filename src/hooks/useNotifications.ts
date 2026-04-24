import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/features/notifications/notificationService';
import { useUserStore } from '@/store/useStore';

export const useNotifications = () => {
  const { user } = useUserStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const unsubscribe = notificationService.subscribeToUserNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    return notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    return notificationService.markAllAsRead(user.uid);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, loading };
};
