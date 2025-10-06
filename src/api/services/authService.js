// SuperTokens Frontend SDK imports
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import Session from 'supertokens-auth-react/recipe/session';
import api from '../index.js';

// API Base URLs
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Authentication API services using SuperTokens
export const authService = {
  
  // ===========================================
  // REGISTRATION & AUTHENTICATION
  // ===========================================
  
  /**
   * Register a new user using SuperTokens EmailPassword recipe
   */
  register: async (userData) => {
    try {
      console.log('🔐 Registering user with SuperTokens:', userData.email);
      
      const formFields = [
        { id: "email", value: userData.email },
        { id: "password", value: userData.password }
      ];
      
      // Add optional fields if provided
      if (userData.firstName) {
        formFields.push({ id: "firstName", value: userData.firstName });
      }
      if (userData.lastName) {
        formFields.push({ id: "lastName", value: userData.lastName });
      }
      if (userData.phone) {
        formFields.push({ id: "phone", value: userData.phone });
      }
      
      const response = await EmailPassword.signUp({
        formFields
      });
      
      if (response.status === "OK") {
        console.log('✅ User registered successfully');
        return {
          success: true,
          status: response.status,
          user: response.user
        };
      } else if (response.status === "FIELD_ERROR") {
        return {
          success: false,
          status: response.status,
          formFields: response.formFields
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "Registration failed"
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  /**
   * Sign in user using SuperTokens EmailPassword recipe
   */
  login: async (credentials) => {
    try {
      console.log('🔐 Signing in user with SuperTokens:', credentials.email);
      
      const response = await EmailPassword.signIn({
        formFields: [
          { id: "email", value: credentials.email },
          { id: "password", value: credentials.password }
        ]
      });
      
      if (response.status === "OK") {
        console.log('✅ User signed in successfully');
        
        // Check if email verification is required
        const emailVerificationStatus = await EmailVerification.isEmailVerified();
        
        return {
          success: true,
          status: response.status,
          user: response.user,
          isEmailVerified: emailVerificationStatus.status === "OK"
        };
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        return {
          success: false,
          status: response.status,
          message: "Invalid email or password"
        };
      } else if (response.status === "FIELD_ERROR") {
        return {
          success: false,
          status: response.status,
          formFields: response.formFields
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "Login failed"
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  /**
   * Sign out user using SuperTokens
   */
  logout: async () => {
    try {
      console.log('🔐 Signing out user');
      await Session.signOut();
      
      // Clear all local storage and session storage to ensure clean state
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ User signed out successfully and all local data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  forceLogout: async () => {
    try {
        const response = await api.post('/users/logout')
        return response;
      } catch (error) {
        console.error('❌ Force logout error:', error);
        return { success: false, message: error.message };
      }
  },

  // ===========================================
  // EMAIL VERIFICATION
  // ===========================================
  
  /**
   * Send email verification link
   */
  sendEmailVerification: async () => {
    try {
      console.log('📧 Sending email verification');
      
      const response = await EmailVerification.sendVerificationEmail();
      
      if (response.status === "OK") {
        console.log('✅ Email verification sent successfully');
        return { success: true, status: response.status };
      } else if (response.status === "EMAIL_ALREADY_VERIFIED_ERROR") {
        return { 
          success: false, 
          status: response.status, 
          message: "Email is already verified" 
        };
      } else {
        return { 
          success: false, 
          status: response.status, 
          message: "Failed to send verification email" 
        };
      }
    } catch (error) {
      console.error('❌ Send email verification error:', error);
      throw error;
    }
  },

  /**
   * Verify email using token from URL
   */
  verifyEmailToken: async () => {
    try {
      console.log('📧 Verifying email token');
      
      const response = await EmailVerification.verifyEmail();
      
      if (response.status === "OK") {
        console.log('✅ Email verified successfully');
        return { success: true, status: response.status };
      } else if (response.status === "EMAIL_VERIFICATION_INVALID_TOKEN_ERROR") {
        return { 
          success: false, 
          status: response.status, 
          message: "Invalid verification token" 
        };
      } else {
        return { 
          success: false, 
          status: response.status, 
          message: "Email verification failed" 
        };
      }
    } catch (error) {
      console.error('❌ Verify email token error:', error);
      throw error;
    }
  },

  /**
   * Check if email is verified
   */
  checkEmailVerification: async () => {
    try {
      const response = await EmailVerification.isEmailVerified();
      return {
        success: true,
        isVerified: response.status === "OK"
      };
    } catch (error) {
      console.error('❌ Check email verification error:', error);
      return { success: false, isVerified: false };
    }
  },

  // ===========================================
  // OTP FUNCTIONALITY (Passwordless)
  // ===========================================
  
  /**
   * Send OTP to email using SuperTokens Passwordless recipe
   */
  sendOTP: async (email) => {
    try {
      console.log('📧 Sending OTP to:', email);
      
      const response = await Passwordless.createCode({
        email
      });
      
      if (response.status === "OK") {
        console.log('✅ OTP sent successfully');
        return {
          success: true,
          status: response.status,
          deviceId: response.deviceId,
          preAuthSessionId: response.preAuthSessionId,
          flowType: response.flowType
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "Failed to send OTP"
        };
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      throw error;
    }
  },

  /**
   * Verify OTP using SuperTokens Passwordless recipe
   */
  verifyOTP: async (deviceId, preAuthSessionId, userInputCode) => {
    try {
      console.log('🔐 Verifying OTP');
      
      const response = await Passwordless.consumeCode({
        deviceId,
        preAuthSessionId,
        userInputCode
      });
      
      if (response.status === "OK") {
        console.log('✅ OTP verified successfully');
        return {
          success: true,
          status: response.status,
          user: response.user,
          createdNewRecipeUser: response.createdNewRecipeUser
        };
      } else if (response.status === "INCORRECT_USER_INPUT_CODE_ERROR") {
        return {
          success: false,
          status: response.status,
          message: "Incorrect OTP code",
          failedCodeInputAttemptCount: response.failedCodeInputAttemptCount,
          maximumCodeInputAttempts: response.maximumCodeInputAttempts
        };
      } else if (response.status === "EXPIRED_USER_INPUT_CODE_ERROR") {
        return {
          success: false,
          status: response.status,
          message: "OTP code has expired"
        };
      } else if (response.status === "RESTART_FLOW_ERROR") {
        return {
          success: false,
          status: response.status,
          message: "Please restart the verification flow"
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "OTP verification failed"
        };
      }
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      throw error;
    }
  },

  /**
   * Resend OTP
   */
  resendOTP: async (deviceId, preAuthSessionId) => {
    try {
      console.log('📧 Resending OTP');
      
      const response = await Passwordless.resendCode({
        deviceId,
        preAuthSessionId
      });
      
      if (response.status === "OK") {
        console.log('✅ OTP resent successfully');
        return { success: true, status: response.status };
      } else if (response.status === "RESTART_FLOW_ERROR") {
        return {
          success: false,
          status: response.status,
          message: "Please restart the verification flow"
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "Failed to resend OTP"
        };
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      throw error;
    }
  },

  // ===========================================
  // PASSWORD RESET
  // ===========================================
  
  /**
   * Send password reset email
   */
  sendPasswordReset: async (email) => {
    try {
      console.log('📧 Sending password reset email to:', email);
      
      const response = await EmailPassword.sendPasswordResetEmail({
        formFields: [
          { id: "email", value: email }
        ]
      });
      
      if (response.status === "OK") {
        console.log('✅ Password reset email sent successfully');
        return { success: true, status: response.status };
      } else if (response.status === "FIELD_ERROR") {
        return {
          success: false,
          status: response.status,
          formFields: response.formFields
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "Failed to send password reset email"
        };
      }
    } catch (error) {
      console.error('❌ Send password reset error:', error);
      throw error;
    }
  },

  /**
   * Reset password using token
   */
  resetPassword: async (formFields) => {
    try {
      console.log('🔐 Resetting password');
      
      const response = await EmailPassword.submitNewPassword({
        formFields
      });
      
      if (response.status === "OK") {
        console.log('✅ Password reset successfully');
        return { success: true, status: response.status };
      } else if (response.status === "FIELD_ERROR") {
        return {
          success: false,
          status: response.status,
          formFields: response.formFields
        };
      } else if (response.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        return {
          success: false,
          status: response.status,
          message: "Invalid or expired password reset token"
        };
      } else {
        return {
          success: false,
          status: response.status,
          message: "Password reset failed"
        };
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw error;
    }
  },

  // ===========================================
  // SESSION MANAGEMENT
  // ===========================================
  
  /**
   * Check session status - lightweight validation endpoint
   */
  checkSessionStatus: async () => {
    try {
      console.log('🔍 Checking session status with backend...');
      
      // First check if session exists locally
      const sessionExists = await Session.doesSessionExist();
      if (!sessionExists) {
        return { 
          success: false, 
          message: 'No session exists' 
        };
      }

      // Call the lightweight session status endpoint (using simple version for debugging)
      const response = await api.get('/users/session/status/simple');
      
      console.log('✅ Session status check successful:', response.data);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Session status check error:', error.response?.data || error.message);
      
      // Return the error response from backend
      return { 
        success: false, 
        message: error.response?.data?.message || error.message,
        sessionRevoked: error.response?.data?.sessionRevoked || false
      };
    }
  },

  /**
   * Get current session with comprehensive user data from backend
   */
  getSession: async () => {
    try {
      console.log('🔍 Getting session data from backend...');
      
      // First check if session exists locally
      const sessionExists = await Session.doesSessionExist();
      if (!sessionExists) {
        return { 
          success: false, 
          message: 'No session exists' 
        };
      }

      // Get comprehensive session info from backend
      const response = await api.get('/users/session/info');
      
      console.log('✅ Session data retrieved from backend:', response.data);
      
      return {
        success: true,
        session: response.data.data.session,
        user: response.data.data.user,
        mongoUser: response.data.data.mongoUser
      };
    } catch (error) {
      console.error('❌ Get session error:', error.response?.data || error.message);
      
      // If session exists locally but backend call fails, session might be corrupted
      if (await Session.doesSessionExist()) {
        console.log('⚠️ Local session exists but backend validation failed');
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    try {
      return await Session.doesSessionExist();
    } catch (error) {
      console.error('❌ Authentication check error:', error);
      return false;
    }
  },

  // ===========================================
  // USER DATA
  // ===========================================
  
  /**
   * Get user profile data from backend
   */
  getUserProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Get user profile error:', error);
      throw error;
    }
  },

  verifyUserWithToken: async (token) =>{
    try{
      const response = api.get(``)
    } catch(error){

    }
  },

  ping: async () =>{
    try{
      const response = await api.get('/health');
      return response;
    } catch (error){
      console.log("error",error);
      return error;
    }
  }
};

export default authService;
