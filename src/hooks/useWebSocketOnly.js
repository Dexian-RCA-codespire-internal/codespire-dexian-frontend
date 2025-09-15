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
  
  // Pagination state (for UI display only - data comes from real-time events)
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
  
  // Statistics (updated from real-time events)
  const [dataStatistics, setDataStatistics] = useState(null);
  
  // Sync state
  const [syncState, setSyncState] = useState({
    isInitialSyncComplete: false,
    isSyncInProgress: false,
    lastSyncTimestamp: null,
    syncProgress: {
      currentBatch: 0,
      totalBatches: 0,
      percentage: 0
    }
  });
  
  // Local data management (no more requests - just real-time updates)
  const allTicketsRef = useRef([]);
  const [displayedTickets, setDisplayedTickets] = useState([]);
  
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
   * Update displayed tickets based on current pagination
   */
  const updateDisplayedTickets = useCallback((page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const pageTickets = allTicketsRef.current.slice(startIndex, endIndex);
    
    setDisplayedTickets(pageTickets);
    setTickets(pageTickets);
    
    // Update pagination info
    const totalCount = allTicketsRef.current.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    setPagination({
      currentPage: page,
      totalPages,
      limit,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
    
    console.log(`📄 Updated display: page ${page}/${totalPages}, showing ${pageTickets.length}/${totalCount} tickets`);
  }, []);

  /**
   * Add a new ticket to the real-time list
   */
  const addTicket = useCallback((ticketData) => {
    const transformedTicket = transformTicketToRCACase(ticketData);
    
    // Add to all tickets collection
    allTicketsRef.current = [transformedTicket, ...allTicketsRef.current];
    
    // Update displayed tickets if we're on page 1
    if (pagination.currentPage === 1) {
      updateDisplayedTickets(1, pagination.limit);
    }

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

    console.log(`✅ Added new ticket: ${transformedTicket.ticketId}`);
  }, [pagination, updateDisplayedTickets]);

  /**
   * Update an existing ticket in real-time list
   */
  const updateTicket = useCallback((ticketData) => {
    const transformedTicket = transformTicketToRCACase(ticketData);
    
    // Update in all tickets collection
    const ticketIndex = allTicketsRef.current.findIndex(ticket => ticket.ticketId === transformedTicket.ticketId);
    if (ticketIndex !== -1) {
      allTicketsRef.current[ticketIndex] = transformedTicket;
      
      // Update displayed tickets if this ticket is currently visible
      updateDisplayedTickets(pagination.currentPage, pagination.limit);
      
      console.log(`✅ Updated ticket: ${transformedTicket.ticketId}`);
    }
  }, [pagination, updateDisplayedTickets]);

  /**
   * Add multiple tickets (for initial sync)
   */
  const addTicketsBatch = useCallback((ticketsData) => {
    const transformedTickets = ticketsData.map(ticket => transformTicketToRCACase(ticket));
    
    // Add to all tickets collection, avoiding duplicates
    transformedTickets.forEach(newTicket => {
      const exists = allTicketsRef.current.some(ticket => ticket.ticketId === newTicket.ticketId);
      if (!exists) {
        allTicketsRef.current.push(newTicket);
      }
    });
    
    // Update displayed tickets
    updateDisplayedTickets(pagination.currentPage, pagination.limit);
    
    console.log(`✅ Added batch of ${transformedTickets.length} tickets`);
  }, [pagination, updateDisplayedTickets]);

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
   * Navigate to next page (local pagination only)
   */
  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      updateDisplayedTickets(pagination.currentPage + 1, pagination.limit);
    }
  }, [pagination, updateDisplayedTickets]);

  /**
   * Navigate to previous page (local pagination only)
   */
  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      updateDisplayedTickets(pagination.currentPage - 1, pagination.limit);
    }
  }, [pagination, updateDisplayedTickets]);

  /**
   * Navigate to specific page (local pagination only)
   */
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      updateDisplayedTickets(page, pagination.limit);
    }
  }, [pagination, updateDisplayedTickets]);

  /**
   * Change page size (local pagination only)
   */
  const changePageSize = useCallback((newLimit) => {
    updateDisplayedTickets(1, newLimit);
  }, [updateDisplayedTickets]);

  /**
   * Request initial data sync via WebSocket (for initial load only)
   */
  const requestInitialSync = useCallback((options = {}) => {
    console.log('🚀 Requesting initial sync with options:', options);
    webSocketService.requestInitialSync(options);
  }, []);

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
        console.log('🔌 Socket ID:', data.socketId);
      } else {
        console.log('❌ WebSocket disconnected:', data.reason);
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

    // Note: Removed all request-response handlers
    // Frontend now relies entirely on real-time push events

    // Sync event handlers
    const handleSyncStarted = (data) => {
      console.log('🔄 Sync started:', data);
      setSyncState(prev => ({ ...prev, isSyncInProgress: true }));
    };

    const handleInitialSyncBatch = (data) => {
      console.log(`📦 Processing initial sync batch ${data.batchNumber}/${data.totalBatches}`);
      console.log('📦 Batch data:', data.batch);
      
      // Update sync progress
      setSyncState(prev => ({
        ...prev,
        syncProgress: {
          currentBatch: data.batchNumber,
          totalBatches: data.totalBatches,
          percentage: Math.round((data.batchNumber / data.totalBatches) * 100)
        }
      }));
      
      addTicketsBatch(data.batch);
    };

    const handleInitialSyncComplete = (data) => {
      console.log('✅ Initial sync completed:', data);
      setSyncState(prev => ({
        ...prev,
        isInitialSyncComplete: true,
        isSyncInProgress: false,
        lastSyncTimestamp: data.timestamp
      }));
      setIsInitialLoad(false);
      setIsLoading(false);
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

    // Register event listeners (real-time only)
    webSocketService.on('connection', handleConnection);
    webSocketService.on('connection_error', handleConnectionError);
    webSocketService.on('reconnection', handleReconnection);
    webSocketService.on('reconnection_error', handleReconnectionError);
    webSocketService.on('reconnection_failed', handleReconnectionFailed);
    webSocketService.on('ticket_update', handleTicketUpdate);
    webSocketService.on('polling_status', handlePollingStatus);
    webSocketService.on('notification', handleNotification);
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
    
    // Data (Real-time only - NO requests)
    tickets,
    newTickets,
    pollingStatus,
    
    // Pagination (Local pagination only)
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
    syncProgress: syncState.syncProgress,
    requestInitialSync,
    
    // Pagination controls (Local pagination only)
    nextPage,
    prevPage,
    goToPage,
    changePageSize,
    
    // Manual controls
    addTicket,
    updateTicket,
    connect: () => webSocketService.connect(serverUrl),
    disconnect: () => webSocketService.disconnect(),
    joinRoom: (room) => webSocketService.joinRoom(room),
    leaveRoom: (room) => webSocketService.leaveRoom(room),
    
    // Loading state controls (for timeout handling)
    setIsInitialLoad,
    setIsLoading
  };
};

export default useWebSocketOnly;
