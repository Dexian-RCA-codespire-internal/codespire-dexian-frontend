import React from 'react'
import { motion } from 'framer-motion'
import { FaCog, FaHammer, FaRocket } from 'react-icons/fa'

const WorkInProgress = ({ title = "Work in Progress" }) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <FaCog className="w-16 h-16 text-blue-500" />
      </motion.div>
      
      <motion.h2 
        className="text-3xl font-bold text-gray-900 mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h2>
      
      <motion.p 
        className="text-lg text-gray-600 mb-8 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        This feature is currently under development. We're working hard to bring you something amazing!
      </motion.p>
      
      <motion.div 
        className="flex items-center space-x-4 text-sm text-gray-500"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-2">
          <FaHammer className="w-4 h-4" />
          <span>Building</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaRocket className="w-4 h-4" />
          <span>Coming Soon</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default WorkInProgress
