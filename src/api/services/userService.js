import api from '../index.js';

// User management API services
export const userService = {
  // Get paginated users with filtering
  getUsers: async (params = {}) => {
    const response = await api.get('/v1/users', { params });
    return response.data;
  },

  // Get user statistics
  getUserStats: async (params = {}) => {
    const response = await api.get('/v1/users/stats', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/v1/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/v1/users', userData);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/v1/users/${userId}/status`, { status });
    return response.data;
  },

  // Update user roles
  updateUserRoles: async (userId, roles) => {
    const response = await api.put(`/v1/users/${userId}/roles`, { roles });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/v1/users/${userId}`);
    return response.data;
  },

  // Get user permissions
  getUserPermissions: async (userId) => {
    const response = await api.get(`/v1/users/${userId}/permissions`);
    return response.data;
  },

  // Send OTP to user email for verification
  sendUserOTP: async (email) => {
    const response = await api.post('/v1/users/send-otp', { email });
    return response.data;
  },

  // Verify OTP code for user email verification
  verifyUserOTP: async (email, otp, deviceId = null, preAuthSessionId = null) => {
    const response = await api.post('/v1/users/verify-otp', {
      email,
      otp,
      deviceId,
      preAuthSessionId
    });
    return response.data;
  },

  // Resend OTP code to user email
  resendUserOTP: async (email, deviceId = null, preAuthSessionId = null) => {
    const response = await api.post('/v1/users/resend-otp', {
      email,
      deviceId,
      preAuthSessionId
    });
    return response.data;
  }
};
