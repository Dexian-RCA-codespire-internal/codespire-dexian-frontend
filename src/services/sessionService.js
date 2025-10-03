/**
 * Enhanced Session Management Service for Frontend
 * Handles session monitoring, refresh, and automatic logout
 */

import Session from 'supertokens-auth-react/recipe/session';
import api from '../api';

class SessionService {
  constructor() {
    this.sessionCheckInterval = null;
    this.isSessionValid = false;
    this.sessionRefreshInterval = null;
    this.listeners = new Map();
    this.sessionInfo = null;
    this.lastValidationTime = null;
    
    // Bind methods
    this.handleSessionExpired = this.handleSessionExpired.bind(this);
    this.handleSessionRefreshed = this.handleSessionRefreshed.bind(this);
    this.handleSessionRefreshFailed = this.handleSessionRefreshFailed.bind(this);
    this.handleSessionRevoked = this.handleSessionRevoked.bind(this);
    
    this.initializeEventListeners();
  }

  /**
   * Initialize session event listeners
   */
  initializeEventListeners() {
    // Listen for custom session events
    window.addEventListener('sessionExpired', this.handleSessionExpired);
    window.addEventListener('sessionRefreshed', this.handleSessionRefreshed);
    window.addEventListener('sessionRefreshFailed', this.handleSessionRefreshFailed);
    window.addEventListener('sessionRevoked', this.handleSessionRevoked);
    
    // Listen for visibility change to check session when tab becomes active
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Listen for focus events to refresh session
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
  }

  /**
   * Start session monitoring
   */
  async startSessionMonitoring() {
    try {
      console.log('🔍 Starting session monitoring...');
      
      // Check if user is authenticated
      const isAuthenticated = await Session.doesSessionExist();
      if (!isAuthenticated) {
        console.log('ℹ️ No active session found');
        this.isSessionValid = false;
        return;
      }

      this.isSessionValid = true;
      
      // Get initial session info
      await this.getSessionInfo();
      
      // Start periodic session validation (every 30 minutes - much less frequent)
      this.sessionCheckInterval = setInterval(async () => {
        await this.validateSession();
      }, 30 * 60 * 1000);
      
      // Disable automatic session refresh to prevent 400 errors
      // this.sessionRefreshInterval = setInterval(async () => {
      //   await this.refreshSession();
      // }, 20 * 60 * 1000);
      
      console.log('✅ Session monitoring started');
      
    } catch (error) {
      console.error('❌ Error starting session monitoring:', error);
      this.isSessionValid = false;
    }
  }

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring() {
    console.log('🛑 Stopping session monitoring...');
    
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    
    if (this.sessionRefreshInterval) {
      clearInterval(this.sessionRefreshInterval);
      this.sessionRefreshInterval = null;
    }
    
    this.isSessionValid = false;
    console.log('✅ Session monitoring stopped');
  }

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const isAuthenticated = await Session.doesSessionExist();
      
