import React, { useState, useRef, useEffect } from "react";
import { X, User, Mail, Phone, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../api/services/authService";
import useNotifications from "../../hooks/useNotifications";
import NotificationBell from "../notifications/NotificationBell";
import NotificationPortal from "../notifications/NotificationPortal";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
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

  const fetchUserProfile = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const sessionResponse = await authService.getSession();
      if (sessionResponse.success && (sessionResponse.user || sessionResponse.mongoUser)) {
        const backendUser = sessionResponse.mongoUser || sessionResponse.user;
        setUserProfile({
          id: backendUser.supertokensUserId ,
          name: backendUser.name,
          email: backendUser.email ,
          phone: backendUser.phone ,
          role: backendUser.role ,
          preferences: backendUser.preferences 
        });
      }
    } catch (error) {
    }
  };
  const displayProfile = userProfile
  const handleNotificationClick = () => {
    if (isNotificationOpen) {
      closeNotifications();
    } else {
      openNotifications();
    }
    setIsUserMenuOpen(false); 
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationOpen) {
      closeNotifications(); 
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
 
      navigate("/login");
    } catch (error) {
      navigate("/login");
    }
  };

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


  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  }, [isAuthenticated, user?.id, user?.email]);
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm"
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
   
        <div className="flex items-center space-x-4 gap-4">
      
          <NotificationBell
            count={unread}
            onClick={handleNotificationClick}
          />

      
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


            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
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
           
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {displayProfile.name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500 capitalize">{displayProfile.role}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Name</p>
                          <p className="text-xs text-gray-500">
                            {displayProfile.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <p className="text-xs text-gray-500">{displayProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Phone Number</p>
                          <p className="text-xs text-gray-500">{displayProfile.phone}</p>
                        </div>
                      </div>



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
                </div>
              )}
          </div>
        </div>
      </div>

    
    </header>
  );
};

export default Header;
