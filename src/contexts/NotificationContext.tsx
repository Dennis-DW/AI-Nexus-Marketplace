import React, { createContext, useContext, useState, ReactNode } from 'react';
import TransactionNotification, { TransactionNotificationProps } from '../components/TransactionNotification';

interface NotificationContextProps {
  showNotification: (notification: Omit<TransactionNotificationProps, 'id' | 'onClose'>) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<TransactionNotificationProps[]>([]);

  const showNotification = (notification: Omit<TransactionNotificationProps, 'id' | 'onClose'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: TransactionNotificationProps = {
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
          <TransactionNotification
            key={notification.id}
            {...notification}
          />
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