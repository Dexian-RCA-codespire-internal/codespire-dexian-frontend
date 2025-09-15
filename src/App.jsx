import React from 'react'
import { Helmet } from 'react-helmet-async'
import { SuperTokensWrapper } from 'supertokens-auth-react'
import RoutesIndex from './routes'
import useWebSocketOnly from './hooks/useWebSocketOnly'
import NotificationContainer from './components/ui/NotificationContainer'
import './utils/websocketChecks' // Import to activate API call monitoring (DEVELOPMENT ONLY - REMOVE IN PRODUCTION)

function AppContent() {
  const {
    isConnected,
    connectionError,
    notifications,
    removeNotification,
    clearNotifications
  } = useWebSocketOnly(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081');

  return (
    <>
      <Helmet>
        <title>Dexian RCA Dashboard</title>
      </Helmet>

      <main className="h-full">
        <RoutesIndex />
      </main>

      {/* WebSocket Connection Status Indicator */}
      {connectionError && (
        <div className="fixed bottom-4 left-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Connection Error: {connectionError}
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemoveNotification={removeNotification}
        onClearNotifications={clearNotifications}
      />
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
