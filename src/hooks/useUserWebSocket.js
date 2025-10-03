import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for managing user data via WebSocket
 * Similar to the existing ticket WebSocket implementation
 */
const useUserWebSocket = (backendUrl) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    recentUsers: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const pingIntervalRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!backendUrl) return;

    const connect = () => {
      try {
        console.log('🔌 Connecting to user WebSocket...');
        
        socketRef.current = io(backendUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true,
          pingTimeout: 60000,
          pingInterval: 25000,
          upgradeTimeout: 10000
        });

        // Connection event handlers
        socketRef.current.on('connect', () => {
          console.log('✅ User WebSocket connected');
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
          
          // Join users room for targeted updates
          socketRef.current.emit('join_room', 'users');
          
          // Start periodic ping to keep connection alive
          startPeriodicPing();
        });

        socketRef.current.on('disconnect', (reason) => {
          console.log('❌ User WebSocket disconnected:', reason);
          setIsConnected(false);
          stopPeriodicPing();
          
          // Attempt reconnection if not manually disconnected
          if (reason !== 'io client disconnect') {
            attemptReconnection();
          }
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('❌ User WebSocket connection error:', error);
          setError('Connection failed');
          setIsConnected(false);
          attemptReconnection();
        });

        // User data event handlers
        socketRef.current.on('user_data_response', (data) => {
          console.log('📥 Received user data:', data);
          if (data.success) {
            setUsers(data.data);
            setPagination(data.pagination);
            setError(null);
            setIsInitialLoad(false); // Mark initial load as complete
          } else {
            setError(data.error || 'Failed to fetch users');
          }
          setLoading(false);
        });

        socketRef.current.on('user_data_error', (data) => {
          console.error('❌ User data error:', data);
          setError(data.error || 'Failed to fetch users');
          setLoading(false);
        });

        socketRef.current.on('user_statistics_response', (data) => {
          console.log('📊 Received user statistics:', data);
          if (data.success) {
            console.log('📊 Setting statistics data:', data.data);
            setStatistics(data.data);
          } else {
            console.error('📊 Statistics response failed:', data.error);
          }
        });

        socketRef.current.on('user_statistics_error', (data) => {
          console.error('❌ User statistics error:', data);
        });

        // Real-time user updates
        socketRef.current.on('user_update', (data) => {
          console.log('🔄 Received user update:', data);
          
          switch (data.type) {
            case 'user_created':
              setUsers(prev => [data.user, ...prev]);
              setStatistics(prev => ({
                ...prev,
                totalUsers: prev.totalUsers + 1,
                activeUsers: data.user.status === 'active' ? prev.activeUsers + 1 : prev.activeUsers
              }));
              addNotification(`New user created: ${data.user.name}`, 'success');
              break;
              
            case 'user_updated':
              setUsers(prev => prev.map(user => 
                user._id === data.user._id ? data.user : user
              ));
              addNotification(`User updated: ${data.user.name}`, 'info');
              break;
              
            case 'user_deleted':
              setUsers(prev => prev.filter(user => user._id !== data.user._id));
              setStatistics(prev => ({
                ...prev,
                totalUsers: Math.max(0, prev.totalUsers - 1)
              }));
              addNotification(`User deleted`, 'warning');
              break;
          }
        });

        // Notification handlers
        socketRef.current.on('notification', (data) => {
          console.log('🔔 Received notification:', data);
          addNotification(data.message, data.notificationType || 'info');
        });

        // Ping/pong for connection health
        socketRef.current.on('pong', () => {
          console.log('🏓 Received pong from server');
        });

        // Handle idle warnings and disconnections
        socketRef.current.on('idle_warning', (data) => {
          console.log(`⚠️ Server warning: Connection idle for ${data.idleTime}s`);
          addNotification(`Connection idle for ${data.idleTime}s`, 'warning');
        });

        socketRef.current.on('idle_disconnect', (data) => {
          console.log(`🔌 Server disconnected due to inactivity: ${data.reason}`);
          addNotification('Connection closed due to inactivity', 'error');
          setIsConnected(false);
          attemptReconnection();
        });

      } catch (error) {
        console.error('❌ Failed to initialize user WebSocket:', error);
        setError('Failed to connect to server');
        setIsConnected(false);
        attemptReconnection();
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      stopPeriodicPing();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [backendUrl]);

  // Periodic ping functions
  const startPeriodicPing = () => {
    stopPeriodicPing(); // Clear any existing interval
    pingIntervalRef.current = setInterval(() => {
      if (socketRef.current && isConnected) {
        console.log('🏓 Sending ping to server');
        socketRef.current.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  };

  const stopPeriodicPing = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  // Reconnection logic
  const attemptReconnection = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      setError('Unable to connect to server');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttempts.current++;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // Reconnect will be triggered by the useEffect
    }, delay);
  };

  // Add notification
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Request user data - memoized to prevent unnecessary re-renders
  const requestUserData = useCallback((options = {}) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Cannot request user data: not connected');
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log('📤 Requesting user data:', options);
    socketRef.current.emit('request_user_data', options);
  }, [isConnected]);

  // Request user statistics - memoized to prevent unnecessary re-renders
  const requestUserStatistics = useCallback((options = {}) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Cannot request user statistics: not connected');
      return;
    }

    console.log('📤 Requesting user statistics:', options);
    socketRef.current.emit('request_user_statistics', options);
  }, [isConnected]);

  // Ping server - memoized
  const ping = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('ping');
    }
  }, [isConnected]);

  // Clear notifications - memoized
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    // State
    users,
    loading,
    isInitialLoad,
    error,
    pagination,
    statistics,
    isConnected,
    notifications,
    
    // Actions
    requestUserData,
    requestUserStatistics,
    ping,
    clearNotifications,
    
    // Utilities
    addNotification
  };
};

export default useUserWebSocket;
