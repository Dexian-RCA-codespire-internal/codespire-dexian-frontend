// new file servicenow
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  /**
   * Initialize WebSocket connection
   * @param {String} serverUrl - Backend server URL
   */
  connect(serverUrl = 'http://localhost:8081') {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log(`🔌 Connecting to WebSocket server: ${serverUrl}`);
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000
    });

    this.setupEventHandlers();
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join tickets room for ticket-specific updates
      this.socket.emit('join_room', 'tickets');
      
      // Emit connection event to listeners
      this.emitToListeners('connection', { connected: true, socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emitToListeners('connection', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.emitToListeners('connection_error', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emitToListeners('reconnection', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnection error:', error);
      this.emitToListeners('reconnection_error', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed after maximum attempts');
      this.emitToListeners('reconnection_failed', null);
    });

    // Handle ticket updates
    this.socket.on('ticket_update', (data) => {
      console.log('📡 Received ticket update:', data);
      this.emitToListeners('ticket_update', data);
    });

    // Handle polling status updates
    this.socket.on('polling_status', (data) => {
      console.log('📡 Received polling status:', data);
      this.emitToListeners('polling_status', data);
    });

    // Handle notifications
    this.socket.on('notification', (data) => {
      console.log('📡 Received notification:', data);
      this.emitToListeners('notification', data);
    });

    // Handle pong responses
    this.socket.on('pong', () => {
      console.log('🏓 Received pong from server');
    });

    // Note: Removed paginated_data_response and data_statistics_response handlers
    // Frontend now relies entirely on real-time push events

    // Handle sync events
    this.socket.on('sync_started', (data) => {
      console.log('📡 Received sync started:', data);
      this.emitToListeners('sync_started', data);
    });

    this.socket.on('initial_sync_batch', (data) => {
      console.log('📡 Received initial sync batch:', data);
      this.emitToListeners('initial_sync_batch', data);
    });

    this.socket.on('initial_sync_complete', (data) => {
      console.log('📡 Received initial sync complete:', data);
      this.emitToListeners('initial_sync_complete', data);
    });

    this.socket.on('incremental_sync_batch', (data) => {
      console.log('📡 Received incremental sync batch:', data);
      this.emitToListeners('incremental_sync_batch', data);
    });

    this.socket.on('incremental_sync_complete', (data) => {
      console.log('📡 Received incremental sync complete:', data);
      this.emitToListeners('incremental_sync_complete', data);
    });

    this.socket.on('sync_error', (data) => {
      console.error('❌ Received sync error:', data);
      this.emitToListeners('sync_error', data);
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  /**
   * Join a specific room
   * @param {String} room - Room name
   */
  joinRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', room);
      console.log(`📡 Joined room: ${room}`);
    }
  }

  /**
   * Leave a specific room
   * @param {String} room - Room name
   */
  leaveRoom(room) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', room);
      console.log(`📡 Left room: ${room}`);
    }
  }

  /**
   * Send ping to server
   */
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  /**
   * Request initial data sync via WebSocket (for initial load only)
   * @param {Object} options - Sync options
   */
  requestInitialSync(options = {}) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ WebSocket not connected - cannot request initial sync');
      return;
    }
    
    console.log('🔄 Requesting initial sync with options:', options);
    console.log('🔌 Socket connected:', this.isConnected);
    console.log('🔌 Socket ID:', this.socket.id);
    this.socket.emit('request_initial_sync', options);
  }

  /**
   * Add event listener
   * @param {String} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {String} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   * @param {String} event - Event name
   * @param {*} data - Event data
   */
  emitToListeners(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   * @returns {Boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get socket instance
   * @returns {Object} Socket instance
   */
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;


