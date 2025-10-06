import SuperTokens from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import Session from 'supertokens-auth-react/recipe/session';

export const initSuperTokens = () => {
  // Get token configuration from environment variables
  const accessTokenValidityHours = parseInt(import.meta.env.VITE_SUPERTOKENS_ACCESS_TOKEN_VALIDITY_HOURS) || 24;
  const refreshTokenValidityDays = parseInt(import.meta.env.VITE_SUPERTOKENS_REFRESH_TOKEN_VALIDITY_DAYS) || 7;
  
  // Log token configuration
  console.log('🔐 Frontend Token Configuration:');
  console.log(`   Access Token Validity: ${accessTokenValidityHours} hours`);
  console.log(`   Refresh Token Validity: ${refreshTokenValidityDays} days`);
  
  SuperTokens.init({
    appInfo: {
      appName: 'Dexian RCA Dashboard',
      apiDomain: import.meta.env.VITE_API_URL,
      websiteDomain: import.meta.env.VITE_FRONTEND_URL,
      apiBasePath: '/auth',
      websiteBasePath: '/'
    },
    getRedirectionURL: async (context) => {
      if (context.action === "TO_AUTH") {
        return "/login";
      } else if (context.action === "SUCCESS" && context.newSessionCreated) {
        // Handle redirects after successful authentication
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect');
        
        if (redirectPath && redirectPath !== '/login') {
          return redirectPath;
        }
        
        if (context.redirectToPath !== undefined) {
          return context.redirectToPath;
        }
        
        return "/dashboard";
      } else if (context.action === "SIGN_IN_AND_UP") {
        return "/login";
      }
      return undefined;
    },
    recipeList: [
      EmailVerification.init({
        mode: 'REQUIRED',
        sendVerifyEmailScreen: {
          style: {
            container: {
              backgroundColor: '#f8fafc'
            }
          }
        }
      }),
      Passwordless.init({
        contactMethod: 'EMAIL',
        signInUpFeature: {
          disableDefaultUI: true
        }
      }),
      EmailPassword.init({
        signInAndUpFeature: {
          disableDefaultUI: true
        },
        resetPasswordUsingTokenFeature: {
          disableDefaultUI: true
        }
      }),
      Session.init({
        tokenTransferMethod: 'cookie',
        onSessionExpired: () => {
          console.log('🔒 Session expired - redirecting to login');
          // Clear any local storage or cached data
          localStorage.clear();
          sessionStorage.clear();
          // Dispatch custom event for session expiration
          window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: { reason: 'expired' }
          }));
          window.location.href = '/login?expired=true';
        },
        invalidClaimStatusCode: 403,
        autoAddCredentials: true,
        sessionScope: import.meta.env.VITE_SESSION_DOMAIN,
        // Enhanced session configuration
        sessionExpiredStatusCode: 401,
        // Add session refresh handling
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              // Handle session refresh
              refreshSession: async function (input) {
                try {
                  console.log('🔄 Refreshing session...');
                  const result = await originalImplementation.refreshSession(input);
                  
                  // Dispatch custom event for successful refresh
                  window.dispatchEvent(new CustomEvent('sessionRefreshed', {
                    detail: { 
                      success: true,
                      timestamp: new Date().toISOString()
                    }
                  }));
                  
                  return result;
                } catch (error) {
                  console.error('❌ Session refresh failed:', error);
                  
                  // Dispatch custom event for refresh failure
                  window.dispatchEvent(new CustomEvent('sessionRefreshFailed', {
                    detail: { 
                      error: error.message,
                      timestamp: new Date().toISOString()
                    }
                  }));
                  
                  throw error;
                }
              },
              
              // Handle session revocation
              revokeSession: async function (input) {
                try {
                  console.log('🚫 Revoking session...');
                  const result = await originalImplementation.revokeSession(input);
                  
                  // Dispatch custom event for session revocation
                  window.dispatchEvent(new CustomEvent('sessionRevoked', {
                    detail: { 
                      reason: 'manual',
                      timestamp: new Date().toISOString()
                    }
                  }));
                  
                  return result;
                } catch (error) {
                  console.error('❌ Session revocation failed:', error);
                  throw error;
                }
              }
            };
          }
        }
      }),
    ],
    windowHandler: (original) => ({
      ...original,
      location: {
        ...original.location,
        setHref: (href) => {
          console.log('🔗 SuperTokens redirect:', href);
          
          // Fix redirect URLs that point to /auth/login
          if (href.includes('/auth/login')) {
            const fixedHref = href.replace('/auth/login', '/login');
            console.log('🔧 Fixed redirect URL:', fixedHref);
            window.location.href = fixedHref;
          } else {
            window.location.href = href;
          }
        }
      }
    }),
  });
};
