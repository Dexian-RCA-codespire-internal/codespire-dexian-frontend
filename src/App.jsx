import React from 'react'
import { Helmet } from 'react-helmet-async'
import { SuperTokensWrapper } from 'supertokens-auth-react'
import RoutesIndex from './routes'
import useWebSocketOnly from './hooks/useWebSocketOnly'
import ToastContainer from './components/ui/ToastContainer'
import SessionManager from './components/SessionManager'


function AppContent() {
  // Initialize WebSocket connection and get notification handlers
   useWebSocketOnly(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081');

  return (
    <>
      <Helmet>
        <title>Dexian RCA Dashboard</title>
      </Helmet>

      <SessionManager>
        <main className="h-full">
          <RoutesIndex />
        </main>

        {/* Toast Notifications */}
        <ToastContainer />
        
 
      </SessionManager>
    </>
  )
}

export default function App() {
  return (
    <SuperTokensWrapper>
      <AppContent />
    </SuperTokensWrapper>
  )
}
