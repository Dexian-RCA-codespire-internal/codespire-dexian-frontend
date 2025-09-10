import SuperTokens from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import Session from 'supertokens-auth-react/recipe/session';

export const initSuperTokens = () => {
  SuperTokens.init({
    appInfo: {
      appName: 'Dexian RCA Dashboard',
      apiDomain: 'http://localhost:8081', // Backend URL
      websiteDomain: 'http://localhost:3001', // Frontend URL
    },
    getRedirectionURL: async (context) => {
      if (context.action === "TO_AUTH") {
        // Redirect unauthenticated users to the custom login page
        return "/login";
      } else if (context.action === "SUCCESS" && context.newSessionCreated) {
        // Redirect authenticated users to the dashboard or intended path
        if (context.redirectToPath !== undefined) {
          return context.redirectToPath;
        }
        return "/";
      }
      return undefined;
    },
    recipeList: [
      EmailVerification.init({
        mode: 'REQUIRED', // Email verification is required
      }),
      EmailPassword.init({
        // Use custom UI components - no prebuilt UI
        signInAndUpFeature: {
          disableDefaultUI: true, // Disable SuperTokens default UI
        },
      }),
      Session.init({
        tokenTransferMethod: 'cookie',
        onSessionExpired: () => {
          window.location.href = '/login';
        },
      }),
    ],
  });
};