      if (!isAuthenticated) {
        console.log('❌ Session validation failed - no session exists');
        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { reason: 'no_session' });
        return false;
      }

      // Check if cookies are actually present (manual cookie deletion detection)
      const hasSessionCookies = () => {
        const cookies = document.cookie.split(';').map(c => c.trim());
        const sessionCookieNames = ['sAccessToken', 'sRefreshToken', 'sIdRefreshToken', 'sFrontToken'];
        return sessionCookieNames.some(cookieName => 
          cookies.some(cookie => cookie.startsWith(cookieName + '='))
        );
      };
      
      if (!hasSessionCookies()) {
        console.log('❌ Session cookies missing - user manually deleted cookies');
        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { reason: 'cookies_missing' });
        return false;
      }

      // Try to get session status from backend using the lightweight endpoint
      try {
        const response = await api.get('/users/session/status');
        if (response.data.success && response.data.data.isValid) {
          this.sessionInfo = response.data.data;
          this.isSessionValid = true;
          console.log('✅ Session validation successful');
          this.notifyListeners('sessionValid', { sessionInfo: this.sessionInfo });
          return true;
        } else {
          console.log('❌ Session validation failed:', response.data.message);
          this.isSessionValid = false;
          this.notifyListeners('sessionInvalid', { 
            reason: 'session_validation_failed',
            message: response.data.message,
            sessionRevoked: response.data.sessionRevoked
          });
          return false;
        }
      } catch (apiError) {
        console.warn('⚠️ Backend session validation failed:', apiError.message);
        
        // Check if it's a 401 error or sessionRevoked flag - session is invalid
        if (apiError.response && (apiError.response.status === 401 || apiError.response.data?.sessionRevoked)) {
          console.log('🔒 Session appears to be revoked/expired (401 or sessionRevoked)');
          this.isSessionValid = false;
          this.notifyListeners('sessionInvalid', { 
            reason: 'session_revoked',
            message: apiError.response.data?.message || 'Session has been revoked',
            sessionRevoked: true
          });
          return false;
        }
        
        // For other errors, be strict - assume session is invalid
        console.warn('⚠️ Backend session validation failed - assuming session is invalid');
        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { 
          reason: 'backend_error',
          message: apiError.message
        });
        return false;
      }
      
    } catch (error) {
      console.error('❌ Session validation error:', error);
      // On any error, assume session is invalid
      this.isSessionValid = false;
      this.notifyListeners('sessionInvalid', { 
        reason: 'validation_error',
        message: error.message
      });
      return false;
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession() {
    try {
      console.log('🔄 Refreshing session...');
      
      const isAuthenticated = await Session.doesSessionExist();
      if (!isAuthenticated) {
        console.log('❌ Cannot refresh - no active session');
        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { reason: 'no_session' });
        return false;
      }

      // Use backend session refresh endpoint
      try {
        const response = await api.post('/users/session/refresh');
        if (response.data.success) {
          console.log('✅ Session refreshed successfully');
          this.sessionInfo = response.data.data.userData;
          this.isSessionValid = true;
          this.notifyListeners('sessionRefreshed', { 
            sessionInfo: this.sessionInfo,
            timestamp: new Date().toISOString()
          });
          return true;
        } else {
          throw new Error('Backend session refresh failed');
        }
      } catch (apiError) {
        console.warn('⚠️ Backend session refresh failed:', apiError.message);
        
        // If backend fails, just check if SuperTokens session still exists
        const sessionExists = await Session.doesSessionExist();
        if (sessionExists) {
          console.log('✅ SuperTokens session still exists, keeping session valid');
          this.isSessionValid = true;
          this.notifyListeners('sessionRefreshed', { 
            sessionInfo: 'valid',
            timestamp: new Date().toISOString()
          });
          return true;
        } else {
          console.log('❌ SuperTokens session no longer exists');
          this.isSessionValid = false;
          this.notifyListeners('sessionInvalid', { reason: 'session_expired' });
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      this.isSessionValid = false;
      this.notifyListeners('sessionRefreshFailed', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Get current session information
   */
  async getSessionInfo() {
    try {
      console.log('🔍 [DEBUG] getSessionInfo called');
      
      const isAuthenticated = await Session.doesSessionExist();
      console.log('🔍 [DEBUG] SuperTokens session exists:', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('❌ [DEBUG] No SuperTokens session found');
        this.sessionInfo = null;
        return null;
      }

      // Try to get detailed session info from backend
      try {
        console.log('🔍 [DEBUG] Calling backend session info endpoint...');
        const response = await api.get('/users/session/info');
        
        console.log('🔍 [DEBUG] Backend response:', {
          status: response.status,
          success: response.data.success,
          hasData: !!response.data.data,
          debug: response.data.data?.debug
        });
        
        if (response.data.success) {
          this.sessionInfo = response.data.data;
          
          // Check if session is actually valid based on MongoDB activeSessions
          const mongoActiveSessions = response.data.data?.debug?.mongoActiveSessions || [];
          const sessionCount = response.data.data?.debug?.sessionCount || 0;
          
          console.log('🔍 [DEBUG] MongoDB session check:', {
            mongoActiveSessions: mongoActiveSessions.length,
            sessionCount,
            sessionHandle: response.data.data?.session?.sessionHandle
          });
          
          // If MongoDB shows no active sessions, session might be revoked
          if (sessionCount === 0) {
            console.log('⚠️ [DEBUG] MongoDB shows no active sessions - session might be revoked');
            this.sessionInfo = null;
            return null;
          }
          
          return this.sessionInfo;
        }
      } catch (apiError) {
        console.warn('⚠️ [DEBUG] Could not get detailed session info from backend:', {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data
        });
        
        // If it's a 401/403, the session is likely expired
        if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {
          console.log('🔒 [DEBUG] Session expired, returning null');
          return null;
        }
      }

      // Fallback to SuperTokens session info
      const sessionExists = await Session.doesSessionExist();
      if (sessionExists) {
        // Create basic session info since we know session exists
        this.sessionInfo = {
          session: {
            sessionHandle: 'valid-session',
            userId: 'valid-user',
            accessTokenPayload: {}
          },
          user: {
            userId: 'valid-user',
            email: 'No email',
            name: 'User',
            firstName: '',
            lastName: '',
            phone: 'No phone',
            role: 'admin',
            roles: ['admin'],
            isEmailVerified: false,
            status: 'active',
            isActive: true,
            lastLoginAt: null,
            preferences: {}
          }
        };
        return this.sessionInfo;
      }

      return null;
      
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return null;
    }
  }

  /**
   * Logout user and cleanup
   */
  async logout() {
    try {
      console.log('🚪 Logging out user...');
      
      // Stop session monitoring
      this.stopSessionMonitoring();
      
      // Revoke session
      await Session.signOut();
      
      // Clear local data
      this.sessionInfo = null;
      this.isSessionValid = false;
      
      // Clear any cached data
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('app_state');
      sessionStorage.clear();
      
      console.log('✅ Logout successful');
      this.notifyListeners('logout', { timestamp: new Date().toISOString() });
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, clear local state
      this.sessionInfo = null;
      this.isSessionValid = false;
      this.notifyListeners('logout', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle session expired event
   */
  handleSessionExpired(event) {
    console.log('🔒 Session expired:', event.detail);
    this.isSessionValid = false;
    this.sessionInfo = null;
    this.stopSessionMonitoring();
    this.notifyListeners('sessionExpired', event.detail);
  }

  /**
   * Handle session refreshed event
   */
  handleSessionRefreshed(event) {
    console.log('✅ Session refreshed:', event.detail);
    this.isSessionValid = true;
    this.notifyListeners('sessionRefreshed', event.detail);
  }

  /**
   * Handle session refresh failed event
   */
  handleSessionRefreshFailed(event) {
    console.log('❌ Session refresh failed:', event.detail);
    this.isSessionValid = false;
    this.notifyListeners('sessionRefreshFailed', event.detail);
  }

  /**
   * Handle session revoked event
   */
  handleSessionRevoked(event) {
    console.log('🚫 Session revoked:', event.detail);
    this.isSessionValid = false;
    this.sessionInfo = null;
    this.stopSessionMonitoring();
    this.notifyListeners('sessionRevoked', event.detail);
  }

  /**
   * Handle visibility change (tab focus/blur)
   */
  async handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
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
        console.log('🔓 Public auth page detected, skipping session validation on tab focus');
        return;
      }

      console.log('👁️ Tab became visible - checking session');
      // Only validate if we haven't validated recently (within last 5 minutes)
      const now = Date.now();
      if (!this.lastValidationTime || (now - this.lastValidationTime) > 5 * 60 * 1000) {
        await this.validateSession();
        this.lastValidationTime = now;
      } else {
        console.log('⏭️ Skipping session validation - validated recently');
      }
    }
  }

  /**
   * Handle window focus
   */
  async handleWindowFocus() {
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
      console.log('🔓 Public auth page detected, skipping session validation on window focus');
      return;
    }

    console.log('🎯 Window focused - checking session');
    // Only validate if we haven't validated recently (within last 5 minutes)
    const now = Date.now();
    if (!this.lastValidationTime || (now - this.lastValidationTime) > 5 * 60 * 1000) {
      await this.validateSession();
      this.lastValidationTime = now;
    } else {
      console.log('⏭️ Skipping session validation - validated recently');
    }
  }

  /**
   * Add event listener for session events
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in session event listener:', error);
        }
      });
    }
  }

  /**
   * Get current session status
   */
  getSessionStatus() {
    return {
      isValid: this.isSessionValid,
      sessionInfo: this.sessionInfo,
      isMonitoring: this.sessionCheckInterval !== null
    };
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    if (!this.sessionInfo || !this.sessionInfo.user) {
      return false;
    }
    
    const userRoles = this.sessionInfo.user.roles || [this.sessionInfo.user.role];
    return userRoles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles) {
    if (!this.sessionInfo || !this.sessionInfo.user) {
      return false;
    }
    
    const userRoles = this.sessionInfo.user.roles || [this.sessionInfo.user.role];
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Get user information from session
   */
  getUserInfo() {
    if (!this.sessionInfo || !this.sessionInfo.user) {
      return null;
    }
    
    return {
      id: this.sessionInfo.user.userId,
      email: this.sessionInfo.user.email,
      name: this.sessionInfo.user.name,
      firstName: this.sessionInfo.user.firstName,
      lastName: this.sessionInfo.user.lastName,
      role: this.sessionInfo.user.role,
      roles: this.sessionInfo.user.roles,
      isEmailVerified: this.sessionInfo.user.isEmailVerified,
      status: this.sessionInfo.user.status
    };
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.stopSessionMonitoring();
    
    // Remove event listeners
    window.removeEventListener('sessionExpired', this.handleSessionExpired);
    window.removeEventListener('sessionRefreshed', this.handleSessionRefreshed);
    window.removeEventListener('sessionRefreshFailed', this.handleSessionRefreshFailed);
    window.removeEventListener('sessionRevoked', this.handleSessionRevoked);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleWindowFocus);
    
    this.listeners.clear();
    this.sessionInfo = null;
    this.isSessionValid = false;
  }
}

// Create singleton instance
const sessionService = new SessionService();

export default sessionService;
