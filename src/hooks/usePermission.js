import { useState, useEffect } from 'react';
import { permissionService } from '../api/services/permissionService';

/**
 * Custom hook for checking user permissions
 * @param {string} permission - The permission to check (e.g., 'tickets:write')
 * @returns {Object} - { hasPermission, loading, error }
 */
export const usePermission = (permission) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!permission) {
          setHasPermission(false);
          setLoading(false);
          return;
        }

        const result = await permissionService.hasPermission(permission);
        setHasPermission(result);
      } catch (err) {
        console.error('Error checking permission:', err);
        setError(err);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permission]);

  return { hasPermission, loading, error };
};

/**
 * Custom hook for checking multiple permissions
 * @param {string[]} permissions - Array of permissions to check
 * @param {string} mode - 'any' (default) or 'all' - whether user needs any or all permissions
 * @returns {Object} - { hasPermission, loading, error }
 */
export const usePermissions = (permissions = [], mode = 'any') => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!permissions || permissions.length === 0) {
          setHasPermission(false);
          setLoading(false);
          return;
        }

        let result;
        if (mode === 'all') {
          result = await permissionService.hasAllPermissions(permissions);
        } else {
          result = await permissionService.hasAnyPermission(permissions);
        }
        
        setHasPermission(result);
      } catch (err) {
        console.error('Error checking permissions:', err);
        setError(err);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [permissions, mode]);

  return { hasPermission, loading, error };
};

export default usePermission;
