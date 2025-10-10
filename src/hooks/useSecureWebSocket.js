// new file servicenow
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import webSocketService from '../services/websocketService';
import { webSocketManager } from '../utils/websocketManager'
import { webSocketManager } from '../utils/websocketManager'

/**
 * Secure WebSocket hook with authentication
 */
export const useSecureWebSocket = () => {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [wsConnected, setWsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(null);
  const [lastPollingEvent, setLastPollingEvent] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const healthCheckIntervalRef = useRef(null);
  const componentIdRef = useRef(Math.random().toString(36).substr(2, 9));

  /**
   * Connect to WebSocket with authentication
   */
  const connect = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, skipping WebSocket connection');
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        console.error('❌ No access token available for WebSocket connection');
        setAuthError('No access token available');
        return;
      }

      // Clear previous errors
      setConnectionError(null);
      setAuthError(null);

      const serverUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081'

      // Subscribe to global manager and initialize if needed
      webSocketManager.subscribe(componentIdRef.current)
      const shouldInitialize = webSocketManager.init(serverUrl)
      if (shouldInitialize) {
        webSocketService.connect(serverUrl, token)
      } else {
        // If not initialized, ensure connection with token
        if (!webSocketService.getConnectionStatus()) {
          webSocketService.connect(serverUrl, token)
        }
      }
    } catch (error) {
      console.error('❌ Failed to get access token for WebSocket:', error);
      setAuthError('Failed to get access token');
    }
  }, [isAuthenticated, getAccessToken]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    // Cleanup via manager - unsubscribe and only disconnect if no subscribers
    try {
      // Attempt to find and remove a subscriber - best-effort since we didn't store id earlier
      // This will be a no-op if not present
      // Use a random id unsub rather than trying to remove unknown id
      webSocketManager.unsubscribe(undefined)
    } catch (e) {
      // ignore
    }

    if (webSocketManager.cleanup()) {
      webSocketService.disconnect();
    }
    setWsConnected(false);
    setConnectionError(null);
    setAuthError(null);
  }, []);

  /**
   * Handle WebSocket connection events
   */
  useEffect(() => {
    const handleConnection = (data) => {
      if (data.connected) {
        setWsConnected(true);
        setConnectionError(null);
        setAuthError(null);
        console.log('✅ Secure WebSocket connected:', data.socketId);
      } else {
        setWsConnected(false);
        console.log('❌ Secure WebSocket disconnected:', data.reason);
      }
    };

    const handleConnectionError = (error) => {
      setConnectionError(error);
      setWsConnected(false);
      console.error('❌ Secure WebSocket connection error:', error);
    };

    const handleAuthError = (error) => {
      setAuthError(error);
      setWsConnected(false);
      console.error('🔒 Secure WebSocket authentication error:', error);
      
      // Auto-reconnect after auth error (user might need to re-login)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated) {
          console.log('🔄 Attempting to reconnect after auth error...');
          connect();
        }
      }, 5000);
    };

    const handlePollingStatus = (data) => {
      const statusData = data.status || data;
      setPollingStatus(statusData);
      setLastPollingEvent(new Date().toISOString());
      console.log('📡 Received polling status:', statusData);
    };

    // Add event listeners
    webSocketService.on('connection', handleConnection);
    webSocketService.on('connection_error', handleConnectionError);
    webSocketService.on('auth_error', handleAuthError);
    webSocketService.on('polling_status', handlePollingStatus);

    // Cleanup function
    return () => {
      webSocketService.off('connection', handleConnection);
      webSocketService.off('connection_error', handleConnectionError);
      webSocketService.off('auth_error', handleAuthError);
      webSocketService.off('polling_status', handlePollingStatus);
      
      // Unsubscribe from manager and possibly disconnect
      try { webSocketManager.unsubscribe(componentIdRef.current) } catch (e) { /* ignore */ }
      if (webSocketManager.cleanup()) {
        webSocketService.disconnect();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, isAuthenticated]);

  /**
   * Auto-connect when user becomes authenticated
   */
  useEffect(() => {
    if (isAuthenticated && !wsConnected) {
      console.log('🔒 User authenticated, connecting to secure WebSocket...');
      connect();
    } else if (!isAuthenticated && wsConnected) {
      console.log('🔒 User not authenticated, disconnecting WebSocket...');
      disconnect();
    }
  }, [isAuthenticated, wsConnected, connect, disconnect]);

  /**
   * Periodic health check
   */
  useEffect(() => {
    if (wsConnected) {
      healthCheckIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`${import.meta.env.REACT_APP_BACKEND_URL}/api/v1/servicenow-polling/health-check`, {
            headers: {
              'Authorization': `Bearer ${await getAccessToken()}`
            }
          });
          
          if (!response.ok) {
            console.warn('⚠️ Health check failed:', response.status);
          }
        } catch (error) {
          console.warn('⚠️ Health check error:', error);
        }
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [wsConnected, getAccessToken]);

  /**
   * Monitor for missed polling events
   */
  useEffect(() => {
    if (!lastPollingEvent) return;

    const checkMissedEvents = () => {
      const now = new Date();
      const lastEvent = new Date(lastPollingEvent);
      const timeDiff = now - lastEvent;

      // If no polling event for 1.5 minutes, mark as disconnected
      if (timeDiff > 90000) {
        setPollingStatus(prev => ({
          ...prev,
          isActive: false,
          isHealthy: false,
          message: 'No polling events received'
        }));
      }
    };

    const interval = setInterval(checkMissedEvents, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastPollingEvent]);

  return {
    wsConnected,
    connectionError,
    authError,
    pollingStatus,
    lastPollingEvent,
    connect,
    disconnect
  };
};

