import React, { createContext, useContext, useState, useEffect } from 'react';
import Session from 'supertokens-auth-react/recipe/session';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import { authService } from '../api/services/authService';
import sessionService from '../services/sessionService';
import cookieMonitorService from '../services/cookieMonitorService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Check authentication status on app start and set up session monitoring
  useEffect(() => {
    // Check if current page is a public auth page that doesn't need session monitoring
    const isPublicAuthPage = () => {
      const path = window.location.pathname;
      return path.includes('/login') || 
             path.includes('/register') || 
             path.includes('/forgot-password') || 
             path.includes('/reset-password') || 
             path.includes('/verify-') ||
             path.includes('/auth/');
    };

    // Only initialize auth and set up monitoring for non-public pages
    if (!isPublicAuthPage()) {
      initializeAuth();
      
      // Set up session service event listeners
      const handleSessionExpired = async (data) => {
      
        await clearAuthStateWithCleanup();
      };

      const handleSessionRefreshed = (data) => {
   
        if (data.sessionInfo && data.sessionInfo.user) {
          // Normalize user data with fallbacks
          const userData = {
            id: data.sessionInfo.user.userId || data.sessionInfo.session?.userId,
            email: data.sessionInfo.user.email || 'No email',
            name: data.sessionInfo.user.name || 'User',
            firstName: data.sessionInfo.user.firstName || '',
            lastName: data.sessionInfo.user.lastName || '',
            phone: data.sessionInfo.user.phone || 'No phone',
            role: data.sessionInfo.user.role || 'admin',
            roles: data.sessionInfo.user.roles || ['admin'],
            isEmailVerified: data.sessionInfo.user.isEmailVerified || false,
            status: data.sessionInfo.user.status || 'active',
            isActive: data.sessionInfo.user.isActive !== false,
            lastLoginAt: data.sessionInfo.user.lastLoginAt,
            preferences: data.sessionInfo.user.preferences || {}
          };
          
          setSessionInfo(data.sessionInfo);
          setUser(userData);
        }
      };

      const handleSessionInvalid = async (data) => {

        // Only logout if session was explicitly revoked or unauthorized
        if (data.reason === 'unauthorized' || data.sessionRevoked) {
  
          
          await clearAuthStateWithCleanup();
   
          
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        } 

      };

      const handleLogout = async (data) => {

        await clearAuthStateWithCleanup();
      };


      const handleSessionCookiesMissing = (data) => {
        console.log('🍪 Session cookies missing in AuthContext:', data);
        // Don't immediately logout - this can happen during page refresh
       
      };

      const handleSessionCookiesValid = (data) => {

        // Cookies are valid, ensure we're authenticated
        if (!isAuthenticated) {
          initializeAuth();
        }
      };

      const handleCookiesCleaned = async (data) => {

        await clearAuthStateWithCleanup();
      };

      // Add event listeners
      sessionService.addEventListener('sessionExpired', handleSessionExpired);
      sessionService.addEventListener('sessionRefreshed', handleSessionRefreshed);
      sessionService.addEventListener('sessionInvalid', handleSessionInvalid);
      sessionService.addEventListener('logout', handleLogout);

      // Add cookie monitoring event listeners
      cookieMonitorService.addEventListener('sessionCookiesMissing', handleSessionCookiesMissing);
      cookieMonitorService.addEventListener('sessionCookiesValid', handleSessionCookiesValid);
      cookieMonitorService.addEventListener('cookiesCleaned', handleCookiesCleaned);

      return () => {
        // Remove event listeners
        sessionService.removeEventListener('sessionExpired', handleSessionExpired);
        sessionService.removeEventListener('sessionRefreshed', handleSessionRefreshed);
        sessionService.removeEventListener('sessionInvalid', handleSessionInvalid);
        sessionService.removeEventListener('logout', handleLogout);

        // Remove cookie monitoring event listeners
        cookieMonitorService.removeEventListener('sessionCookiesMissing', handleSessionCookiesMissing);
        cookieMonitorService.removeEventListener('sessionCookiesValid', handleSessionCookiesValid);
        cookieMonitorService.removeEventListener('cookiesCleaned', handleCookiesCleaned);
      };
    } else {
    
      setIsLoading(false);
    }
  }, []);

  const clearAuthState = () => {

    
    setIsAuthenticated(false);
    setUser(null);
    setSessionInfo(null);
    setIsLoading(false);
    
    // Stop session monitoring
    sessionService.stopSessionMonitoring();
    // Stop cookie monitoring
    cookieMonitorService.stopMonitoring();
    

  };

  const clearAuthStateWithCleanup = async () => {

    setIsAuthenticated(false);
    setUser(null);
    setSessionInfo(null);
    setIsLoading(false);
    
    // Stop session monitoring
    sessionService.stopSessionMonitoring();
    // Stop cookie monitoring
    cookieMonitorService.stopMonitoring();
    
    // Clean up SuperTokens session and cookies
    try {

      await Session.signOut();

    } catch (error) {
      console.warn('⚠️ Error cleaning up SuperTokens session:', error.message);
    }
    
    // Clear all local storage and session storage
    try {
      // Clear validation cache specifically
      localStorage.removeItem('lastSessionValidation');
      localStorage.removeItem('cachedUserData');
      localStorage.clear();
      sessionStorage.clear();

    } catch (error) {
      console.warn('⚠️ Error clearing local storage:', error.message);
    }
    
    // Clear any remaining cookies manually (fallback)
    try {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes('supertokens') || name.includes('session')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      }

    } catch (error) {
      console.warn('⚠️ Error in manual cookie cleanup:', error.message);
    }
    

  };

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
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

        setIsLoading(false);
        return;
      }
      
      // Check if user is authenticated locally first (no backend call yet)
      const isAuthenticated = await Session.doesSessionExist();
      
      if (isAuthenticated) {
   
        
        // Set authenticated state immediately based on local session
        setIsAuthenticated(true);
        
        // Start session monitoring immediately (don't wait for backend validation)
        await sessionService.startSessionMonitoring();
        cookieMonitorService.startMonitoring();
        
        // Get session info with better error handling (but don't logout on failure)
        try {
          const sessionInfo = await sessionService.getSessionInfo();
          
          if (sessionInfo && sessionInfo.user) {
            // Ensure user data has all required fields with fallbacks
            const userData = {
              id: sessionInfo.user.userId || sessionInfo.session?.userId,
              email: sessionInfo.user.email || 'No email',
              name: sessionInfo.user.name || 'User',
              firstName: sessionInfo.user.firstName || '',
              lastName: sessionInfo.user.lastName || '',
              phone: sessionInfo.user.phone || 'No phone',
              role: sessionInfo.user.role || 'admin',
              roles: sessionInfo.user.roles || ['admin'],
              isEmailVerified: sessionInfo.user.isEmailVerified || false,
              status: sessionInfo.user.status || 'active',
              isActive: sessionInfo.user.isActive !== false,
              lastLoginAt: sessionInfo.user.lastLoginAt,
              preferences: sessionInfo.user.preferences || {}
            };
            
            setUser(userData);
            setSessionInfo(sessionInfo);

          } else {
            console.log('⚠️ No session info available - trying to get user data from SuperTokens directly');
            
            // Try to get user data from SuperTokens session payload
            try {
              const supertokensPayload = await Session.getAccessTokenPayloadSecurely();

              
              if (supertokensPayload) {
                // Extract what we can from the payload
                const userData = {
                  id: supertokensPayload.userId || supertokensPayload.sub || 'authenticated-user',
                  email: supertokensPayload.email || 'Authenticated User',
                  name: supertokensPayload.name || supertokensPayload.email || 'Authenticated User',
                  firstName: supertokensPayload.firstName || '',
                  lastName: supertokensPayload.lastName || '',
                  phone: supertokensPayload.phone || 'No phone',
                  role: supertokensPayload.role || 'admin',
                  roles: supertokensPayload.roles || ['admin'],
                  isEmailVerified: supertokensPayload.isEmailVerified || false,
                  status: 'active',
                  isActive: true,
                  lastLoginAt: null,
                  preferences: {}
                };
                
                setUser(userData);
              
              } else {
               
                
                // Create minimal user data to indicate authentication
                const userData = {
                  id: 'authenticated-user',
                  email: 'Authenticated User',
                  name: 'Authenticated User',
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
                };
                
                setUser(userData);
           
              }
            } catch (payloadError) {
              console.warn('⚠️ Error getting SuperTokens payload:', payloadError.message);
              
              // Still set minimal user data since we know session exists
              const userData = {
                id: 'authenticated-user',
                email: 'Authenticated User',
                name: 'Authenticated User',
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
              };
              
              setUser(userData);

            }
          }
        } catch (sessionError) {
       
          
          // Try to get basic user data from SuperTokens even if backend fails
          try {
            const supertokensPayload = await Session.getAccessTokenPayloadSecurely();

            
            if (supertokensPayload) {
              const userData = {
                id: supertokensPayload.userId || supertokensPayload.sub || 'authenticated-user',
                email: supertokensPayload.email || 'Authenticated User',
                name: supertokensPayload.name || supertokensPayload.email || 'Authenticated User',
                firstName: supertokensPayload.firstName || '',
                lastName: supertokensPayload.lastName || '',
                phone: supertokensPayload.phone || 'No phone',
                role: supertokensPayload.role || 'admin',
                roles: supertokensPayload.roles || ['admin'],
                isEmailVerified: supertokensPayload.isEmailVerified || false,
                status: 'active',
                isActive: true,
                lastLoginAt: null,
                preferences: {}
              };
              
              setUser(userData);
          
            } else {
              // Final fallback - minimal authenticated user data
              const userData = {
                id: 'authenticated-user',
                email: 'Authenticated User',
                name: 'Authenticated User',
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
              };
              
              setUser(userData);
           
            }
          } catch (fallbackError) {
            console.warn('⚠️ Error in SuperTokens fallback:', fallbackError.message);
            
            // Absolute final fallback
            const userData = {
              id: 'authenticated-user',
              email: 'Authenticated User',
              name: 'Authenticated User',
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
            };
            
            setUser(userData);
        
          }
        }
      } else {
     
        clearAuthState();
      }
    } catch (error) {
    
      console.log('⚠️ Auth initialization failed but not clearing state - might be temporary');
    } finally {
      setIsLoading(false);
    }
  };

  const validateSession = async () => {
    try {
 
      
      // Check if session exists locally first
      const sessionExists = await Session.doesSessionExist();
      if (!sessionExists) {
        
        if (isAuthenticated) {
          await clearAuthStateWithCleanup();
        }
        return false;
      }
      
      // Only validate with backend if we haven't validated recently (within last 10 minutes)
      const now = Date.now();
      const lastValidation = localStorage.getItem('lastSessionValidation');
      if (lastValidation && (now - parseInt(lastValidation)) < 10 * 60 * 1000) {
     
        return true;
      }
      
      // Call backend session status endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await authService.checkSessionStatus();
        clearTimeout(timeoutId);
        

        
        if (response.success && response.data.isValid) {
       
          localStorage.setItem('lastSessionValidation', now.toString());
          return true;
        } else {
          
          // Only logout on explicit session revocation
          if (response.sessionRevoked) {

            return false;
          }

          try {
            await Session.attemptRefreshingSession();
     
            localStorage.setItem('lastSessionValidation', now.toString());
            return true;
          } catch (refreshError) {
            console.error('❌ Session refresh failed:', refreshError);
            return false;
          }
        }
      } catch (apiError) {
        clearTimeout(timeoutId);
        console.warn('⚠️ Backend session validation failed:', apiError.message);
        
        // Check if it's a 401 error (unauthorized) - this usually means session is invalid
        if (apiError.response?.status === 401) {

          try {
            await Session.attemptRefreshingSession();
      
            localStorage.setItem('lastSessionValidation', now.toString());
            return true;
          } catch (refreshError) {
            console.error('❌ Session refresh failed after 401:', refreshError);
            return false;
          }
        }
        
        // For network errors or other issues, be more lenient - assume session is still valid
        if (apiError.code === 'NETWORK_ERROR' || apiError.message.includes('timeout')) {
       
          return true;
        }

        try {
          await Session.attemptRefreshingSession();

          localStorage.setItem('lastSessionValidation', now.toString());
          return true;
        } catch (refreshError) {
          console.error('❌ Session refresh failed after error:', refreshError);
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Session validation error:', error);
      // Try to refresh session before giving up
      try {
        await Session.attemptRefreshingSession();
      
        return true;
      } catch (refreshError) {
        console.error('❌ Session refresh failed after validation error:', refreshError);
        return false;
      }
    }
  };

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      
      // Check if session exists using SuperTokens
      const sessionExists = await Session.doesSessionExist();
      
      if (!sessionExists) {
   
        clearAuthState();
        return;
      }

      // Get session data from backend
      const response = await authService.getSession();
      
      if (response.success && response.session) {
 
        
        const { session: sessionData, user: userData } = response;
        
        setIsAuthenticated(true);
        setSessionInfo(sessionData);
        setUser({
          id: sessionData.userId,
          email: userData.email,
          name: userData.name,
          firstName: userData.first_name,
          lastName: userData.last_name,
          roles: userData.roles || [],
          isEmailVerified: userData.isEmailVerified,
          preferences: userData.preferences,
          isActive: userData.isActive,
          lastLoginAt: userData.lastLoginAt,
          ...sessionData.accessTokenPayload
        });
        
  
      } else {
        console.log('❌ Failed to get session data');
        clearAuthState();
      }
    } catch (error) {
      console.error('❌ Auth status check error:', error);
      
      // Try to check if session exists and clear if corrupted
      try {
        const sessionStillExists = await Session.doesSessionExist();
        if (sessionStillExists) {
        
          await Session.signOut();
   
        }
      } catch (signOutError) {
        console.error('❌ Failed to clear corrupted session:', signOutError);
      }
      
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
    
      
      const response = await authService.login(credentials);
      
      if (response.success) {

        
        // Refresh auth state after successful login
        await checkAuthStatus();
        
        return response;
      } else {

        clearAuthState();
        return response;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      clearAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
  
      
      // Use session service for logout
      await sessionService.logout();
      
      // Always clear local state regardless of API response
      await clearAuthStateWithCleanup();
      

      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local state on error
      await clearAuthStateWithCleanup();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forceLogout = async () => {
  
    try {
      // First, try to revoke session on backend
      try {
        const response = await fetch('http://localhost:8081/api/v1/users/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {

        } else {
          console.warn('⚠️ Backend logout failed, continuing with frontend cleanup');
        }
      } catch (backendError) {
   
      }
      
      // Clear auth state
      await clearAuthStateWithCleanup();
      
      // NUCLEAR APPROACH: Clear ALL storage
      try {
        // Clear ALL cookies
        const allCookies = document.cookie.split(';');
        allCookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          
          // Clear with multiple domain/path combinations
          const domains = ['', 'localhost', '.localhost', '127.0.0.1', '.127.0.0.1', window.location.hostname, '.' + window.location.hostname];
          const paths = ['/', '/auth', '/api'];
          
          domains.forEach(domain => {
            paths.forEach(path => {
              let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
              if (domain) {
                cookieString += `;domain=${domain}`;
              }
              document.cookie = cookieString;
            });
          });
        });
        
        // Clear ALL localStorage
        const allLocalStorageKeys = Object.keys(localStorage);
        allLocalStorageKeys.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Clear ALL sessionStorage
        const allSessionStorageKeys = Object.keys(sessionStorage);
        allSessionStorageKeys.forEach(key => {
          sessionStorage.removeItem(key);
        });
        
  
      } catch (error) {
        console.warn('⚠️ Error during nuclear storage cleanup:', error.message);
      }
      
      // Redirect to login page
      window.location.href = '/login?logout=true';
      
    } catch (error) {
      console.error('❌ Error during force logout:', error);
      // Even if there's an error, redirect to login
      window.location.href = '/login?logout=true';
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);

      
      const response = await authService.register(userData);
      
      if (response.success) {
     
        
        // Don't automatically authenticate after registration
        // User needs to verify email first
        clearAuthState();
      }
      
      return response;
    } catch (error) {
      console.error('❌ Registration error:', error);
      clearAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const sendOTP = async (email) => {
    try {
  
      return await authService.sendOTP(email);
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (deviceId, preAuthSessionId, userInputCode) => {
    try {
      setIsLoading(true);

      
      const response = await authService.verifyOTP(deviceId, preAuthSessionId, userInputCode);
      
      if (response.success) {
 
        
        // Update authentication state
        setIsAuthenticated(true);
        
        // Get user data from session
        const sessionData = await authService.getSession();
        if (sessionData.success) {
          setUser({
            id: sessionData.session.userId,
            ...sessionData.session.accessTokenPayload
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send email verification
  const sendEmailVerification = async () => {
    try {

      return await authService.sendEmailVerification();
    } catch (error) {
      console.error('❌ Send email verification error:', error);
      throw error;
    }
  };

  // Check email verification status
  const checkEmailVerification = async () => {
    try {
      return await authService.checkEmailVerification();
    } catch (error) {
      console.error('❌ Check email verification error:', error);
      return { success: false, isVerified: false };
    }
  };

  // Send password reset
  const sendPasswordReset = async (email) => {
    try {

      return await authService.sendPasswordReset(email);
    } catch (error) {
      console.error('❌ Send password reset error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (formFields) => {
    try {
    
      return await authService.resetPassword(formFields);
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  };

  // Email verification
  const verifyEmail = async () => {
    try {
     
      return await authService.verifyEmailToken();
    } catch (error) {
      console.error('❌ Email verification error:', error);
      throw error;
    }
  };

  // Consume passwordless code (for OTP-based operations)
  const consumePasswordlessCode = async (userInputCode, password = null) => {
    try {

      // For SuperTokens, we use the regular verifyOTP method for passwordless code consumption
      // The password parameter is for password reset scenarios
      return await authService.verifyOTP(null, userInputCode);
    } catch (error) {
      console.error('❌ Consume passwordless code error:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async () => {
    try {
      return await authService.getUserProfile();
    } catch (error) {
      console.error('❌ Get user profile error:', error);
      throw error;
    }
  };

  // Refresh session data
  const refreshSession = async () => {
    try {

      await checkAuthStatus();
    } catch (error) {
      console.error('❌ Refresh session error:', error);
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    if (!user?.roles) return false;
    return roles.some(role => user.roles.includes(role));
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    sessionInfo,
    
    // Authentication methods
    login,
    logout,
    forceLogout,
    register,
    
    // Email verification methods
    sendOTP,
    verifyOTP,
    sendEmailVerification,
    checkEmailVerification,
    
    // Password reset methods
    sendPasswordReset,
    resetPassword,
    verifyEmail,
    
    // Utility methods
    refreshSession,
    hasRole,
    hasAnyRole,
    checkAuthStatus,
    
    // Session management methods
    validateSession,
    getSessionInfo: () => sessionService.getSessionInfo(),
    getSessionStatus: () => sessionService.getSessionStatus(),
    startSessionMonitoring: () => sessionService.startSessionMonitoring(),
    stopSessionMonitoring: () => sessionService.stopSessionMonitoring(),
    
    // Cookie monitoring methods
    startCookieMonitoring: () => cookieMonitorService.startMonitoring(),
    stopCookieMonitoring: () => cookieMonitorService.stopMonitoring(),
    getCookieMonitoringStatus: () => cookieMonitorService.getMonitoringStatus(),
    checkSessionCookies: () => cookieMonitorService.checkSessionCookies(),
    checkSessionOnPageLoad: () => cookieMonitorService.checkSessionOnPageLoad(),
    forceSessionCheck: () => cookieMonitorService.forceSessionCheck(),
    manualSessionCheck: () => cookieMonitorService.manualSessionCheck(),
    forceCleanupCookies: () => cookieMonitorService.forceCleanupCookies(),
    isSessionValid: () => cookieMonitorService.isSessionValid(),
    setCookieDebugMode: (enabled) => cookieMonitorService.setDebugMode(enabled),
    getCookieDebugMode: () => cookieMonitorService.getDebugMode(),
    
    // Legacy methods (for backward compatibility)
    consumePasswordlessCode,
    getUserProfile,
    
    // Testing/debugging methods
    clearValidationCache: () => {
      localStorage.removeItem('lastSessionValidation');
     
    },
    forceSessionValidation: async () => {
    
      localStorage.removeItem('lastSessionValidation'); // Clear cache
      const isValid = await validateSession();

      return isValid;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
