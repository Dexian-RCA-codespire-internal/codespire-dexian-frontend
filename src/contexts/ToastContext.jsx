import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Track message fingerprints to prevent duplicates
  const messageCache = useRef(new Map());

  const addToast = useCallback((message, type = 'info', options = {}) => {
    // Create a fingerprint to prevent duplicate messages
    const fingerprint = `${message}-${type}-${options.title || ''}`;
    const now = Date.now();
    
    // Check if this exact message was shown in the last 1 second
    if (messageCache.current.has(fingerprint)) {
      const lastShown = messageCache.current.get(fingerprint);
      if (now - lastShown < 1000) {
        console.log('Duplicate toast prevented:', message);
        return messageCache.current.get(`id-${fingerprint}`);
      }
    }
    
    const id = crypto.randomUUID();
    const toast = {
      id,
      message,
      type,
      // timestamp: Date.now(),
      duration: options.duration || 3500,
      persistent: options.persistent || false,
      title: options.title,
      ...options
    };

    // Cache this message
    messageCache.current.set(fingerprint, now);
    messageCache.current.set(`id-${fingerprint}`, id);
    
    // Clean up old cache entries (older than 5 seconds)
    for (const [key, timestamp] of messageCache.current.entries()) {
      if (typeof timestamp === 'number' && now - timestamp > 5000) {
        messageCache.current.delete(key);
        messageCache.current.delete(`id-${key}`);
      }
    }

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration (unless persistent)
    if (!toast.persistent && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options) => addToast(message, 'success', options), [addToast]);
  const error = useCallback((message, options) => addToast(message, 'error', options), [addToast]);
  const warning = useCallback((message, options) => addToast(message, 'warning', options), [addToast]);
  const info = useCallback((message, options) => addToast(message, 'info', options), [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
