import React from 'react'
import { Helmet } from 'react-helmet-async'
import { SuperTokensWrapper } from 'supertokens-auth-react'
import RoutesIndex from './routes'

function AppContent() {
  return (
    <>
      <Helmet>
        <title>Dexian RCA Dashboard</title>
      </Helmet>

      <main className="h-full">
        <RoutesIndex />
      </main>
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
