import api from '../index.js';

// Notification API services
export const notificationService = {
  // Get all notifications
  getNotifications: async ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });
    const response = await api.get(`/notifications?${params}`);
    return response.data;
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  },

  // Get notification preferences
  getNotificationPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async () => {
    const response = await api.get('/notifications/stats');
    return response.data;
  },

  // Create notification
  createNotification: async (notificationData) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  },

  // Send notification to user
  sendNotificationToUser: async ({ userId, notificationData }) => {
    const response = await api.post(`/notifications/send/${userId}`, notificationData);
    return response.data;
  },

  // Send notification to all users
  sendNotificationToAll: async (notificationData) => {
    const response = await api.post('/notifications/send-all', notificationData);
    return response.data;
  },

  // Get notification templates
  getNotificationTemplates: async () => {
    const response = await api.get('/notifications/templates');
    return response.data;
  },

  // Create notification template
  createNotificationTemplate: async (templateData) => {
    const response = await api.post('/notifications/templates', templateData);
    return response.data;
  },

  // Update notification template
  updateNotificationTemplate: async ({ templateId, templateData }) => {
    const response = await api.put(`/notifications/templates/${templateId}`, templateData);
    return response.data;
  },

  // Delete notification template
  deleteNotificationTemplate: async (templateId) => {
    const response = await api.delete(`/notifications/templates/${templateId}`);
    return response.data;
  }
};
