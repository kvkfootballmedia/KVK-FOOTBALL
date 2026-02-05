'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';

interface Notification {
  id: string;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-4">
        {notifications.map((n) => (
          <Toast 
            key={n.id} 
            {...n} 
            onClose={removeNotification} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
