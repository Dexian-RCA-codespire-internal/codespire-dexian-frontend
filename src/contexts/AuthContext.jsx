import React, { createContext, useContext, useState, useEffect } from 'react';
import Session from 'supertokens-auth-react/recipe/session';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import { authService } from '../api/services/authService';
import sessionService from '../services/sessionService';
import cookieMonitorService from '../services/cookieMonitorService';

import {useNavigate} from 'react-router-dom';
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

  const navigate = useNavigate();


  useEffect(() => {

    const isPublicAuthPage = () => {
      const path = window.location.pathname;
      return path.includes('/login') || 
             path.includes('/register') || 
             path.includes('/forgot-password') || 
             path.includes('/reset-password') || 
             path.includes('/verify-') ||
             path.includes('/auth/');
    };

    if (!isPublicAuthPage()) {
      initializeAuth();
      
   
      const handleSessionExpired = async (data) => {
      
        await clearAuthStateWithCleanup();
      };

      const handleSessionRefreshed = (data) => {
   
        if (data.sessionInfo && data.sessionInfo.user) {

          const userData = {
            id: data.sessionInfo.user.userId ,
            email: data.sessionInfo.user.email ,
            name: data.sessionInfo.user.name ,
            firstName: data.sessionInfo.user.firstName ,
            lastName: data.sessionInfo.user.lastName ,
            phone: data.sessionInfo.user.phone ,
            role: data.sessionInfo.user.role ,
            roles: data.sessionInfo.user.roles ,
            isEmailVerified: data.sessionInfo.user.isEmailVerified ,
            status: data.sessionInfo.user.status ,
            isActive: data.sessionInfo.user.isActive !== false,
            lastLoginAt: data.sessionInfo.user.lastLoginAt,
            preferences: data.sessionInfo.user.preferences
          };
          
          setSessionInfo(data.sessionInfo);
          setUser(userData);
        }
      };

      const handleSessionInvalid = async (data) => {


        if (data.reason === 'unauthorized' || data.sessionRevoked) {
  
          
          await clearAuthStateWithCleanup();
   
          
         
          if (window.location.pathname !== '/login') {
      
            navigate('/login?expired=true');
          }
        } 

      };

      const handleLogout = async (data) => {

        await clearAuthStateWithCleanup();
      };



      const handleSessionCookiesValid = (data) => {

        if (!isAuthenticated) {
          initializeAuth();
        }
      };

      const handleCookiesCleaned = async (data) => {

        await clearAuthStateWithCleanup();
      };


      sessionService.addEventListener('sessionExpired', handleSessionExpired);
      sessionService.addEventListener('sessionRefreshed', handleSessionRefreshed);
      sessionService.addEventListener('sessionInvalid', handleSessionInvalid);
      sessionService.addEventListener('logout', handleLogout);


      cookieMonitorService.addEventListener('sessionCookiesValid', handleSessionCookiesValid);
      cookieMonitorService.addEventListener('cookiesCleaned', handleCookiesCleaned);

      return () => {
        sessionService.removeEventListener('sessionExpired', handleSessionExpired);
        sessionService.removeEventListener('sessionRefreshed', handleSessionRefreshed);
        sessionService.removeEventListener('sessionInvalid', handleSessionInvalid);
        sessionService.removeEventListener('logout', handleLogout);


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
      throw error;
    }
    
 
    try {
   
      localStorage.removeItem('lastSessionValidation');
      localStorage.removeItem('cachedUserData');
      localStorage.clear();
      sessionStorage.clear();

    } catch (error) {
  throw error
    }

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
      throw error;
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

      if (isPublicAuthPage()) {

        setIsLoading(false);
        return;
      }

      const isAuthenticated = await Session.doesSessionExist();
      
      if (isAuthenticated) {
   

        setIsAuthenticated(true);
        
        await sessionService.startSessionMonitoring();
        cookieMonitorService.startMonitoring();
        
        
        try {
          const sessionInfo = await sessionService.getSessionInfo();
          
          if (sessionInfo && sessionInfo.user) {
    
            const userData = {
              id: sessionInfo.user.userId ,
              email: sessionInfo.user.email ,
              name: sessionInfo.user.name ,
              firstName: sessionInfo.user.firstName ,
              lastName: sessionInfo.user.lastName ,
              phone: sessionInfo.user.phone ,
              role: sessionInfo.user.role ,
              roles: sessionInfo.user.roles ,
              isEmailVerified: sessionInfo.user.isEmailVerified ,
              status: sessionInfo.user.status ,
              isActive: sessionInfo.user.isActive ,
              lastLoginAt: sessionInfo.user.lastLoginAt,
              preferences: sessionInfo.user.preferences 
            };
            
            setUser(userData);
            setSessionInfo(sessionInfo);

          } else {
           

            try {
              const supertokensPayload = await Session.getAccessTokenPayloadSecurely();

              
              if (supertokensPayload) {
              
                const userData = {
                  id: supertokensPayload.userId ,
                  email: supertokensPayload.email ,
                  name: supertokensPayload.name ,
                  firstName: supertokensPayload.firstName ,
                  lastName: supertokensPayload.lastName ,
                  phone: supertokensPayload.phone ,
                  role: supertokensPayload.role ,
                  roles: supertokensPayload.roles ,
                  isEmailVerified: supertokensPayload.isEmailVerified ,
                  status: 'active',
                  isActive: true,
                  lastLoginAt: null,
                  preferences: {}
                };
                
                setUser(userData);
              
              }
            } catch (payloadError) {
            
            throw payloadError;

            }
          }
        } catch (sessionError) {
       
      
          try {
            const supertokensPayload = await Session.getAccessTokenPayloadSecurely();

            
            if (supertokensPayload) {
              const userData = {
                id: supertokensPayload.userId,
                email: supertokensPayload.email ,
                name: supertokensPayload.name ,
                firstName: supertokensPayload.firstName ,
                lastName: supertokensPayload.lastName ,
                phone: supertokensPayload.phone ,
                role: supertokensPayload.role ,
                roles: supertokensPayload.roles ,
                isEmailVerified: supertokensPayload.isEmailVerified ,
                status: 'active',
                isActive: true,
                lastLoginAt: null,
                preferences: {}
              };
              
              setUser(userData);
          
            } 
          } catch (fallbackError) {
            throw fallbackError;
        
          }
        }
      } else {
     
        clearAuthState();
      }
    } catch (error) {
      throw error;
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
            return false;
          }
        }
      } catch (apiError) {
        clearTimeout(timeoutId);

        
        // Check if it's a 401 error (unauthorized) - this usually means session is invalid
        if (apiError.response?.status === 401) {

          try {
            await Session.attemptRefreshingSession();
      
            localStorage.setItem('lastSessionValidation', now.toString());
            return true;
          } catch (refreshError) {
  
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
         
          return false;
        }
      }
    } catch (error) {
 
      try {
        await Session.attemptRefreshingSession();
      
        return true;
      } catch (refreshError) {
    
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
          roles: userData.roles,
          isEmailVerified: userData.isEmailVerified,
          preferences: userData.preferences,
          isActive: userData.isActive,
          lastLoginAt: userData.lastLoginAt,
          ...sessionData.accessTokenPayload
        });
        
  
      } else {

        clearAuthState();
      }
    } catch (error) {

      
      try {
        const sessionStillExists = await Session.doesSessionExist();
        if (sessionStillExists) {
        
          await Session.signOut();
   
        }
      } catch (signOutError) {
 throw signOutError;
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
          throw new Error('Failed to logout from backend');
        }
      } catch (backendError) {
        throw backendError;
      }
      
      // Clear auth state
      await clearAuthStateWithCleanup();
      
 
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
        throw error;
      }
      
   navigate('/login?logout=true');
    
      
    } catch (error) {
      navigate('/login?logout=true');
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);

      
      const response = await authService.register(userData);
      
      if (response.success) {
     
        
        clearAuthState();
      }
      
      return response;
    } catch (error) {

      clearAuthState();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const sendOTP = async (email) => {
    try {
  
      return await authService.sendOTP(email);
    } catch (error) {

      throw error;
    }
  };
  const verifyOTP = async (deviceId, preAuthSessionId, userInputCode) => {
    try {
      setIsLoading(true);

      
      const response = await authService.verifyOTP(deviceId, preAuthSessionId, userInputCode);
      
      if (response.success) {
 
        
        setIsAuthenticated(true);
        
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

      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const sendEmailVerification = async () => {
    try {

      return await authService.sendEmailVerification();
    } catch (error) {

      throw error;
    }
  };

  const checkEmailVerification = async () => {
    try {
      return await authService.checkEmailVerification();
    } catch (error) {
      return { success: false, isVerified: false };
    }
  };


  const sendPasswordReset = async (email) => {
    try {

      return await authService.sendPasswordReset(email);
    } catch (error) {
  
      throw error;
    }
  };


  const resetPassword = async (formFields) => {
    try {
    
      return await authService.resetPassword(formFields);
    } catch (error) {

      throw error;
    }
  };

  const verifyEmail = async () => {
    try {
     
      return await authService.verifyEmailToken();
    } catch (error) {
 
      throw error;
    }
  };

  const consumePasswordlessCode = async (userInputCode, password = null) => {
    try {


      return await authService.verifyOTP(null, userInputCode);
    } catch (error) {
 
      throw error;
    }
  };


  const getUserProfile = async () => {
    try {
      return await authService.getUserProfile();
    } catch (error) {
  
      throw error;
    }
  };

  // Refresh session data
  const refreshSession = async () => {
    try {

      await checkAuthStatus();
    } catch (error) {
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
