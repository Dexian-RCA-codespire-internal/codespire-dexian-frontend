import api from '../index.js';

// Email Verification API services
export const emailVerificationService = {
  // Send OTP for email verification
  sendOTP: async (email) => {
    try {
      console.log('Sending OTP for email verification:', email);
      const response = await api.post('/api/v1/email-verification/send-otp', {
        email: email
      });
      console.log('Send OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp, deviceId, preAuthSessionId) => {
    try {
      console.log('Verifying OTP for email:', email);
      const response = await api.post('/api/v1/email-verification/verify-otp', {
        email: email,
        otp: otp,
        deviceId: deviceId,
        preAuthSessionId: preAuthSessionId
      });
      console.log('Verify OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check email verification status
  checkVerificationStatus: async (email) => {
    try {
      console.log('Checking verification status for email:', email);
      const response = await api.get(`/api/v1/email-verification/status?email=${encodeURIComponent(email)}`);
      console.log('Verification status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Check verification status error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Resend verification (OTP or Magic Link)
  resendVerification: async (email, method = 'otp') => {
    try {
      console.log('Resending verification for email:', email, 'method:', method);
      const response = await api.post('/api/v1/email-verification/resend', {
        email: email,
        method: method // 'otp' or 'magic_link'
      });
      console.log('Resend verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Handle magic link verification (when user clicks link from email)
  verifyMagicLink: async (token) => {
    try {
      console.log('Verifying magic link token:', token);
      const response = await api.post('/api/v1/email-verification/verify-magic-link', {
        token: token
      });
      console.log('Verify magic link response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify magic link error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default emailVerificationService;
