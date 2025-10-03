import api from '../index.js';

// Permission management API services
export const permissionService = {
  /**
   * Get current user's permissions from MongoDB via backend
   * @returns {Promise<Object>} User permissions
   */
  getCurrentUserPermissions: async () => {
    try {
      console.log(' [PermissionService] Getting current user permissions from MongoDB...');
      console.log('   API endpoint: /rbac/debug/current-user');
      
      const response = await api.get('/rbac/debug/current-user');
      
      console.log(' [PermissionService] MongoDB permissions response:');
      console.log('   Status:', response.status);
      console.log('   Data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(' [PermissionService] Error getting current user permissions:', error);
      console.error('   Error:', error);
      console.error('   Response:', error.response?.data);
      console.error('   Status:', error.response?.status);
      throw error;
    }
  },

  /**
   * Check if current user has a specific permission from MongoDB
   * @param {string} permission - Permission to check (e.g., 'users:read', 'tickets:write')
   * @returns {Promise<boolean>} True if user has permission
   */
  hasPermission: async (permission) => {
    try {
      console.log('[PermissionService] Checking permission from MongoDB:', permission);
      
      const response = await permissionService.getCurrentUserPermissions();
      
      if (response.success && response.permissions) {
        const hasPermission = response.permissions.includes(permission);
        console.log('   Has permission:', hasPermission);
        return hasPermission;
      }
      
      console.log('   No permissions found or response not successful');
      return false;
    } catch (error) {
      console.error('[PermissionService] Error checking permission:', permission);
      console.error('   Error:', error);
      return false;
    }
  },

  /**
   * Check if current user has any of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {Promise<boolean>} True if user has any of the permissions
   */
  hasAnyPermission: async (permissions) => {
    try {
      const response = await permissionService.getCurrentUserPermissions();
      if (response.success && response.permissions) {
        return permissions.some(permission => response.permissions.includes(permission));
      }
      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  },

  /**
   * Check if current user has all of the specified permissions
   * @param {string[]} permissions - Array of permissions to check
   * @returns {Promise<boolean>} True if user has all permissions
   */
  hasAllPermissions: async (permissions) => {
    try {
      const response = await permissionService.getCurrentUserPermissions();
      if (response.success && response.permissions) {
        return permissions.every(permission => response.permissions.includes(permission));
      }
      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  },

  /**
   * Get current user's roles from MongoDB
   * @returns {Promise<string[]>} Array of user roles
   */
  getCurrentUserRoles: async () => {
    try {
      const response = await permissionService.getCurrentUserPermissions();
      if (response.success && response.roles) {
        return response.roles;
      }
      return [];
    } catch (error) {
      console.error('Error getting current user roles:', error);
      return [];
    }
  },

  /**
   * Check if current user has a specific role
   * @param {string} role - Role to check
   * @returns {Promise<boolean>} True if user has role
   */
  hasRole: async (role) => {
    try {
      const roles = await permissionService.getCurrentUserRoles();
      return roles.includes(role);
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  },

  /**
   * Check if current user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {Promise<boolean>} True if user has any of the roles
   */
  hasAnyRole: async (roles) => {
    try {
      const userRoles = await permissionService.getCurrentUserRoles();
      return roles.some(role => userRoles.includes(role));
    } catch (error) {
      console.error('Error checking roles:', error);
      return false;
    }
  }
};
