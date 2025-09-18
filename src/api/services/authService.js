import api from '../index.js';

// SuperTokens API Base URLs
const SUPERTOKENS_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/auth`;
const OTP_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/v1/otp`;

// Authentication API services
export const authService = {
  // SuperTokens User Registration
  signup: async (userData) => {
    const response = await fetch(`${SUPERTOKENS_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'rid': 'emailpassword'
      },
      credentials: 'include',
      body: JSON.stringify({
        formFields: [
          {
            id: "email",
            value: userData.email
          },
          {
            id: "password",
            value: userData.password
          },
          {
            id: "firstName",
            value: userData.firstName
          },
          {
            id: "lastName",
            value: userData.lastName
          },
          {
            id: "phone",
            value: userData.phone
          }
        ]
      })
    });
    return await response.json();
  },

  // SuperTokens User Sign In
  signin: async (credentials) => {
    const response = await fetch(`${SUPERTOKENS_BASE_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'rid': 'emailpassword'
      },
      credentials: 'include',
      body: JSON.stringify({
        formFields: [
          {
            id: "email",
            value: credentials.email
          },
          {
            id: "password",
            value: credentials.password
          }
        ]
      })
    });
    return await response.json();
  },

  // SuperTokens Send OTP
  sendOTP: async (email) => {
    const response = await fetch(`${OTP_BASE_URL}/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email
      })
    });
    return await response.json();
  },

  // SuperTokens Verify OTP
  verifyOTP: async (email, otp, deviceId, preAuthSessionId) => {
    const response = await fetch(`${OTP_BASE_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        otp: otp,
        deviceId: deviceId,
        preAuthSessionId: preAuthSessionId
      })
    });
    return await response.json();
  },

  // SuperTokens Resend OTP
  resendOTP: async (email, deviceId, preAuthSessionId) => {
    const response = await fetch(`${OTP_BASE_URL}/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email,
        deviceId: deviceId,
        preAuthSessionId: preAuthSessionId
      })
    });
    return await response.json();
  },

  // SuperTokens Send Magic Link
  sendMagicLink: async (email) => {
    const response = await fetch(`${OTP_BASE_URL}/send-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email
      })
    });
    return await response.json();
  },

  // SuperTokens Verify Magic Link
  verifyMagicLink: async (token) => {
    const response = await fetch(`${OTP_BASE_URL}/verify-magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        token: token
      })
    });
    return await response.json();
  },

  // SuperTokens Check Verification Status
  checkVerificationStatus: async (email) => {
    const response = await fetch(`${OTP_BASE_URL}/check-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: email
      })
    });
    return await response.json();
  },

  // SuperTokens User Logout
  logout: async () => {
    const response = await fetch(`${SUPERTOKENS_BASE_URL}/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    return await response.json();
  },

  // SuperTokens Get Session Info (only called manually when needed)
  getSession: async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    
    // Use cached working endpoint if available
    const cachedEndpoint = localStorage.getItem('workingSessionEndpoint');
    const endpoint = cachedEndpoint || `${baseUrl}/auth/session`;
    
    try {
      console.log('🔍 Checking session at:', endpoint);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'rid': 'anti-csrf'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session check successful');
        // Cache the working endpoint
        if (!cachedEndpoint) {
          localStorage.setItem('workingSessionEndpoint', endpoint);
        }
        return data;
      } else {
        console.log(`❌ Session check failed: ${response.status} ${response.statusText}`);
        throw new Error(`Session check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Session check error:', error);
      throw error;
    }
  },

  // SuperTokens Refresh Session
  refreshSession: async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    const possibleEndpoints = [
      `${baseUrl}/auth/session/refresh`,
      `${baseUrl}/api/v1/auth/session/refresh`,
      `${baseUrl}/session/refresh`,
      `${baseUrl}/api/session/refresh`
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log('🔄 Trying refresh endpoint:', endpoint);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'rid': 'anti-csrf'
          },
          credentials: 'include'
        });
        
        console.log(`📡 ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Refresh endpoint found:', endpoint, data);
          return data;
        } else {
          console.log(`❌ ${endpoint} failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} error:`, error.message);
      }
    }
    
    throw new Error('No valid refresh endpoint found. Check console for attempted endpoints.');
  },

  // Legacy methods for backward compatibility
  login: async (credentials) => {
    return await authService.signin(credentials);
  },

  register: async (userData) => {
    return await authService.signup(userData);
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Debug function to test session endpoints
  testSessionEndpoints: async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
    const endpoints = [
      `${baseUrl}/auth/session`,
      `${baseUrl}/api/v1/auth/session`,
      `${baseUrl}/session`,
      `${baseUrl}/api/session`,
      `${baseUrl}/api/v1/session`
    ];

    console.log('🔍 Testing session endpoints...');
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'rid': 'anti-csrf'
          },
          credentials: 'include'
        });
        
        console.log(`📡 ${endpoint}: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Success:', data);
          return { endpoint, data };
        } else {
          // Try to get error details
          try {
            const errorData = await response.text();
            console.log(`❌ ${endpoint} error details:`, errorData);
          } catch (e) {
            console.log(`❌ ${endpoint} error: Could not read error response`);
          }
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`);
      }
    }
    
    return null;
  },

  // Simple session test function
  testSession: async () => {
    try {
      console.log('🧪 Testing session...');
      const result = await authService.getSession();
      console.log('✅ Session test successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Session test failed:', error);
      return null;
    }
  }
};
