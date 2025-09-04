import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import RoutesIndex from './routes'
import { io } from 'socket.io-client'

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
  autoConnect: true
})

export default function App() {
  React.useEffect(() => {
    socket.on('connect', () => console.log('socket connected', socket.id))
    return () => socket.off('connect')
  }, [])

  return (
    <>
      <Helmet>
        <title>Codespire RFQ</title>
      </Helmet>

      <main className="h-full bg-gray-50 text-gray-900">
        <div className="mx-auto p-6">
          <motion.h1
            className="text-2xl font-semibold mb-4"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            RFQ Frontend
          </motion.h1>

          <RoutesIndex />
        </div>
      </main>
    </>
  )
}
