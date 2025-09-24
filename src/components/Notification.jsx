import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Card, IconButton } from '@radix-ui/themes';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Notification = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification with slight delay for smooth animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide notification after duration
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation to complete
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      case 'warning':
        return <AlertTriangle size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#22c55e'; // green-500 - better contrast
      case 'error':
        return '#ef4444'; // red-500 - better contrast
      case 'warning':
        return '#f59e0b'; // amber-500
      default:
        return '#3b82f6'; // blue-500
    }
  };

  return (
    <div
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease-in-out',
        zIndex: 50,
        width: '200px',
        minHeight: '36px'
      }}
    >
      <Card
        style={{
          backgroundColor: 'var(--gray-2)',
          border: '1px solid var(--gray-6)',
          borderRadius: '6px',
          padding: '6px 8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
      >
        <Flex align="center" justify="between" gap="1">
          <Flex align="center" gap="1">
            <Box
              style={{
                backgroundColor: 'var(--gray-4)',
                padding: '4px',
                borderRadius: '4px',
                color: getIconColor(),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {getIcon()}
            </Box>
            <Box style={{ flex: 1 }}>
              {title && (
                <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', display: 'block', marginBottom: '1px' }}>
                  {title}
                </Text>
              )}
              <Text size="1" style={{ color: 'var(--gray-11)', display: 'block' }}>
                {message}
              </Text>
            </Box>
          </Flex>
          <IconButton
            size="1"
            variant="ghost"
            style={{
              color: 'var(--gray-10)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '3px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(() => onClose(id), 300);
            }}
          >
            <X size={12} />
          </IconButton>
        </Flex>
      </Card>
    </div>
  );
};

export default Notification;
