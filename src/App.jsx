import React from 'react'
import { Helmet } from 'react-helmet-async'
import { SuperTokensWrapper } from 'supertokens-auth-react'
import RoutesIndex from './routes'
import useWebSocketOnly from './hooks/useWebSocketOnly'
import NotificationContainer from './components/ui/NotificationContainer'
import './utils/websocketChecks' // Import to activate API call monitoring (DEVELOPMENT ONLY - REMOVE IN PRODUCTION)

function AppContent() {
  const {
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
