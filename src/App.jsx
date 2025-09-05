import React from 'react'
import { Helmet } from 'react-helmet-async'
import RoutesIndex from './routes'

export default function App() {
  return (
    <>
      <Helmet>
        <title>Codespire RCA Dashboard</title>
      </Helmet>
      <RoutesIndex />
    </>
  )
}
