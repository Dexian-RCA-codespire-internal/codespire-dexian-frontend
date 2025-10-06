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
         ('🔒 Session expired in AuthContext:', data);
        await clearAuthStateWithCleanup();
      };

      const handleSessionRefreshed = (data) => {
         ('✅ Session refreshed in AuthContext:', data);
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
         ('❌ [DEBUG] Session invalid in AuthContext:', data);
        
        // Only logout if session was explicitly revoked or unauthorized
        if (data.reason === 'unauthorized' || data.sessionRevoked) {
           ('🔒 Session explicitly revoked or unauthorized - logging out');
           ('❌ [DEBUG] Current user state before logout:', {
            isAuthenticated,
            user: user?.email,
            sessionInfo: !!sessionInfo
          });
          
          await clearAuthStateWithCleanup();
          
           ('❌ [DEBUG] Auth state cleared, redirecting to login...');
          
          // Redirect to login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
          }
        } else {
           ('⚠️ Session validation issue but not explicitly revoked - ignoring');
           ('⚠️ Reason:', data.reason, 'Message:', data.message);
        }
      };

      const handleLogout = async (data) => {
         ('🚪 Logout in AuthContext:', data);
        await clearAuthStateWithCleanup();
      };

      // Disable aggressive cookie monitoring that causes logout on refresh
      // const handleSessionCookiesMissing = async (data) => {
      //    ('🍪 Session cookies missing in AuthContext:', data);
      //   await clearAuthStateWithCleanup();
      //   if (!window.location.pathname.includes('/login')) {
      //     window.location.href = '/login?expired=true';
      //   }
      // };

      const handleSessionCookiesMissing = (data) => {
         ('🍪 Session cookies missing in AuthContext:', data);
        // Don't immediately logout - this can happen during page refresh
         ('⚠️ Ignoring cookie missing event - could be temporary during refresh');
      };

      const handleSessionCookiesValid = (data) => {
         ('✅ Session cookies valid in AuthContext:', data);
        // Cookies are valid, ensure we're authenticated
        if (!isAuthenticated) {
          initializeAuth();
        }
      };

      const handleCookiesCleaned = async (data) => {
         ('🧹 Cookies cleaned in AuthContext:', data);
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
      // For public auth pages, just set loading to false without initializing auth
       ('🔓 Public auth page detected, skipping auth initialization');
      setIsLoading(false);
    }
  }, []);

  const clearAuthState = () => {
     ('🧹 Clearing auth state...');
    
    setIsAuthenticated(false);
    setUser(null);
    setSessionInfo(null);
    setIsLoading(false);
    
    // Stop session monitoring
    sessionService.stopSessionMonitoring();
    // Stop cookie monitoring
    cookieMonitorService.stopMonitoring();
    
     ('✅ Auth state cleared');
  };

  const clearAuthStateWithCleanup = async () => {
     ('🧹 Clearing auth state and cleaning up...');
    
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
       ('🍪 Cleaning up SuperTokens session and cookies...');
      await Session.signOut();
       ('✅ SuperTokens session cleaned up');
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
       ('✅ Local storage cleared including cached user data');
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
       ('✅ Manual cookie cleanup completed');
    } catch (error) {
      console.warn('⚠️ Error in manual cookie cleanup:', error.message);
    }
    
     ('✅ Auth state cleared completely');
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
         ('🔓 Public auth page detected, skipping auth initialization');
        setIsLoading(false);
        return;
      }
      
      // Check if user is authenticated locally first (no backend call yet)
      const isAuthenticated = await Session.doesSessionExist();
      
      if (isAuthenticated) {
         ('🔍 Local session exists, setting up monitoring...');
        
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
             ('✅ Auth initialized successfully:', userData.email);
          } else {
             ('⚠️ No session info available - trying to get user data from SuperTokens directly');
            
            // Try to get user data from SuperTokens session payload
            try {
              const supertokensPayload = await Session.getAccessTokenPayloadSecurely();
               ('🔍 SuperTokens payload:', supertokensPayload);
              
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
                 ('✅ Auth initialized with SuperTokens payload:', userData.email);
              } else {
                 ('⚠️ No SuperTokens payload available - using minimal user data');
                
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
                 ('✅ Auth initialized with minimal data for authenticated user');
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
               ('✅ Auth initialized with fallback data for authenticated user');
            }
          }
        } catch (sessionError) {
          console.warn('⚠️ Error getting session info during initialization:', sessionError.message);
           ('⚠️ Still setting authenticated state since local session exists');
          
          // Try to get basic user data from SuperTokens even if backend fails
          try {
            const supertokensPayload = await Session.getAccessTokenPayloadSecurely();
             ('🔍 SuperTokens payload (fallback):', supertokensPayload);
            
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
               ('✅ Auth initialized with SuperTokens fallback data:', userData.email);
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
               ('✅ Auth initialized with final fallback for authenticated user');
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
             ('✅ Auth initialized with absolute fallback for authenticated user');
          }
        }
      } else {
         ('ℹ️ User is not authenticated');
        clearAuthState();
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      // Don't clear auth state on initialization errors - could be temporary
       ('⚠️ Auth initialization failed but not clearing state - might be temporary');
    } finally {
      setIsLoading(false);
    }
  };

  const validateSession = async () => {
    try {
       ('🔍 Validating session with backend...');
      
      // Check if session exists locally first
      const sessionExists = await Session.doesSessionExist();
      if (!sessionExists) {
         ('❌ No local session found');
        if (isAuthenticated) {
          await clearAuthStateWithCleanup();
        }
        return false;
      }
      
      // Only validate with backend if we haven't validated recently (within last 10 minutes)
      const now = Date.now();
      const lastValidation = localStorage.getItem('lastSessionValidation');
      if (lastValidation && (now - parseInt(lastValidation)) < 10 * 60 * 1000) {
         ('⏭️ Skipping backend validation - validated recently');
        return true;
      }
      
      // Call backend session status endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await authService.checkSessionStatus();
        clearTimeout(timeoutId);
        
         ('🔍 Backend session validation response:', {
          success: response.success,
          isValid: response.data?.isValid,
          sessionRevoked: response.sessionRevoked,
          message: response.message
        });
        
        if (response.success && response.data.isValid) {
           ('✅ Session validation successful');
          localStorage.setItem('lastSessionValidation', now.toString());
          return true;
        } else {
           ('❌ Session validation failed:', response.message);
          // Only logout on explicit session revocation
          if (response.sessionRevoked) {
             ('🔒 Session was explicitly revoked, logging out');
            return false;
          }
          // For other validation failures, be more lenient - try to refresh session
           ('⚠️ Backend validation failed, attempting session refresh...');
          try {
            await Session.attemptRefreshingSession();
             ('✅ Session refreshed successfully after validation failure');
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
           ('🔒 401 Unauthorized - attempting session refresh...');
          try {
            await Session.attemptRefreshingSession();
             ('✅ Session refreshed successfully after 401');
            localStorage.setItem('lastSessionValidation', now.toString());
            return true;
          } catch (refreshError) {
            console.error('❌ Session refresh failed after 401:', refreshError);
            return false;
          }
        }
        
        // For network errors or other issues, be more lenient - assume session is still valid
        if (apiError.code === 'NETWORK_ERROR' || apiError.message.includes('timeout')) {
           ('⚠️ Network error during validation - assuming session is still valid');
          return true;
        }
        
        // For other errors, try to refresh session before giving up
         ('⚠️ Other error during validation - attempting session refresh...');
        try {
          await Session.attemptRefreshingSession();
           ('✅ Session refreshed successfully after error');
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
         ('✅ Session refreshed successfully after validation error');
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
       ('🔍 Checking authentication status...');
      
      // Check if session exists using SuperTokens
      const sessionExists = await Session.doesSessionExist();
      
      if (!sessionExists) {
         ('❌ No session found');
        clearAuthState();
        return;
      }

      // Get session data from backend
      const response = await authService.getSession();
      
      if (response.success && response.session) {
         ('✅ User is authenticated');
        
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
        
         ('✅ User data loaded:', {
          userId: sessionData.userId,
          email: userData.email,
          roles: userData.roles
        });
      } else {
         ('❌ Failed to get session data');
        clearAuthState();
      }
    } catch (error) {
      console.error('❌ Auth status check error:', error);
      
      // Try to check if session exists and clear if corrupted
      try {
        const sessionStillExists = await Session.doesSessionExist();
        if (sessionStillExists) {
           ('🧹 Attempting to clear corrupted session');
          await Session.signOut();
           ('✅ Cleared corrupted session');
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
       ('🔐 Attempting login...');
      
      const response = await authService.login(credentials);
      
      if (response.success) {
         ('✅ Login successful');
        
        // Refresh auth state after successful login
        await checkAuthStatus();
        
        return response;
      } else {
         ('❌ Login failed:', response.message);
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
       ('🔐 Attempting logout...');
      
      // Use session service for logout
      await sessionService.logout();
      
      // Always clear local state regardless of API response
      await clearAuthStateWithCleanup();
      
       ('✅ Logout completed');
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
     ('🚪 Force logout initiated...');
    
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
           ('✅ Backend logout successful');
        } else {
          console.warn('⚠️ Backend logout failed, continuing with frontend cleanup');
        }
      } catch (backendError) {
        console.warn('⚠️ Backend logout error:', backendError.message);
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
        
         ('✅ Nuclear storage cleanup completed');
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
       ('� Attempting registration...');
      
      const response = await authService.register(userData);
      
      if (response.success) {
         ('✅ Registration successful');
        
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
       ('📧 Sending OTP...');
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
       ('� Verifying OTP...');
      
      const response = await authService.verifyOTP(deviceId, preAuthSessionId, userInputCode);
      
      if (response.success) {
         ('✅ OTP verification successful');
        
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
       ('📧 Sending email verification...');
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
       ('📧 Sending password reset...');
      return await authService.sendPasswordReset(email);
    } catch (error) {
      console.error('❌ Send password reset error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (formFields) => {
    try {
       ('🔐 Resetting password...');
      return await authService.resetPassword(formFields);
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  };

  // Email verification
  const verifyEmail = async () => {
    try {
       ('📧 Verifying email...');
      return await authService.verifyEmailToken();
    } catch (error) {
      console.error('❌ Email verification error:', error);
      throw error;
    }
  };

  // Consume passwordless code (for OTP-based operations)
  const consumePasswordlessCode = async (userInputCode, password = null) => {
    try {
       ('🔓 Consuming passwordless code...');
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
       ('🔄 Refreshing session...');
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
       ('🧹 Validation cache cleared');
    },
    forceSessionValidation: async () => {
       ('🔍 Forcing session validation...');
      localStorage.removeItem('lastSessionValidation'); // Clear cache
      const isValid = await validateSession();
       ('🔍 Force validation result:', isValid);
      return isValid;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
