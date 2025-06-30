import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'pending';
  title: string;
  message: string;
  autoClose?: boolean;
  onClose: (id: string) => void;
}

interface NotificationContextProps {
  showNotification: (notification: Omit<NotificationProps, 'id' | 'onClose'>) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const showNotification = (notification: Omit<NotificationProps, 'id' | 'onClose'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: clearNotification,
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      showNotification,
      clearNotification,
      clearAllNotifications,
    }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border shadow-lg max-w-sm ${
              notification.type === 'success' ? 'border-green-200 bg-green-50' :
              notification.type === 'error' ? 'border-red-200 bg-red-50' :
              notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              notification.type === 'info' ? 'border-blue-200 bg-blue-50' :
              'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <button
                    onClick={() => notification.onClose(notification.id)}
                    className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 