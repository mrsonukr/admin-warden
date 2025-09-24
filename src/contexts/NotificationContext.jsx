import React, { createContext, useContext, useState, useEffect } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add keyboard shortcut for debug notifications (Ctrl+I)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'i') {
        event.preventDefault();
        showNotification({
          type: 'info',
          title: 'Debug Notification',
          message: 'debugging Started!',
          duration: 3000
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = ({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      title,
      message,
      duration
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (title, message, duration) => {
    return showNotification({ type: 'success', title, message, duration });
  };

  const showError = (title, message, duration) => {
    return showNotification({ type: 'error', title, message, duration });
  };

  const showWarning = (title, message, duration) => {
    return showNotification({ type: 'warning', title, message, duration });
  };

  const showInfo = (title, message, duration) => {
    return showNotification({ type: 'info', title, message, duration });
  };

  const value = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        {notifications.map(notification => (
          <div key={notification.id} style={{ pointerEvents: 'auto' }}>
            <Notification
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
