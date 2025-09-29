import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '../ui/Badge';

/**
 * NotificationBell component
 * Displays a bell icon with an optional red count badge
 * 
 * @param {number} count - Number of unread notifications
 * @param {function} onClick - Click handler for the bell
 * @param {string} className - Additional CSS classes
 */
const NotificationBell = ({ count = 0, onClick, className = '' }) => {
  const hasCount = count > 0;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={onClick}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label={`Notifications${hasCount ? ` (${count} unread)` : ''}`}
        type="button"
      >
        <Bell className="w-6 h-6" />
        
        {/* Red count badge - only visible when count > 0 */}
        {hasCount && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white"
            aria-label={`${count} unread notifications`}
          >
            {count > 99 ? '99+' : count}
          </Badge>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;

