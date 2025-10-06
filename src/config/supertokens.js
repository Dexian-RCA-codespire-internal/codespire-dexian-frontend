import SuperTokens from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import Session from 'supertokens-auth-react/recipe/session';

export const initSuperTokens = () => {

  
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
        sessionExpiredStatusCode: 401,
        invalidClaimStatusCode: 403,
        autoAddCredentials: true,
        sessionScope: import.meta.env.VITE_SESSION_DOMAIN || 'localhost',
        // Remove aggressive session expiry handler to prevent loops
        onSessionExpired: () => {

          // Only dispatch event, don't redirect immediately
          window.dispatchEvent(new CustomEvent('sessionExpired', {
            detail: { reason: 'expired' }
          }));
        },
        // Add session refresh handling
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              // Handle session refresh with better error handling
              refreshSession: async function (input) {
                try {
              const result = await originalImplementation.refreshSession(input);
                  
                  
                  // Dispatch refresh success event
                  window.dispatchEvent(new CustomEvent('sessionRefreshed', {
                    detail: { result }
                  }));
                  
                  return result;
                } catch (error) {
              
                  
                  // Dispatch refresh failed event
                  window.dispatchEvent(new CustomEvent('sessionRefreshFailed', {
                    detail: { error: error.message }
                  }));
                  
                  // Only redirect on specific errors
                  if (error.message.includes('UNAUTHORISED') || error.message.includes('invalid refresh token')) {
                    // Clear session and redirect
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login?expired=true';
                  }
                  
                  throw error;
                }
              },
              
              // Handle session validation
              getSession: async function (input) {
                try {
                  const result = await originalImplementation.getSession(input);
                  return result;
                } catch (error) {
          
                  
                  // Only redirect on unauthorized errors, not on network issues
                  if (error.message.includes('UNAUTHORISED') && !window.location.pathname.includes('/login')) {
              
                    window.location.href = '/login?expired=true';
                  }
                  
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
   
          
          if (href.includes('/auth/login')) {
            const fixedHref = href.replace('/auth/login', '/login');
      
            window.location.href = fixedHref;
          } else {
            window.location.href = href;
          }
        }
      }
    }),
  });
};
