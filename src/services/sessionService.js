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
 
        this.isSessionValid = false;
        return;
      }

      this.isSessionValid = true;
      
      // Get initial session info
      await this.getSessionInfo();
      
      // Start periodic session validation (every 60 minutes - less frequent)
      this.sessionCheckInterval = setInterval(async () => {
        // Only validate if page is visible to avoid unnecessary requests
        if (!document.hidden) {
          await this.validateSession();
        }
      }, 60 * 60 * 1000);
      

      
    } catch (error) {

      this.isSessionValid = false;
    }
  }

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring() {
   
    
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    
    if (this.sessionRefreshInterval) {
      clearInterval(this.sessionRefreshInterval);
      this.sessionRefreshInterval = null;
    }
    
    this.isSessionValid = false;

  }

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const isAuthenticated = await Session.doesSessionExist();
      
      if (!isAuthenticated) {

        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { reason: 'no_session' });
        return false;
      }

      try {
        const response = await api.get('/users/session/status');
        if (response.data.success && response.data.data.isValid) {
          this.sessionInfo = response.data.data;
          this.isSessionValid = true;

          this.notifyListeners('sessionValid', { sessionInfo: this.sessionInfo });
          return true;
        } else {
 
          this.isSessionValid = false;
   
          return false;
        }
      } catch (apiError) {

        if (apiError.response && (apiError.response.status === 401 || apiError.response.data?.sessionRevoked)) {
        
          this.isSessionValid = false;
          this.notifyListeners('sessionInvalid', { 
            reason: 'session_revoked',
            message: apiError.response.data?.message || 'Session has been revoked',
            sessionRevoked: true
          });
          return false;
        }
   
  
        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { 
          reason: 'backend_error',
          message: apiError.message
        });
        return false;
      }
      
    } catch (error) {

      this.isSessionValid = true;
      return true;
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession() {
    try {

      
      const isAuthenticated = await Session.doesSessionExist();
      if (!isAuthenticated) {
    
        this.isSessionValid = false;
        this.notifyListeners('sessionInvalid', { reason: 'no_session' });
        return false;
      }

      try {
        const response = await api.post('/users/session/refresh');
        if (response.data.success) {

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

        const sessionExists = await Session.doesSessionExist();
        if (sessionExists) {
        
          this.isSessionValid = true;
          this.notifyListeners('sessionRefreshed', { 
            sessionInfo: 'valid',
            timestamp: new Date().toISOString()
          });
          return true;
        } else {

          this.isSessionValid = false;
          this.notifyListeners('sessionInvalid', { reason: 'session_expired' });
          return false;
        }
      }
      
    } catch (error) {

      this.isSessionValid = false;
      this.notifyListeners('sessionRefreshFailed', { 
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  async getSessionInfo() {
    try {
     
      
      const isAuthenticated = await Session.doesSessionExist();
 
      
      if (!isAuthenticated) {

        this.sessionInfo = null;
        return null;
      }

      try {
        
        const response = await api.get('/users/session/info');
        
 
        
        if (response.data.success) {
          this.sessionInfo = response.data.data;

          if (this.sessionInfo.user || this.sessionInfo.mongoUser) {
            const userData = this.sessionInfo.mongoUser || this.sessionInfo.user;
            localStorage.setItem('cachedUserData', JSON.stringify(userData));
     
          }
          

          const sessionCount = response.data.data?.debug?.sessionCount || 0;
          

          if (sessionCount === 0) {
            
            this.sessionInfo = null;
            return null;
          }
          
          return this.sessionInfo;
        }
      } catch (apiError) {
  
        // If it's a 401/403, the session is likely expired
        if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {

          return null;
        }
        
   
        const cachedUserData = localStorage.getItem('cachedUserData');
        if (cachedUserData) {
          try {
            const userData = JSON.parse(cachedUserData);
   
            
            this.sessionInfo = {
              session: {
                sessionHandle: 'cached-session',
                userId: userData.supertokensUserId || userData.id || 'cached-user',
                accessTokenPayload: {}
              },
              user: {
                userId: userData.supertokensUserId ,
                email: userData.email ,
                name: userData.name ,
                firstName: userData.firstName ,
                lastName: userData.lastName ,
                phone: userData.phone ,
                role: userData.role ,
                roles: userData.roles ,
                isEmailVerified: userData.isEmailVerified ,
                status: userData.status ,
                isActive: userData.isActive ,
                lastLoginAt: userData.lastLoginAt,
                preferences: userData.preferences 
              }
            };
            return this.sessionInfo;
          } catch (parseError) {
     throw parseError;
          }
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
      return null;
    }
  }

  /**
   * Logout user and cleanup
   */
  async logout() {
    try {
  
      
      // Stop session monitoring
      this.stopSessionMonitoring();
      
      // Revoke session
      await Session.signOut();
      
      // Clear local data
      this.sessionInfo = null;
      this.isSessionValid = false;
      
      // Clear any cached data including user data
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('app_state');
      localStorage.removeItem('cachedUserData');
      sessionStorage.clear();
      
 
      this.notifyListeners('logout', { timestamp: new Date().toISOString() });
      
    } catch (error) {

      this.sessionInfo = null;
      this.isSessionValid = false;
      localStorage.removeItem('cachedUserData');
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

    this.isSessionValid = false;
    this.sessionInfo = null;
    this.stopSessionMonitoring();
    this.notifyListeners('sessionExpired', event.detail);
  }

  /**
   * Handle session refreshed event
   */
  handleSessionRefreshed(event) {

    this.isSessionValid = true;
    this.notifyListeners('sessionRefreshed', event.detail);
  }

  /**
   * Handle session refresh failed event
   */
  handleSessionRefreshFailed(event) {
 
    this.isSessionValid = false;
    this.notifyListeners('sessionRefreshFailed', event.detail);
  }

  /**
   * Handle session revoked event
   */
  handleSessionRevoked(event) {

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
      
        return;
      }

    
      const now = Date.now();
      if (!this.lastValidationTime || (now - this.lastValidationTime) > 10 * 60 * 1000) {
        // Add delay to prevent logout during page refresh
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            this.validateSession();
            this.lastValidationTime = Date.now();
          }
        }, 5000);
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
      
      return;
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
