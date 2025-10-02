import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Notification } from '../types/notifications';
import { NOTIFICATION_TEMPLATES, ROLES_TO_NOTIFY } from '../types/notifications';

export interface NotificationHook {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  notifyRole: (role: string, title: string, message: string, data: any) => void;
}

export function useNotifications(): NotificationHook {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);
  const [unreadCount, setUnreadCount] = useState(0);

  // Подсчитываем непрочитанные уведомления
  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [notification, ...prev]);
    
    // Показываем браузерное уведомление, если разрешено
    if (window.Notification && window.Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }

    return notification;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const notifyRole = (role: string, title: string, message: string, data: any) => {
    const rolesToNotify = ['dispatcher', 'accountant', 'director', 'manager'];
    
    if (!rolesToNotify.includes(role)) {
      return; // Роль не должна получать это уведомление
    }

    addNotification({
      title,
      message,
      type: 'info',
      userId: '', // будет заполнено при фильтрации
      role: role,
      relatedOrderId: data.orderId,
      relatedInvoiceId: data.invoiceId,
      priority: 'medium'
    });
  };

  // Запрашиваем разрешение на браузерные уведомления
  useEffect(() => {
    if (window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    notifyRole
  };
}
