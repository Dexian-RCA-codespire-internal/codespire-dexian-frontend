import Session from 'supertokens-auth-react/recipe/session';

class CookieMonitorService {
  constructor() {
    this.monitoringInterval = null;
    this.isMonitoring = false;
    this.eventListeners = new Map();
    this.checkInterval = 10000; // Check every 10 seconds (more aggressive for session removal detection)
    this.debugMode = true; // Set to true for debugging (enable by default)
    
    // Set up SuperTokens event listeners
    this.setupSuperTokensEventListeners();
  }

  // Set up SuperTokens event listeners
  setupSuperTokensEventListeners() {
    // Listen for SuperTokens session events
    window.addEventListener('sessionExpired', () => {
      console.log('🔒 SuperTokens session expired event received');
      this.cleanupFrontendCookies();
      this.dispatchEvent('sessionCookiesMissing', { 
        reason: 'supertokens_session_expired',
        timestamp: new Date().toISOString()
      });
    });

    window.addEventListener('sessionRevoked', () => {
      console.log('🚫 SuperTokens session revoked event received');
      this.cleanupFrontendCookies();
      this.dispatchEvent('sessionCookiesMissing', { 
        reason: 'supertokens_session_revoked',
        timestamp: new Date().toISOString()
      });
    });

    // Check session on page load/refresh
    window.addEventListener('load', () => {
      console.log('🔄 Page loaded - checking SuperTokens session');
      this.checkSessionOnPageLoad();
    });

    // Listen for visibility change to check session when tab becomes active (more aggressive)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible - force checking session');
        // Immediate check for session removal
        this.forceSessionCheck();
      }
    });

    // Listen for focus events to check session (more aggressive)
    window.addEventListener('focus', () => {
      console.log('🎯 Window focused - force checking session');
      // Immediate check for session removal
      this.forceSessionCheck();
    });

    // Listen for beforeunload to check session
    window.addEventListener('beforeunload', () => {
      console.log('🚪 Page unloading - checking session');
      this.forceSessionCheck();
    });
  }

  // Start monitoring session cookies
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Cookie monitoring already active');
      return;
    }

    console.log('🔍 Starting session cookie monitoring...');
    this.isMonitoring = true;

    // Initial check
    this.checkSessionCookies();

    // Set up interval monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkSessionCookies();
    }, this.checkInterval);

    console.log('✅ Session cookie monitoring started');
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Session cookie monitoring stopped');
  }

  // Check session specifically on page load/refresh
  async checkSessionOnPageLoad() {
    try {
      // Check if current page is a public auth page that doesn't need session validation
      const isPublicAuthPage = () => {
        const path = window.location.pathname;
        return path.includes('/login') || 
               path.includes('/register') || 
               path.includes('/forgot-password') || 
               path.includes('/reset-password') || 
               path.includes('/verify-') ||
               path.includes('/auth/');
      };

      // Skip session validation for public auth pages
      if (isPublicAuthPage()) {
        if (this.debugMode) {
          console.log('🔓 Public auth page detected, skipping session check on page load');
        }
        return true; // Return true to indicate no action needed
      }

      if (this.debugMode) {
        console.log('🔍 [DEBUG] Checking session on page load...');
      }
      
      const sessionExists = await Session.doesSessionExist();
      
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Session exists on page load:', sessionExists);
      }
      
      if (!sessionExists) {
        console.log('🚫 No SuperTokens session found on page load - clearing cookies');
        await this.cleanupFrontendCookies();
        this.dispatchEvent('sessionCookiesMissing', { 
          reason: 'no_session_on_page_load',
          timestamp: new Date().toISOString()
        });
        return false;
      } else {
        console.log('✅ SuperTokens session found on page load - keeping cookies');
        this.dispatchEvent('sessionCookiesValid', { 
          sessionHandle: 'valid-session',
          userId: 'valid-user',
          timestamp: new Date().toISOString()
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Error checking session on page load:', error);
      // On error, don't clear cookies - might be temporary issue
      return true;
    }
  }

  // Force immediate session check (for when sessions are removed from dashboard)
  async forceSessionCheck() {
    try {
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Force checking session...');
      }
      
      const sessionExists = await Session.doesSessionExist();
      
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Force check - Session exists:', sessionExists);
      }
      
      if (!sessionExists) {
        console.log('🚫 FORCE CHECK: No SuperTokens session found - clearing cookies and logging out');
        await this.cleanupFrontendCookies();
        this.dispatchEvent('sessionCookiesMissing', { 
          reason: 'force_check_no_session',
          timestamp: new Date().toISOString()
        });
        return false;
      } else {
        console.log('✅ FORCE CHECK: SuperTokens session found - keeping cookies');
        this.dispatchEvent('sessionCookiesValid', { 
          sessionHandle: 'valid-session',
          userId: 'valid-user',
          timestamp: new Date().toISOString()
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Error in force session check:', error);
      return false;
    }
  }

  // Check if SuperTokens session cookies are present and valid
  async checkSessionCookies() {
    try {
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Checking session cookies...');
      }
      
      const sessionExists = await Session.doesSessionExist();
      
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Session exists:', sessionExists);
      }
      
      if (!sessionExists) {
        console.log('🚫 SuperTokens session not found, cleaning up cookies...');
        await this.cleanupFrontendCookies();
        this.dispatchEvent('sessionCookiesMissing', { 
          reason: 'supertokens_session_not_found',
          timestamp: new Date().toISOString()
        });
        return false;
      }

      // Session exists according to SuperTokens - but let's double-check with backend
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Session exists according to SuperTokens - double-checking with backend...');
        
        try {
          // Make a quick backend call to verify session
          const response = await fetch('/api/v1/users/session/active', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('🔍 [DEBUG] Backend session check:', {
              success: data.success,
              mongoCount: data.data?.sessionCount?.mongo || 0,
              superTokensCount: data.data?.sessionCount?.superTokens || 0
            });
            
            // If MongoDB shows no active sessions, session might be revoked
            if (data.data?.sessionCount?.mongo === 0) {
              console.log('⚠️ [DEBUG] Backend shows no MongoDB active sessions - session might be revoked');
              await this.cleanupFrontendCookies();
              this.dispatchEvent('sessionCookiesMissing', { 
                reason: 'no_mongo_sessions',
                timestamp: new Date().toISOString()
              });
              return false;
            }
          } else {
            console.log('⚠️ [DEBUG] Backend session check failed:', response.status);
          }
        } catch (backendError) {
          console.log('⚠️ [DEBUG] Backend session check error:', backendError.message);
        }
      }
      
      // Session exists according to SuperTokens - keep cookies
      if (this.debugMode) {
        console.log('🔍 [DEBUG] Session exists according to SuperTokens - keeping cookies');
      }
      
      this.dispatchEvent('sessionCookiesValid', { 
        sessionHandle: 'valid-session',
        userId: 'valid-user',
        timestamp: new Date().toISOString()
      });
      return true;


    } catch (error) {
      console.error('❌ Error checking session cookies:', error);
      this.dispatchEvent('cookieCheckError', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  // Clean up all frontend cookies when session is invalid
  async cleanupFrontendCookies() {
    try {
      console.log('🧹 Cleaning up frontend cookies...');
      
      // List of cookies to clean up (comprehensive list)
      const cookiesToClean = [
        // SuperTokens cookies
        'sAccessToken',
        'sRefreshToken',
        'sIdRefreshToken',
        'sAntiCsrf',
        'sFrontToken',
        'sIRTFrontend',
        'sIRTCSRFToken',
        'sIRTCSRFToken',
        // Common session cookies
        'session',
        'sessionid',
        'sessionId',
        'token',
        'auth_token',
        'access_token',
        'refresh_token',
        'user_session',
        'userSession',
        'remember_me',
        'rememberMe',
        'login_state',
        'loginState',
        'auth',
        'authentication',
        // Application specific cookies
        'app_session',
        'appSession',
        'user_preferences',
        'userPreferences',
        'app_state',
        'appState'
      ];

      // Clean up each cookie with multiple domain/path combinations
      cookiesToClean.forEach(cookieName => {
        // Delete with different paths and domains
        this.deleteCookie(cookieName);
        this.deleteCookie(cookieName, '/');
        this.deleteCookie(cookieName, '/', 'localhost');
        this.deleteCookie(cookieName, '/', window.location.hostname);
        this.deleteCookie(cookieName, '/', '.' + window.location.hostname);
        this.deleteCookie(cookieName, '/', '127.0.0.1');
        this.deleteCookie(cookieName, '/', '.127.0.0.1');
      });

      // Clean up localStorage
      const localStorageKeysToClean = [
        'supertokens-session',
        'auth_token',
        'user_data',
        'session_data',
        'remember_me'
      ];

      localStorageKeysToClean.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Could not remove localStorage key: ${key}`);
        }
      });

      // Clean up sessionStorage
      const sessionStorageKeysToClean = [
        'supertokens-session',
        'auth_token',
        'user_data',
        'session_data'
      ];

      sessionStorageKeysToClean.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn(`Could not remove sessionStorage key: ${key}`);
        }
      });

      console.log('✅ Frontend cookies cleaned up successfully');
      this.dispatchEvent('cookiesCleaned', { 
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error cleaning up cookies:', error);
      this.dispatchEvent('cookieCleanupError', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Delete a specific cookie
  deleteCookie(name, path = '/', domain = '') {
    try {
      let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
      if (domain) {
        cookieString += `; domain=${domain}`;
      }
      document.cookie = cookieString;
    } catch (error) {
      console.warn(`Could not delete cookie: ${name}`, error);
    }
  }

  // Get current session status
  async getSessionStatus() {
    try {
      const sessionExists = await Session.doesSessionExist();
      if (!sessionExists) {
        return { valid: false, reason: 'no_session' };
      }

      return {
        valid: true,
        sessionHandle: 'valid-session',
        userId: 'valid-user',
        accessTokenPayload: {}
      };
    } catch (error) {
      return { valid: false, reason: 'error', error: error.message };
    }
  }

  // Event handling
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  dispatchEvent(event, data) {
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

  // Get monitoring status
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.checkInterval,
      hasInterval: !!this.monitoringInterval
    };
  }

  // Manual cookie cleanup function (can be called externally)
  async forceCleanupCookies() {
    console.log('🧹 Force cleaning up all cookies...');
    await this.cleanupFrontendCookies();
    this.dispatchEvent('cookiesForceCleaned', { 
      timestamp: new Date().toISOString()
    });
  }

  // Check if SuperTokens session exists and is valid
  async isSessionValid() {
    try {
      const sessionExists = await Session.doesSessionExist();
      return sessionExists;
    } catch (error) {
      console.warn('⚠️ Error checking session validity:', error.message);
      return false;
    }
  }

  // Enable/disable debug mode
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`🔍 [DEBUG] Cookie monitoring debug mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  // Get debug mode status
  getDebugMode() {
    return this.debugMode;
  }

  // Manual session check for testing (can be called from console)
  async manualSessionCheck() {
    console.log('🔍 MANUAL SESSION CHECK - Testing session removal detection...');
    const result = await this.forceSessionCheck();
    console.log('🔍 MANUAL CHECK RESULT:', result ? 'Session exists' : 'Session removed');
    return result;
  }
}

// Create singleton instance
const cookieMonitorService = new CookieMonitorService();

export default cookieMonitorService;
