import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16">
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
