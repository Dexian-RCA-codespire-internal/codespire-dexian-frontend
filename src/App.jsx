import React from 'react'
import { Helmet } from 'react-helmet-async'
import RoutesIndex from './routes'
import { motion } from 'framer-motion'


export default function App() {

  return (
    <>
      <Helmet>
        <title>Codespire RFQ</title>
      </Helmet>

      <main className="h-full">
        <RoutesIndex />
      </main>
    </>
  )
}
