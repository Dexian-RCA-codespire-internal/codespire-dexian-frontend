import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, User, Mail, Phone, LogOut, Bug } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../api/services/authService";
import useNotifications from "../../hooks/useNotifications";
import NotificationBell from "../notifications/NotificationBell";
import NotificationPortal from "../notifications/NotificationPortal";

const Header = () => {
  const { user, isAuthenticated, logout, sessionInfo } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  
  // Use the notification hook
  const {
    items: notifications,
    unread,
    open: isNotificationOpen,
    onOpen: openNotifications,
    onClose: closeNotifications,
    markAsRead,
    markAllAsRead,
    loading: notificationsLoading,
    loadingMore: notificationsLoadingMore,
    error: notificationsError,
    pagination: notificationsPagination,
    loadMore: loadMoreNotifications
  } = useNotifications();

  // Fetch real user profile data from backend
  const fetchUserProfile = async () => {
    if (!isAuthenticated || isLoadingProfile) return;
    
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      console.log('🔍 Fetching user profile from backend...');
      
      // Try to get comprehensive session info first
      const sessionResponse = await authService.getSession();
      
      console.log('🔍 Session response:', sessionResponse);
      
      if (sessionResponse.success && (sessionResponse.user || sessionResponse.mongoUser)) {
        // Use mongoUser data if available (contains real user data), otherwise fallback to user data
        const backendUser = sessionResponse.mongoUser || sessionResponse.user;
        console.log('🔍 Backend user data:', backendUser);
        
        const profileData = {
          id: backendUser.supertokensUserId || backendUser.id || user?.id,
          name: backendUser.name || `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || 'User',
          email: backendUser.email || 'No email',
          phone: backendUser.phone || 'No phone',
          role: backendUser.role || 'User',
          roles: backendUser.roles || ['admin'],
          preferences: backendUser.preferences || {}
          // Note: Removed lastLoginAt, sessionCount, activeSessions, status, isActive, isEmailVerified from display
        };
        
        setUserProfile(profileData);
        console.log('✅ User profile loaded from backend:', profileData);
      } else {
        // Try alternative endpoint - getUserProfile
        console.log('⚠️ Session info failed, trying getUserProfile endpoint...');
        try {
          const profileResponse = await authService.getUserProfile();
          if (profileResponse.success && profileResponse.data) {
            const profileUser = profileResponse.data;
            const profileData = {
              id: profileUser.userId || user?.id,
              name: profileUser.name || `${profileUser.firstName || ''} ${profileUser.lastName || ''}`.trim() || 'User',
              email: profileUser.email || 'No email',
              phone: profileUser.phone || 'No phone',
              role: profileUser.role || 'User',
              roles: profileUser.roles || ['admin'],
              preferences: profileUser.preferences || {}
            };
            
            setUserProfile(profileData);
            console.log('✅ User profile loaded from getUserProfile endpoint:', profileData);
            return;
          }
        } catch (profileError) {
          console.warn('⚠️ getUserProfile also failed:', profileError);
        }
        
        // Fallback to auth context data
        console.log('⚠️ Using fallback user data from auth context');
        const fallbackProfile = user ? {
          id: user.id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          email: user.email || 'No email',
          phone: user.phone || 'No phone',
          role: user.role || 'User',
          roles: user.roles || ['admin'],
          preferences: user.preferences || {}
        } : {
          id: 'guest',
          name: 'Guest',
          email: 'No email',
          phone: 'No phone',
          role: 'Guest',
          roles: ['guest'],
          preferences: {}
        };
        
        setUserProfile(fallbackProfile);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setProfileError(error.message || 'Failed to fetch user profile');
      
      // Use fallback data on error
      const fallbackProfile = user ? {
        id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        email: user.email || 'No email',
        phone: user.phone || 'No phone',
        role: user.role || 'User',
        roles: user.roles || ['admin'],
        preferences: user.preferences || {}
      } : {
        id: 'guest',
        name: 'Guest',
        email: 'No email',
        phone: 'No phone',
        role: 'Guest',
        roles: ['guest'],
        preferences: {}
      };
      
      setUserProfile(fallbackProfile);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Get user profile data (use fetched data or fallback)
  const currentUserProfile = userProfile || (user ? {
    id: user.id,
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    email: user.email || 'No email',
    phone: user.phone || 'No phone',
    role: user.role || 'User',
    roles: user.roles || ['admin'],
    preferences: user.preferences || {}
  } : {
    id: 'guest',
    name: 'Guest',
    email: 'No email',
    phone: 'No phone',
    role: 'Guest',
    roles: ['guest'],
    preferences: {}
  });

  const handleNotificationClick = () => {
    if (isNotificationOpen) {
      closeNotifications();
    } else {
      openNotifications();
    }
    setIsUserMenuOpen(false); // Close user menu when opening notifications
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationOpen) {
      closeNotifications(); // Close notifications when opening user menu
    }
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
    setProfileError(null); // Clear any profile errors when closing menu
  };

  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);
      console.log('🚪 Logging out user...');
      
      await logout();
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
      // Force redirect even if logout fails
      window.location.href = "/login";
    }
  };

  // Close popups when clicking outside and monitor session status
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };


    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch user profile when authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      // Clear user profile when not authenticated
      setUserProfile(null);
      setProfileError(null);
    }
  }, [isAuthenticated, user?.id]); // Re-fetch when user ID changes
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-3">
          <div className="relative group flex items-center space-x-2">
            <div className="relative overflow-hidden rounded-l-md">
              <img 
                src="/logos/dexian-logo.png" 
                alt="Dexian Logo" 
                className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
              />
            </div>
            <img 
              src="/logos/dexiannavbar-text.png" 
              alt="Dexian Text" 
              className="h-8 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        {/* before proofile I want a notification icon 2 as notification number*/}

        <div className="flex items-center space-x-4 gap-4">
          {/* Global search removed per request */}
          {/* New Notification Bell */}
          <NotificationBell
            count={unread}
            onClick={handleNotificationClick}
          />

          {/* New Notification Portal */}
          <NotificationPortal
            open={isNotificationOpen}
            items={notifications}
            onClose={closeNotifications}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            loading={notificationsLoading}
            loadingMore={notificationsLoadingMore}
            error={notificationsError}
            pagination={notificationsPagination}
            loadMore={loadMoreNotifications}
          />
          
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>

            {/* User Profile Popup */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Profile</h3>
                      <div className="flex items-center space-x-2">
              
                        <button
                          onClick={closeUserMenu}
                          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {isLoadingProfile ? 'Loading...' : currentUserProfile.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500 capitalize">{currentUserProfile.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Options */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Name</p>
                          <p className="text-xs text-gray-500">
                            {isLoadingProfile ? 'Loading...' : currentUserProfile.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-xs text-gray-500">{currentUserProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone Number</p>
                          <p className="text-xs text-gray-500">{currentUserProfile.phone}</p>
                        </div>
                      </div>



                      {/* Error Display */}
                      {profileError && (
                        <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-md border border-red-200">
                          <Bug className="w-4 h-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Profile Error</p>
                            <p className="text-xs text-red-600">{profileError}</p>
                            <button
                              onClick={fetchUserProfile}
                              className="text-xs text-red-700 hover:text-red-900 underline mt-1"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

    
    </motion.header>
  );
};

export default Header;
