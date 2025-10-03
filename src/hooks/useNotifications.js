import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../api/services/notificationService';
import webSocketService from '../services/websocketService';

/**
 * Hook for managing notifications with lazy loading support
 * Handles fetching, real-time updates, pagination, and state management for notifications
 */
const useNotifications = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Use ref to track if we've already loaded the first page
  const initialLoadRef = useRef(false);
  // Track loaded notification IDs to prevent duplicates
  const loadedIdsRef = useRef(new Set());

  // Fetch notifications from API with pagination
  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await notificationService.getNotifications({
        page,
        limit: 10,
        unreadOnly: false
      });

      if (response.success) {
        const newItems = response.data || [];
        
        if (append && page > 1) {
          // Filter out any duplicate items before appending
          const uniqueNewItems = newItems.filter(item => {
            if (loadedIdsRef.current.has(item._id)) {
              return false;
            }
            loadedIdsRef.current.add(item._id);
            return true;
          });
          
          // Append new items to existing ones for lazy loading
          setItems(prevItems => [...prevItems, ...uniqueNewItems]);
        } else {
          // Replace all items for initial load or refresh
          setItems(newItems);
          // Reset loaded IDs when doing a fresh load
          loadedIdsRef.current = new Set(newItems.map(item => item._id));
        }
        
        // Update pagination info
        if (response.pagination) {
          setPagination(response.pagination);
        }
        
        // Update unread count
        if (page === 1) {
          // For first page, count only from new items
          const unreadCount = newItems.filter(item => !item.isRead).length;
          setUnread(unreadCount);
          setHasUnread(unreadCount > 0);
        } else if (append) {
          // For appended items, add to existing unread count
          const newUnreadCount = newItems.filter(item => !item.isRead && !loadedIdsRef.current.has(item._id)).length;
          if (newUnreadCount > 0) {
            setUnread(prevUnread => prevUnread + newUnreadCount);
            setHasUnread(true);
          }
        }
      } else {
        setError(response.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Load more notifications (for lazy loading)
  const loadMore = useCallback(async () => {
    if (!pagination.hasNextPage || loadingMore) return;
    
    // Additional check to prevent loading beyond total count
    if (items.length >= pagination.totalCount && pagination.totalCount > 0) {
      console.log('All notifications already loaded');
      return;
    }
    
    const nextPage = pagination.currentPage + 1;
    await fetchNotifications(nextPage, true);
  }, [pagination, loadingMore, items.length, fetchNotifications]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        const count = response.data?.unreadCount || 0;
        setUnread(count);
        setHasUnread(count > 0);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Handle WebSocket notification events
  const handleNotificationEvent = useCallback((data) => {
    try {
      console.log('📡 Received WebSocket notification:', data);
      
      if (data.type === 'notification' && data.message) {
        // Instead of creating temporary notifications, refresh from database
        // This ensures we get real persisted notifications
        console.log('🔄 Refreshing notifications from database due to WebSocket event');
        fetchNotifications(1, false); // Refresh first page
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error handling WebSocket notification:', err);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Initialize and setup WebSocket listener
  useEffect(() => {
    // Initial fetch only once
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchNotifications(1, false);
    }
    
    // Setup WebSocket listener for real-time notifications
    webSocketService.on('notification', handleNotificationEvent);
    
    // Cleanup
    return () => {
      webSocketService.off('notification', handleNotificationEvent);
    };
  }, [fetchNotifications, handleNotificationEvent]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Optimistic update
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === notificationId 
            ? { ...item, isRead: true }
            : item
        )
      );
      
      // Decrease unread count if notification was previously unread
      const notification = items.find(item => item._id === notificationId);
      if (notification && !notification.isRead) {
        setUnread(prevUnread => Math.max(0, prevUnread - 1));
        setHasUnread(prevUnread => prevUnread - 1 > 0);
      }
      
      // API call to mark as read in database
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert optimistic update on error
      fetchNotifications(1, false);
      fetchUnreadCount();
    }
  }, [items, fetchNotifications, fetchUnreadCount]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setItems(prevItems => 
        prevItems.map(item => ({ ...item, isRead: true }))
      );
      setUnread(0);
      setHasUnread(false);
      
      // API call (this will mark all persisted notifications as read)
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      // Revert optimistic update on error
      fetchNotifications(1, false);
      fetchUnreadCount();
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Open notification portal
  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  // Close notification portal and mark all as read
  const onClose = useCallback(() => {
    setOpen(false);
    // Mark all notifications as read when closing the portal
    markAllAsRead();
  }, [markAllAsRead]);

  // Reload notifications (reset to first page)
  const reload = useCallback(() => {
    // Reset loaded IDs when reloading
    loadedIdsRef.current.clear();
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  return {
    items,
    unread,
    hasUnread,
    open,
    loading,
    loadingMore,
    error,
    pagination,
    onOpen,
    onClose,
    markAsRead,
    markAllAsRead,
    reload,
    loadMore,
    fetchUnreadCount
  };
};

export default useNotifications;