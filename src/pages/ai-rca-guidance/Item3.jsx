import React from 'react'
import { motion } from 'framer-motion'
import { FaCogs, FaRocket, FaShieldAlt } from 'react-icons/fa'

const Item3 = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI RCA Guidance - Item 3</h1>
        <p className="text-gray-600">Automated workflow optimization and continuous learning</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <FaCogs className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Workflow Automation</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Automatically optimize RCA workflows based on success patterns and team performance metrics.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Process Optimization</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Auto-routing</span>
              <span className="text-sm font-medium text-blue-600">Enabled</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaRocket className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Boost</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Continuous learning system that improves recommendations based on team feedback and outcomes.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Learning Rate</span>
              <span className="text-sm font-medium text-purple-600">+12%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Efficiency Gain</span>
              <span className="text-sm font-medium text-green-600">+28%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Active Features</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">Real-time Analysis</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaCogs className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">Auto-optimization</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaRocket className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">Learning Engine</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Running</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Performance Metrics</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">System Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">1.2s</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Item3
