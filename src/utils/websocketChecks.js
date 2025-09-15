// new file servicenow
/**
 * ===================================================================
 * WEBSOCKET MONITORING UTILITY - DEVELOPMENT ONLY
 * ===================================================================
 * 
 * ⚠️  IMPORTANT: This file is ONLY for development logging and debugging
 * ⚠️  REMOVE THIS FILE BEFORE PRODUCTION DEPLOYMENT
 * ⚠️  This file does NOT contain core application logic
 * 
 * Purpose:
 * - Monitors and logs any REST API calls to ensure WebSocket-only implementation
 * - Helps developers identify accidental API usage during development
 * - Provides debugging information for WebSocket vs REST API usage
 * 
 * What it does:
 * - Intercepts fetch(), XMLHttpRequest, and axios calls
 * - Logs warnings when API calls to backend are detected
 * - Shows stack traces to help identify source of API calls
 * 
 * ⚠️  WARNING: Deleting this file will NOT break your application logic
 * ⚠️  This is purely a development monitoring tool
 * ===================================================================
 */

console.log('🔍 WebSocket-only monitoring utility loaded');

// Monitor fetch calls
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const url = args[0];
  
  // Check if this is an API call to our backend
  if (typeof url === 'string' && (url.startsWith('/api') || url.includes('localhost:8081/api'))) {
    console.warn(`🚨 REST API CALL DETECTED (fetch): ${url}`);
    console.warn('This should be replaced with WebSocket communication!');
    console.trace('API call stack trace:');
  }
  
  return originalFetch.apply(this, args);
};

// Monitor XMLHttpRequest calls
const originalXHRopen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url) {
  if (typeof url === 'string' && (url.startsWith('/api') || url.includes('localhost:8081/api'))) {
    console.warn(`🚨 REST API CALL DETECTED (XHR): ${method} ${url}`);
    console.warn('This should be replaced with WebSocket communication!');
    console.trace('API call stack trace:');
  }
  
  originalXHRopen.apply(this, arguments);
};

// Monitor axios calls (if axios is used)
if (window.axios) {
  const originalAxiosRequest = window.axios.request;
  window.axios.request = function (config) {
    const url = config.url;
    if (typeof url === 'string' && (url.startsWith('/api') || url.includes('localhost:8081/api'))) {
      console.warn(`🚨 REST API CALL DETECTED (axios): ${config.method?.toUpperCase()} ${url}`);
      console.warn('This should be replaced with WebSocket communication!');
      console.trace('API call stack trace:');
    }
    
    return originalAxiosRequest.apply(this, arguments);
  };
}

// Monitor for any direct API service imports
const checkForAPIImports = () => {
  // This is a simple check - in a real implementation, you might want to use
  // a more sophisticated approach like webpack bundle analysis
  console.log('✅ WebSocket-only monitoring active');
  console.log('📡 All data operations should now use WebSocket events');
  console.log('🚫 REST API calls will be detected and logged');
};

// Initialize monitoring
checkForAPIImports();

// Export for potential use in other parts of the application
export const websocketMonitoring = {
  isActive: true,
  checkForAPIImports,
  logWebSocketUsage: (operation) => {
    console.log(`✅ WebSocket operation: ${operation}`);
  },
  logAPIViolation: (url, method = 'GET') => {
    console.error(`🚨 API violation detected: ${method} ${url}`);
  }
};

export default websocketMonitoring;
