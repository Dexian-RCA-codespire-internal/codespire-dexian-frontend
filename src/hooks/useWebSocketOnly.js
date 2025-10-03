// new file servicenow
import { useEffect, useRef, useState, useCallback } from 'react';
import webSocketService from '../services/websocketService';
import { transformTicketToRCACase } from '../api/rcaService';
import { useToast } from '../contexts/ToastContext';
import { webSocketManager } from '../utils/websocketManager';

/**
 * WebSocket-only hook that completely eliminates REST API calls
 * All data fetching is done through WebSocket events
 */
export const useWebSocketOnly = (serverUrl = 'http://localhost:8081') => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { success, error, info, warning } = useToast();
  
  // Data state
  const [tickets, setTickets] = useState([]);
  const [newTickets, setNewTickets] = useState([]);
  const [pollingStatus, setPollingStatus] = useState(null);
  const [lastPollingEvent, setLastPollingEvent] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    limit: 10,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Statistics
  const [dataStatistics, setDataStatistics] = useState(null);
  
  // Sync state
  const [syncState, setSyncState] = useState({
    isInitialSyncComplete: false,
    isSyncInProgress: false,
    lastSyncTimestamp: null
  });
  
  // Request tracking to prevent duplicate requests
  const pendingRequests = useRef(new Set());
  const requestTimeouts = useRef(new Map());
  
  // Cache for previously fetched pages
  const pageCache = useRef(new Map());
  
  // Store handlers in refs to prevent re-creation
  const handlersRef = useRef({});
  const isMountedRef = useRef(true);
  
  // Create stable event handlers using useCallback
  const handleConnection = useCallback((data) => {
    if (!isMountedRef.current) return;
    setIsConnected(data.connected);
    if (data.connected) {
      setConnectionError(null);
      console.log('✅ WebSocket connected - ready for data requests');
    } else {
      console.log('❌ WebSocket disconnected:', data.reason);
    }
  }, []);

  const handleConnectionError = useCallback((error) => {
    if (!isMountedRef.current) return;
    setConnectionError(error.message || 'Connection failed');
    setIsConnected(false);
  }, []);

  
  const ticketsRef = useRef([]);
  const newTicketsRef = useRef([]);

  // Update refs when state changes
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  useEffect(() => {
    newTicketsRef.current = newTickets;
  }, [newTickets]);

  /**
   * Add a new ticket to the real-time list
   */
  const addTicket = useCallback((ticketData) => {
    const transformedTicket = transformTicketToRCACase(ticketData);
    
    setTickets(prevTickets => {
      // Check if ticket already exists
      const exists = prevTickets.some(ticket => ticket.ticketId === transformedTicket.ticketId);
      if (exists) {
        // Update existing ticket
        return prevTickets.map(ticket => 
          ticket.ticketId === transformedTicket.ticketId ? transformedTicket : ticket
        );
      } else {
        // Add new ticket to the beginning
        return [transformedTicket, ...prevTickets];
      }
    });

    // Add to new tickets for highlighting
    setNewTickets(prevNewTickets => {
      const exists = prevNewTickets.some(ticket => ticket.ticketId === transformedTicket.ticketId);
      if (!exists) {
        return [transformedTicket, ...prevNewTickets];
      }
      return prevNewTickets;
    });

    // Remove from new tickets after 5 seconds
    setTimeout(() => {
      setNewTickets(prevNewTickets => 
        prevNewTickets.filter(ticket => ticket.ticketId !== transformedTicket.ticketId)
      );
    }, 5000);

    // Invalidate cache for page 1 (where new tickets appear)
    clearPageCacheForPage(1);
  }, []);

  /**
   * Update an existing ticket in real-time list
   */
  const updateTicket = useCallback((ticketData) => {
    const transformedTicket = transformTicketToRCACase(ticketData);
    
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.ticketId === transformedTicket.ticketId ? transformedTicket : ticket
      )
    );

    // Invalidate all cached pages since ticket updates can affect sorting/filtering
    clearPageCache();
  }, []);

  // Create handleTicketUpdate callback after addTicket and updateTicket are defined
  const handleTicketUpdate = useCallback((data) => {
    console.log('📡 Received real-time ticket update:', data);
    
    if (data.type === 'new_ticket') {
      addTicket(data.ticket);
    } else if (data.type === 'updated_ticket') {
      updateTicket(data.ticket);
    }
  }, [addTicket, updateTicket]);

  /**
   * Add multiple tickets (for initial sync)
   */
  const addTicketsBatch = useCallback((ticketsData) => {
    const transformedTickets = ticketsData.map(ticket => transformTicketToRCACase(ticket));
    
    setTickets(prevTickets => {
      // Create a map of existing tickets for quick lookup
      const existingTicketsMap = new Map();
      prevTickets.forEach(ticket => {
        existingTicketsMap.set(ticket.ticketId, ticket);
      });

      // Merge new tickets with existing ones
      const mergedTickets = [...prevTickets];
      
      transformedTickets.forEach(newTicket => {
        if (!existingTicketsMap.has(newTicket.ticketId)) {
          mergedTickets.push(newTicket);
        }
      });

      return mergedTickets;
    });
  }, []);

  /**
   * Add notification using toast system
   */
  const addNotification = useCallback((notificationData) => {
    const type = notificationData.notificationType || 'info';
    const message = notificationData.message;
    
    // Map notification types to toast functions
    switch (type) {
      case 'success':
        success(message);
        break;
      case 'error':
        error(message);
        break;
      case 'warning':
        warning(message);
        break;
      default:
        info(message);
        break;
    }
  }, [success, error, warning, info]);

  // Create handleNotification callback after addNotification is defined
  const handleNotification = useCallback((data) => {
    // Skip notifications for new tickets - user doesn't want them
    if (data.message && (data.message.includes('new ticket') || data.message.includes('New ticket'))) {
      return;
    }
    addNotification(data);
  }, [addNotification]);

  // Note: removeNotification and clearNotifications are now handled by the ToastContainer component

  /**
   * Clear page cache
   */
  const clearPageCache = useCallback(() => {
    pageCache.current.clear();
    console.log('🗑️ Page cache cleared');
  }, []);

  /**
   * Clear cache for a specific page
   */
  const clearPageCacheForPage = useCallback((page, limit = 10) => {
    const cacheKey = `${page}-${limit}-${JSON.stringify({})}`;
    pageCache.current.delete(cacheKey);
    console.log(`🗑️ Cache cleared for page ${page}`);
  }, []);

  /**
   * Request paginated data via WebSocket (NO REST API CALLS)
   */
  const fetchTickets = useCallback((page = 1, limit = 10, filters = {}, isBackgroundRefresh = false) => {
    const requestId = `page-${page}-limit-${limit}`;
    const cacheKey = `${page}-${limit}-${JSON.stringify(filters)}`;
    
    // Check cache first
    if (pageCache.current.has(cacheKey)) {
      console.log('📦 Using cached data for page:', page);
      const cachedData = pageCache.current.get(cacheKey);
      setTickets(cachedData.tickets);
      setPagination(cachedData.pagination);
      setIsLoading(false);
      setIsInitialLoad(false);
      return;
    }
    
    // Prevent duplicate requests
    if (pendingRequests.current.has(requestId)) {
      console.log('Request already pending:', requestId);
      return;
    }
    
    pendingRequests.current.add(requestId);
    
    if (!isBackgroundRefresh) {
      // Don't clear data for pagination - just set loading state
      // This prevents the page from jumping to top
      setIsLoading(true);
    }
    
    // Set timeout to prevent infinite loading (10 seconds)
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Request timeout for page:', page);
      pendingRequests.current.delete(requestId);
      requestTimeouts.current.delete(requestId);
      setIsLoading(false);
      setIsInitialLoad(false);
      
      addNotification({
        message: `Request timeout for page ${page}. Please try again.`,
        notificationType: 'error',
        timestamp: new Date().toISOString()
      });
    }, 10000);
    
    requestTimeouts.current.set(requestId, timeoutId);
    
    console.log('🔄 Fetching tickets via WebSocket:', { page, limit, filters });
    
    // Request data via WebSocket
    webSocketService.requestPaginatedData({
      page,
      limit,
      ...filters
    });
  }, []);

  /**
   * Request data statistics via WebSocket (NO REST API CALLS)
   */
  const fetchStatistics = useCallback(() => {
    console.log('📊 Fetching statistics via WebSocket');
    webSocketService.requestDataStatistics();
  }, []);

  /**
   * Request initial data sync via WebSocket (NO REST API CALLS)
   */
  const requestInitialSync = useCallback((options = {}) => {
    webSocketService.requestInitialSync(options);
  }, []);

  /**
   * Request incremental data sync via WebSocket (NO REST API CALLS)
   */
  const requestIncrementalSync = useCallback((options = {}) => {
    webSocketService.requestIncrementalSync(options);
  }, []);

  /**
   * Navigate to next page (WebSocket only)
   */
  const nextPage = useCallback((filters = {}) => {
    if (pagination.hasNextPage) {
      fetchTickets(pagination.currentPage + 1, pagination.limit, filters);
    }
  }, [pagination, fetchTickets]);

  /**
   * Navigate to previous page (WebSocket only)
   */
  const prevPage = useCallback((filters = {}) => {
    if (pagination.hasPrevPage) {
      fetchTickets(pagination.currentPage - 1, pagination.limit, filters);
    }
  }, [pagination, fetchTickets]);

  /**
   * Navigate to specific page (WebSocket only)
   */
  const goToPage = useCallback((page, filters = {}) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTickets(page, pagination.limit, filters);
    }
  }, [pagination, fetchTickets]);

  /**
   * Change page size (WebSocket only)
   */
  const changePageSize = useCallback((newLimit, filters = {}) => {
    fetchTickets(1, newLimit, filters);
  }, [fetchTickets]);

  // Setup WebSocket connection and event listeners
  useEffect(() => {
    isMountedRef.current = true;
    
    // Register this component as a subscriber
    const componentId = Math.random().toString(36).substr(2, 9);
    webSocketManager.subscribe(componentId);
    
    // Only initialize connection if not already done
    const shouldInitialize = webSocketManager.init(serverUrl);
    if (shouldInitialize) {
      console.log('🔌 Initializing WebSocket connection for:', serverUrl);
      webSocketService.connect(serverUrl);
    } else {
      console.log('🔌 Using existing WebSocket connection');
      // Set current connection state from existing connection
      setIsConnected(webSocketService.getConnectionStatus());
    }

    // Connection status handlers (now defined above with useCallback)

    const handleReconnection = (data) => {
      if (!isMountedRef.current) return;
      console.log(`🔄 WebSocket reconnected after ${data.attemptNumber} attempts`);
      setConnectionError(null);
    };

    const handleReconnectionError = (error) => {
      if (!isMountedRef.current) return;
      setConnectionError(error.message || 'Reconnection failed');
    };

    const handleReconnectionFailed = () => {
      if (!isMountedRef.current) return;
      setConnectionError('Failed to reconnect after maximum attempts');
    };

    // Ticket update handlers (now defined above with useCallback)

    // Polling status handler
    const handlePollingStatus = (data) => {
      if (!isMountedRef.current) return;
      console.log('🔍 Received polling status event:', data);
      
      // The backend sends data in format: { type: 'polling_status', status: actualData, timestamp: '...' }
      // We need to extract the actual status data
      const statusData = data.status || data;
      
      console.log('🔍 Extracted status data:', statusData);
      
      // Update polling status and track last event
      setPollingStatus(statusData);
      setLastPollingEvent(new Date());
      
      console.log('🔍 Updated polling status in state');
    };

    // Notification handler (now defined above with useCallback)

    // Paginated data handlers (WebSocket responses)
    const handlePaginatedDataResponse = (data) => {
      if (!isMountedRef.current) return;
      if (data.success) {
        const transformedData = data.data.map(ticket => transformTicketToRCACase(ticket));
        setTickets(transformedData);
        setPagination(data.pagination);
        setIsLoading(false);
        setIsInitialLoad(false);
        
        // Cache the data for future navigation
        const cacheKey = `${data.pagination.currentPage}-${data.pagination.limit}-${JSON.stringify({})}`;
        pageCache.current.set(cacheKey, {
          tickets: transformedData,
          pagination: data.pagination,
          timestamp: Date.now()
        });

        // Limit cache size to prevent memory issues (keep last 10 pages)
        if (pageCache.current.size > 10) {
          const oldestKey = pageCache.current.keys().next().value;
          pageCache.current.delete(oldestKey);
        }
        
        // Clear pending request and timeout
        const requestId = `page-${data.pagination.currentPage}-limit-${data.pagination.limit}`;
        pendingRequests.current.delete(requestId);
        
        // Clear timeout if it exists
        if (requestTimeouts.current.has(requestId)) {
          clearTimeout(requestTimeouts.current.get(requestId));
          requestTimeouts.current.delete(requestId);
        }
        
        console.log('✅ Received paginated data via WebSocket:', {
          count: transformedData.length,
          page: data.pagination.currentPage,
          total: data.pagination.totalCount
        });
      } else {
        // Handle unsuccessful response
        console.error('❌ Paginated data response unsuccessful:', data);
        setIsLoading(false);
        setIsInitialLoad(false);
        
        // Clear pending requests and timeouts
        pendingRequests.current.clear();
        requestTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
        requestTimeouts.current.clear();
        
        addNotification({
          message: `Failed to load page data: ${data.error || 'Unknown error'}`,
          notificationType: 'error',
          timestamp: new Date().toISOString()
        });
      }
    };

    const handlePaginatedDataError = (data) => {
      if (!isMountedRef.current) return;
      console.error('❌ Paginated data error via WebSocket:', data);
      setIsLoading(false);
      setIsInitialLoad(false);
      
      // Clear pending requests and timeouts
      pendingRequests.current.clear();
      requestTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      requestTimeouts.current.clear();
      
      addNotification({
        message: `Failed to load data: ${data.error}`,
        notificationType: 'error',
        timestamp: data.timestamp
      });
    };

    // Data statistics handlers (WebSocket responses)
    const handleDataStatisticsResponse = (data) => {
      if (!isMountedRef.current) return;
      if (data.success) {
        setDataStatistics(data.data);
        console.log('✅ Received statistics via WebSocket:', data.data);
      }
    };

    const handleDataStatisticsError = (data) => {
      if (!isMountedRef.current) return;
      console.error('❌ Data statistics error via WebSocket:', data);
      addNotification({
        message: `Failed to load statistics: ${data.error}`,
        notificationType: 'error',
        timestamp: data.timestamp
      });
    };

    // Sync event handlers
    const handleSyncStarted = (data) => {
      if (!isMountedRef.current) return;
      setSyncState(prev => ({ ...prev, isSyncInProgress: true }));
    };

    const handleInitialSyncBatch = (data) => {
      if (!isMountedRef.current) return;
      console.log(`📦 Processing initial sync batch ${data.batchNumber}/${data.totalBatches}`);
      addTicketsBatch(data.batch);
    };

    const handleInitialSyncComplete = (data) => {
      if (!isMountedRef.current) return;
      setSyncState(prev => ({
        ...prev,
        isInitialSyncComplete: true,
        isSyncInProgress: false,
        lastSyncTimestamp: data.timestamp
      }));
      addNotification({
        message: `Initial sync completed: ${data.totalTickets} tickets loaded`,
        notificationType: 'success',
        timestamp: data.timestamp
      });
    };

    const handleIncrementalSyncBatch = (data) => {
      if (!isMountedRef.current) return;
      console.log('📦 Processing incremental sync batch');
      addTicketsBatch(data.batch);
    };

    const handleIncrementalSyncComplete = (data) => {
      if (!isMountedRef.current) return;
      setSyncState(prev => ({
        ...prev,
        isSyncInProgress: false,
        lastSyncTimestamp: data.timestamp
      }));
      
      if (data.totalTickets > 0) {
        addNotification({
          message: `Incremental sync completed: ${data.totalTickets} tickets updated`,
          notificationType: 'info',
          timestamp: data.timestamp
        });
      }
    };

    const handleSyncError = (data) => {
      if (!isMountedRef.current) return;
      setSyncState(prev => ({ ...prev, isSyncInProgress: false }));
      addNotification({
        message: `Sync error: ${data.message}`,
        notificationType: 'error',
        timestamp: data.timestamp
      });
    };

    // Register event listeners
    webSocketService.on('connection', handleConnection);
    webSocketService.on('connection_error', handleConnectionError);
    webSocketService.on('reconnection', handleReconnection);
    webSocketService.on('reconnection_error', handleReconnectionError);
    webSocketService.on('reconnection_failed', handleReconnectionFailed);
    webSocketService.on('ticket_update', handleTicketUpdate);
    webSocketService.on('polling_status', handlePollingStatus);
    webSocketService.on('notification', handleNotification);
    webSocketService.on('paginated_data_response', handlePaginatedDataResponse);
    webSocketService.on('paginated_data_error', handlePaginatedDataError);
    webSocketService.on('data_statistics_response', handleDataStatisticsResponse);
    webSocketService.on('data_statistics_error', handleDataStatisticsError);
    webSocketService.on('sync_started', handleSyncStarted);
    webSocketService.on('initial_sync_batch', handleInitialSyncBatch);
    webSocketService.on('initial_sync_complete', handleInitialSyncComplete);
    webSocketService.on('incremental_sync_batch', handleIncrementalSyncBatch);
    webSocketService.on('incremental_sync_complete', handleIncrementalSyncComplete);
    webSocketService.on('sync_error', handleSyncError);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Unregister this component
      webSocketManager.unsubscribe(componentId);
      
      webSocketService.off('connection', handleConnection);
      webSocketService.off('connection_error', handleConnectionError);
      webSocketService.off('reconnection', handleReconnection);
      webSocketService.off('reconnection_error', handleReconnectionError);
      webSocketService.off('reconnection_failed', handleReconnectionFailed);
      webSocketService.off('ticket_update', handleTicketUpdate);
      webSocketService.off('polling_status', handlePollingStatus);
      webSocketService.off('notification', handleNotification);
      webSocketService.off('paginated_data_response', handlePaginatedDataResponse);
      webSocketService.off('paginated_data_error', handlePaginatedDataError);
      webSocketService.off('data_statistics_response', handleDataStatisticsResponse);
      webSocketService.off('data_statistics_error', handleDataStatisticsError);
      webSocketService.off('sync_started', handleSyncStarted);
      webSocketService.off('initial_sync_batch', handleInitialSyncBatch);
      webSocketService.off('initial_sync_complete', handleInitialSyncComplete);
      webSocketService.off('incremental_sync_batch', handleIncrementalSyncBatch);
      webSocketService.off('incremental_sync_complete', handleIncrementalSyncComplete);
      webSocketService.off('sync_error', handleSyncError);
      
      // Cleanup timeouts
      requestTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      requestTimeouts.current.clear();
      
      // Only disconnect if no other components are using the connection
      if (webSocketManager.cleanup()) {
        console.log('🔌 Disconnecting WebSocket - no more subscribers');
        webSocketService.disconnect();
      }
    };
  }, [serverUrl, handleConnection, handleConnectionError, handleTicketUpdate, handleNotification]);

  // Ping server every 30 seconds to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        webSocketService.ping();
      }, 30000);

      return () => clearInterval(pingInterval);
    }
  }, [isConnected]);

  // Perform immediate health check when WebSocket connects
  useEffect(() => {
    if (isConnected && !pollingStatus) {
      // Perform immediate health check when first connecting
      fetch('http://localhost:8081/api/v1/servicenow-polling/health-check')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setPollingStatus({
              isActive: data.data.success,
              isHealthy: data.data.success,
              status: data.data.success ? 'healthy' : 'error',
              message: data.data.message,
              timestamp: new Date()
            });
          } else {
            setPollingStatus({
              isActive: false,
              isHealthy: false,
              status: 'error',
              message: data.message || 'Health check failed',
              timestamp: new Date()
            });
          }
        })
        .catch(error => {
          console.error('Failed to perform initial health check:', error);
          setPollingStatus({
            isActive: false,
            isHealthy: false,
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date()
          });
        });
    }
  }, [isConnected, pollingStatus]);

  // Periodic health check every 30 seconds to detect configuration changes
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      fetch('http://localhost:8081/api/v1/servicenow-polling/health-check')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const newStatus = {
              isActive: data.data.success,
              isHealthy: data.data.success,
              status: data.data.success ? 'healthy' : 'error',
              message: data.data.message,
              timestamp: new Date()
            };
            
            // Only update if status has changed
            setPollingStatus(prev => {
              if (!prev || 
                  prev.isActive !== newStatus.isActive || 
                  prev.isHealthy !== newStatus.isHealthy ||
                  prev.message !== newStatus.message) {
                console.log('🔄 Health check status changed:', newStatus);
                return newStatus;
              }
              return prev;
            });
          } else {
            const newStatus = {
              isActive: false,
              isHealthy: false,
              status: 'error',
              message: data.message || 'Health check failed',
              timestamp: new Date()
            };
            
            setPollingStatus(prev => {
              if (!prev || 
                  prev.isActive !== newStatus.isActive || 
                  prev.isHealthy !== newStatus.isHealthy ||
                  prev.message !== newStatus.message) {
                console.log('🔄 Health check status changed:', newStatus);
                return newStatus;
              }
              return prev;
            });
          }
        })
        .catch(error => {
          console.error('Failed to perform periodic health check:', error);
          const newStatus = {
            isActive: false,
            isHealthy: false,
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date()
          };
          
          setPollingStatus(prev => {
            if (!prev || 
                prev.isActive !== newStatus.isActive || 
                prev.isHealthy !== newStatus.isHealthy ||
                prev.message !== newStatus.message) {
              console.log('🔄 Health check status changed:', newStatus);
              return newStatus;
            }
            return prev;
          });
        });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  // Monitor for missed polling events (polling runs every minute, so if we miss 1.5 events = 1.5 minutes)
  useEffect(() => {
    if (!isConnected || !lastPollingEvent) return;

    const checkMissedEvents = () => {
      const now = new Date();
      const timeSinceLastEvent = now - lastPollingEvent;
      const oneAndHalfMinutes = 1.5 * 60 * 1000; // 1.5 minutes in milliseconds

      if (timeSinceLastEvent > oneAndHalfMinutes) {
        setPollingStatus(prev => ({
          ...prev,
          isActive: false,
          isHealthy: false,
          status: 'error',
          error: 'No polling events received in the last 1.5 minutes',
          timestamp: now
        }));
      }
    };

    // Check every 15 seconds for faster detection
    const interval = setInterval(checkMissedEvents, 15000);
    return () => clearInterval(interval);
  }, [isConnected, lastPollingEvent]);

  return {
    // Connection status
    isConnected,
    connectionError,
    
    // Data (WebSocket only - NO REST API calls)
    tickets,
    newTickets,
    pollingStatus,
    setPollingStatus,
    lastPollingEvent,
    
    // Pagination (WebSocket only)
    pagination,
    isLoading,
    isInitialLoad,
    dataStatistics,
    
    // Toast notifications are now handled via ToastContext
    
    // Sync state and controls
    syncState,
    requestInitialSync,
    requestIncrementalSync,
    
    // Pagination controls (WebSocket only - NO REST API calls)
    fetchTickets, // This now uses WebSocket instead of REST API
    fetchStatistics, // This now uses WebSocket instead of REST API
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    
    // Cache management
    clearPageCache,
    clearPageCacheForPage,
    
    // Manual controls
    addTicket,
    updateTicket,
    connect: () => webSocketService.connect(serverUrl),
    disconnect: () => webSocketService.disconnect(),
    joinRoom: (room) => webSocketService.joinRoom(room),
    leaveRoom: (room) => webSocketService.leaveRoom(room)
  };
};

export default useWebSocketOnly;
