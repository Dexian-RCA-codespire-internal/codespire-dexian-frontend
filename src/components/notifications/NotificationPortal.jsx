import React, { useRef, useEffect, useCallback } from 'react';
import { X, Clock, Loader2 } from 'lucide-react';
import { FaRegEnvelope, FaRegEnvelopeOpen, FaEnvelopeOpenText } from 'react-icons/fa';
import { Button } from '../ui/Button';

/**
 * NotificationPortal component with lazy loading support
 * Displays a popup with a list of notifications and infinite scroll
 * 
 * @param {boolean} open - Whether the portal is open
 * @param {array} items - Array of notification items
 * @param {function} onClose - Handler to close the portal
 * @param {function} markAsRead - Handler to mark a notification as read
 * @param {function} markAllAsRead - Handler to mark all notifications as read
 * @param {boolean} loading - Loading state
 * @param {boolean} loadingMore - Loading more items state
 * @param {string} error - Error message if any
 * @param {object} pagination - Pagination information
 * @param {function} loadMore - Handler to load more notifications
 */
const NotificationPortal = ({ 
  open, 
  items = [], 
  onClose, 
  markAsRead, 
  markAllAsRead, 
  loading = false,
  loadingMore = false,
  error = null,
  pagination = {},
  loadMore
}) => {
  const scrollContainerRef = useRef(null);
  const loadMoreTriggerRef = useRef(null);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch (err) {
      return 'Unknown';
    }
  };

  const getNotificationIcon = (isRead) => {
    return (
      <div className="relative">
        {isRead ? (
          <FaRegEnvelopeOpen className="w-4 h-4 text-gray-500" />
        ) : (
          <FaRegEnvelope className="w-4 h-4 text-gray-700" />
        )}
      </div>
    );
  };

  const unreadCount = items.filter(item => !item.isRead).length;

  // Handle scroll event for lazy loading
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingMore || !pagination.hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when user has scrolled 80% down
    if (scrollPercentage > 0.8) {
      loadMore();
    }
  }, [loadingMore, pagination.hasNextPage, loadMore]);

  // Setup scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !open) return;

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, open]);

  // Use Intersection Observer as alternative method
  useEffect(() => {
    if (!open || !pagination.hasNextPage || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current);
    }

    return () => {
      if (loadMoreTriggerRef.current) {
        observer.unobserve(loadMoreTriggerRef.current);
      }
    };
  }, [open, pagination.hasNextPage, loadingMore, loadMore]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 "
        onClick={onClose}
      />
      
      {/* Portal */}
      <div className="fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 max-h-[65vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          {/* <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button> */}
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100">
            <button
              onClick={markAllAsRead}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              aria-label="Mark all as read"
              title="Mark all as read"
            >
              <FaEnvelopeOpenText className="w-4 h-4" style={{ color: 'rgb(34, 197, 94)' }} />
            </button>
          </div>
        )}

        {/* Content with scroll */}
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !item.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Green dot indicator for unread */}
                    <div className="mt-1.5 w-2">
                      {!item.isRead && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {item.title && (
                            <h4 className={`text-sm mb-1 ${!item.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-900'}`}>
                              {item.title}
                            </h4>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(item.createdAt)}
                          </span>
                          {/* Clickable notification icon */}
                          <button
                            onClick={() => !item.isRead && markAsRead(item._id)}
                            className={`p-1 rounded transition-colors ${
                              !item.isRead ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-default'
                            }`}
                            aria-label={item.isRead ? 'Read' : 'Mark as read'}
                            disabled={item.isRead}
                          >
                            {getNotificationIcon(item.isRead)}
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed ${!item.isRead ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load more trigger and indicator */}
              {pagination.hasNextPage && (
                <div ref={loadMoreTriggerRef} className="p-4 text-center">
                  {loadingMore ? (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading more...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Load more notifications
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              {pagination.totalCount > 0 ? (
                <>Loaded {items.length} of {pagination.totalCount} notification{pagination.totalCount !== 1 ? 's' : ''}</>
              ) : (
                <>Showing {items.length} notification{items.length !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPortal;