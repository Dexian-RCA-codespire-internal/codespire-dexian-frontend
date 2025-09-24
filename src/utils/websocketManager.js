// WebSocket connection manager for global state
class WebSocketManager {
  constructor() {
    this.initialized = false;
    this.serverUrl = null;
    this.subscribers = new Set();
  }

  init(serverUrl) {
    if (this.initialized && this.serverUrl === serverUrl) {
      return false; // Already initialized with same URL
    }
    
    this.serverUrl = serverUrl;
    this.initialized = true;
    return true; // Newly initialized
  }

  subscribe(callback) {
    this.subscribers.add(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  cleanup() {
    if (this.subscribers.size === 0) {
      this.initialized = false;
      this.serverUrl = null;
      return true; // Can safely disconnect
    }
    return false; // Still has subscribers
  }
}

export const webSocketManager = new WebSocketManager();