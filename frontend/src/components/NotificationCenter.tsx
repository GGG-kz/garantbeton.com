import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuthStore } from '../stores/authStore';
import { 
  Bell, 
  X, 
  Check, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  // Фильтруем уведомления по роли пользователя и статусу
  const filteredNotifications = notifications.filter(notification => {
    const matchesRole = !notification.role || notification.role === user?.role;
    const matchesFilter = filter === 'all' || !notification.isRead;
    return matchesRole && matchesFilter;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-black" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-mono-700" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-mono-800" />;
      default:
        return <Info className="w-5 h-5 text-mono-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-black';
      case 'medium':
        return 'border-l-mono-700';
      default:
        return 'border-l-mono-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-mono-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mono-200">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-black" />
            <h2 className="text-xl font-semibold text-black">
              Уведомления
              {unreadCount > 0 && (
                <span className="ml-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-mono-400 hover:text-black"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-mono-200 bg-mono-50">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  filter === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border-2 border-mono-300'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  filter === 'unread' 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black border-2 border-mono-300'
                }`}
              >
                Непрочитанные
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-black bg-mono-100 rounded-lg hover:bg-mono-200 border-2 border-mono-300"
              >
                <Check className="w-4 h-4" />
                <span>Прочитать все</span>
              </button>
              <button
                onClick={clearNotifications}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-white bg-mono-800 rounded-lg hover:bg-black border-2 border-mono-800"
              >
                <Trash2 className="w-4 h-4" />
                <span>Очистить</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-mono-500">
              <Bell className="w-12 h-12 mb-4 text-mono-300" />
              <p className="text-lg font-medium text-black">Нет уведомлений</p>
              <p className="text-sm">
                {filter === 'unread' 
                  ? 'Все уведомления прочитаны' 
                  : 'Уведомления появятся здесь'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-mono-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-mono-50 transition-colors ${
                    !notification.isRead ? 'bg-mono-100' : ''
                  }`}
                >
                  <div className={`flex items-start space-x-3 border-l-4 pl-4 ${getPriorityColor(notification.priority)}`}>
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-black' : 'text-mono-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-mono-500">
                            {formatDate(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-black hover:text-mono-800"
                              title="Отметить как прочитанное"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${
                        !notification.isRead ? 'text-mono-800' : 'text-mono-600'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.relatedOrderId && (
                        <div className="mt-2 flex items-center space-x-2 text-xs text-mono-600">
                          <span>Заказ #{notification.relatedOrderId}</span>
                          {notification.relatedInvoiceId && (
                            <span>• Накладная #{notification.relatedInvoiceId}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

