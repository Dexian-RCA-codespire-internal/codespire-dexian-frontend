import React from 'react'
import { Helmet } from 'react-helmet-async'
import { SuperTokensWrapper } from 'supertokens-auth-react'
import RoutesIndex from './routes'
import useWebSocketOnly from './hooks/useWebSocketOnly'
import ToastContainer from './components/ui/ToastContainer'
// import './utils/websocketChecks' // Disabled - notification system correctly uses REST API + WebSocket

function AppContent() {
  // Initialize WebSocket connection
  useWebSocketOnly(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081');

  return (
    <>
      <Helmet>
        <title>Dexian RCA Dashboard</title>
      </Helmet>

      <main className="h-full">
        <RoutesIndex />
      </main>



      {/* Toast Notifications */}
      <ToastContainer />
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
