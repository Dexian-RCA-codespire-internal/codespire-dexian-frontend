// new file servicenow
import { useEffect, useRef, useState, useCallback } from 'react';
import webSocketService from '../services/websocketService';
import { transformTicketToRCACase } from '../api/rcaService';

/**
 * WebSocket-only hook that completely eliminates REST API calls
 * All data fetching is done through WebSocket events
 */
export const useWebSocketOnly = (serverUrl = 'http://localhost:8081') => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  // Data state
  const [tickets, setTickets] = useState([]);
  const [newTickets, setNewTickets] = useState([]);
  const [pollingStatus, setPollingStatus] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
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
  
  // Cache for previously fetched pages
  const pageCache = useRef(new Map());
  
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
   * Add notification
   */
  const addNotification = useCallback((notificationData) => {
    const notification = {
      id: Date.now() + Math.random(),
      message: notificationData.message,
      type: notificationData.notificationType || 'info',
      timestamp: notificationData.timestamp || new Date().toISOString()
    };

    setNotifications(prevNotifications => [notification, ...prevNotifications]);

    // Remove notification after 10 seconds
    setTimeout(() => {
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n.id !== notification.id)
      );
    }, 10000);
  }, []);

  /**
   * Remove notification
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(n => n.id !== notificationId)
    );
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

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
      setIsLoading(true);
    }
    
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
    // Connect to WebSocket
    webSocketService.connect(serverUrl);

    // Connection status handlers
    const handleConnection = (data) => {
      setIsConnected(data.connected);
      if (data.connected) {
        setConnectionError(null);
        console.log('✅ WebSocket connected - ready for data requests');
      }
    };

    const handleConnectionError = (error) => {
      setConnectionError(error.message || 'Connection failed');
      setIsConnected(false);
    };

    const handleReconnection = (data) => {
      console.log(`🔄 WebSocket reconnected after ${data.attemptNumber} attempts`);
      setConnectionError(null);
    };

    const handleReconnectionError = (error) => {
      setConnectionError(error.message || 'Reconnection failed');
    };

    const handleReconnectionFailed = () => {
      setConnectionError('Failed to reconnect after maximum attempts');
    };

    // Ticket update handlers
    const handleTicketUpdate = (data) => {
      console.log('📡 Received real-time ticket update:', data);
      
      if (data.type === 'new_ticket') {
        addTicket(data.ticket);
      } else if (data.type === 'updated_ticket') {
        updateTicket(data.ticket);
      }
    };

    // Polling status handler
    const handlePollingStatus = (data) => {
      setPollingStatus(data.status);
    };

    // Notification handler
    const handleNotification = (data) => {
      addNotification(data);
    };

    // Paginated data handlers (WebSocket responses)
    const handlePaginatedDataResponse = (data) => {
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
        
        // Clear pending request
        const requestId = `page-${data.pagination.currentPage}-limit-${data.pagination.limit}`;
        pendingRequests.current.delete(requestId);
        
        console.log('✅ Received paginated data via WebSocket:', {
          count: transformedData.length,
          page: data.pagination.currentPage,
          total: data.pagination.totalCount
        });
      }
    };

    const handlePaginatedDataError = (data) => {
      console.error('❌ Paginated data error via WebSocket:', data);
      setIsLoading(false);
      setIsInitialLoad(false);
      
      // Clear pending request
      pendingRequests.current.clear();
      
      addNotification({
        message: `Failed to load data: ${data.error}`,
        notificationType: 'error',
        timestamp: data.timestamp
      });
    };

    // Data statistics handlers (WebSocket responses)
    const handleDataStatisticsResponse = (data) => {
      if (data.success) {
        setDataStatistics(data.data);
        console.log('✅ Received statistics via WebSocket:', data.data);
      }
    };

    const handleDataStatisticsError = (data) => {
      console.error('❌ Data statistics error via WebSocket:', data);
      addNotification({
        message: `Failed to load statistics: ${data.error}`,
        notificationType: 'error',
        timestamp: data.timestamp
      });
    };

    // Sync event handlers
    const handleSyncStarted = (data) => {
      setSyncState(prev => ({ ...prev, isSyncInProgress: true }));
    };

    const handleInitialSyncBatch = (data) => {
      console.log(`📦 Processing initial sync batch ${data.batchNumber}/${data.totalBatches}`);
      addTicketsBatch(data.batch);
    };

    const handleInitialSyncComplete = (data) => {
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
      console.log('📦 Processing incremental sync batch');
      addTicketsBatch(data.batch);
    };

    const handleIncrementalSyncComplete = (data) => {
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
      
      // Disconnect when component unmounts
      webSocketService.disconnect();
    };
  }, [serverUrl, addTicket, updateTicket, addTicketsBatch, addNotification]);

  // Ping server every 30 seconds to keep connection alive
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(() => {
        webSocketService.ping();
      }, 30000);

      return () => clearInterval(pingInterval);
    }
  }, [isConnected]);

  return {
    // Connection status
    isConnected,
    connectionError,
    
    // Data (WebSocket only - NO REST API calls)
    tickets,
    newTickets,
    pollingStatus,
    
    // Pagination (WebSocket only)
    pagination,
    isLoading,
    isInitialLoad,
    dataStatistics,
    
    // Notifications
    notifications,
    removeNotification,
    clearNotifications,
    
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
