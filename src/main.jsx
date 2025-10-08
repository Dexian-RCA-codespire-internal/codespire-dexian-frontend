import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { store } from './store'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import './index.css'

// Import and initialize SuperTokens
import { initSuperTokens } from './config/supertokens.js';
console.log('🚀 Initializing SuperTokens...');
initSuperTokens();
console.log('✅ SuperTokens initialized');

// Only use StrictMode in development to prevent duplicate toast notifications in production
const isDevelopment = import.meta.env.DEV;

const AppWrapper = ({ children }) => {
  if (isDevelopment) {
    return <>{children}</>;
  }
  return children;
};

createRoot(document.getElementById('root')).render(
  <AppWrapper>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </AppWrapper>
)
