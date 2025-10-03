/**
 * Session Manager Component
 * Provides session monitoring and management UI
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import sessionService from '../services/sessionService';
import cookieMonitorService from '../services/cookieMonitorService';

const SessionManager = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [sessionStatus, setSessionStatus] = useState(null);
  const [lastActivity, setLastActivity] = useState(new Date());
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [cookieMonitoringStatus, setCookieMonitoringStatus] = useState({ isMonitoring: false });

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

  useEffect(() => {
    // Skip session validation for public auth pages
    if (isPublicAuthPage()) {
      console.log('🔓 Public auth page detected, skipping session validation');
      return;
    }

    if (!isAuthenticated) {
      setSessionStatus(null);
      setShowSessionWarning(false);
      return;
    }

    // Get initial session status
    const getSessionStatus = () => {
      const status = sessionService.getSessionStatus();
      setSessionStatus(status);
    };

    // Get initial cookie monitoring status
    const getCookieStatus = () => {
      const status = cookieMonitorService.getMonitoringStatus();
      setCookieMonitoringStatus(status);
    };

    getSessionStatus();
    getCookieStatus();

    // Set up session event listeners
    const handleSessionExpired = (data) => {
      console.log('🔒 Session expired in SessionManager:', data);
      setShowSessionWarning(false);
      setSessionStatus(null);
    };

    const handleSessionRefreshed = (data) => {
      console.log('✅ Session refreshed in SessionManager:', data);
      setLastActivity(new Date());
      setShowSessionWarning(false);
      getSessionStatus();
    };

    const handleSessionInvalid = (data) => {
      console.log('❌ Session invalid in SessionManager:', data);
      setShowSessionWarning(false);
      setSessionStatus(null);
    };

    const handleSessionRefreshFailed = (data) => {
      console.log('⚠️ Session refresh failed in SessionManager:', data);
      setShowSessionWarning(true);
    };

    // Set up cookie monitoring event listeners
    const handleSessionCookiesMissing = (data) => {
      console.log('🍪 Session cookies missing in SessionManager:', data);
      setShowSessionWarning(true);
    };

    const handleSessionCookiesValid = (data) => {
      console.log('✅ Session cookies valid in SessionManager:', data);
      setShowSessionWarning(false);
    };

    const handleCookiesCleaned = (data) => {
      console.log('🧹 Cookies cleaned in SessionManager:', data);
      setShowSessionWarning(false);
    };

    // Add event listeners
    sessionService.addEventListener('sessionExpired', handleSessionExpired);
    sessionService.addEventListener('sessionRefreshed', handleSessionRefreshed);
    sessionService.addEventListener('sessionInvalid', handleSessionInvalid);
    sessionService.addEventListener('sessionRefreshFailed', handleSessionRefreshFailed);

    // Add cookie monitoring event listeners
    cookieMonitorService.addEventListener('sessionCookiesMissing', handleSessionCookiesMissing);
    cookieMonitorService.addEventListener('sessionCookiesValid', handleSessionCookiesValid);
    cookieMonitorService.addEventListener('cookiesCleaned', handleCookiesCleaned);

    // Update last activity on user interaction
    const updateActivity = () => {
      setLastActivity(new Date());
    };

    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      // Remove event listeners
      sessionService.removeEventListener('sessionExpired', handleSessionExpired);
      sessionService.removeEventListener('sessionRefreshed', handleSessionRefreshed);
      sessionService.removeEventListener('sessionInvalid', handleSessionInvalid);
      sessionService.removeEventListener('sessionRefreshFailed', handleSessionRefreshFailed);

      // Remove cookie monitoring event listeners
      cookieMonitorService.removeEventListener('sessionCookiesMissing', handleSessionCookiesMissing);
      cookieMonitorService.removeEventListener('sessionCookiesValid', handleSessionCookiesValid);
      cookieMonitorService.removeEventListener('cookiesCleaned', handleCookiesCleaned);
      
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [isAuthenticated]);

  // Show session warning if refresh failed
  if (showSessionWarning && isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                Session Warning
              </h3>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Your session could not be refreshed automatically. This might be due to network issues or server problems.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  await sessionService.refreshSession();
                  setShowSessionWarning(false);
                } catch (error) {
                  console.error('Manual refresh failed:', error);
                }
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setShowSessionWarning(false);
                // Continue anyway - user can still use the app
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      
  
    </>
  );
};

export default SessionManager;
