import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { store } from './store'
import './index.css'

// Import and initialize SuperTokens
import { initSuperTokens } from './config/supertokens.js';
console.log('🚀 Initializing SuperTokens...');
initSuperTokens();
console.log('✅ SuperTokens initialized');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
)
