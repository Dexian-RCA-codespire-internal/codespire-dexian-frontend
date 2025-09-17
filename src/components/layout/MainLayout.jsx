import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import Sidebar from './Sidebar'
import SubSidebar from './SubSidebar'
import ChatBot from '../ChatBot/ChatBot'
import { isChatbotEnabled } from '../../config/navigation'

const MainLayout = () => {
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(false)

  const subItems = [
    { path: '/rca-dashboard', label: 'RCA Dashboard' },
    { path: '/ai-rca-guidance/add-integration', label: 'Add Integration' }
  ]

  const handleSubSidebarToggle = (isOpen) => {
    setIsSubSidebarOpen(isOpen)
  }

  const handleSubSidebarClose = () => {
    setIsSubSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex pt-16">
        {/* Fixed Sidebar */}
        <Sidebar onSubSidebarToggle={handleSubSidebarToggle} />
        
        {/* Sub Sidebar */}
        <SubSidebar 
          isOpen={isSubSidebarOpen} 
          onClose={handleSubSidebarClose}
          subItems={subItems}
        />
        
        {/* Main Content */}
        <main className="flex-1 ml-16 p-6">
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
      
      {/* Global ChatBot - Available on all pages (if enabled) */}
      {isChatbotEnabled() && <ChatBot />}
    </div>
  )
}

export default MainLayout
