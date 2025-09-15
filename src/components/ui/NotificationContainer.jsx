// new file servicenow
import React from 'react';
import NotificationToast from './NotificationToast';

const NotificationContainer = ({ notifications, onRemoveNotification, onClearNotifications }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClearNotifications}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all ({notifications.length})
          </button>
        </div>
      )}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={onRemoveNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;


