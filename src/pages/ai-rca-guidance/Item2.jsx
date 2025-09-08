import React from 'react'
import { motion } from 'framer-motion'
import { FaBrain, FaSearch, FaCheckCircle } from 'react-icons/fa'

const Item2 = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI RCA Guidance - Item 2</h1>
        <p className="text-gray-600">Advanced machine learning models for root cause prediction</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaBrain className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">ML Models</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Sophisticated machine learning models trained on thousands of incident reports to predict root causes.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Accuracy Rate</span>
              <span className="font-medium text-green-600">94.2%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Training Data</span>
              <span className="font-medium text-blue-600">15,000+ incidents</span>
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaSearch className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Deep Analysis</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Multi-layered analysis that considers system dependencies, timing patterns, and environmental factors.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Analysis Depth</span>
              <span className="font-medium text-purple-600">Level 3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processing Time</span>
              <span className="font-medium text-green-600">2.3s avg</span>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">High Confidence</h4>
            <p className="text-2xl font-bold text-green-600">87%</p>
            <p className="text-sm text-gray-600">Predictions</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FaBrain className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Model Accuracy</h4>
            <p className="text-2xl font-bold text-blue-600">94.2%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <FaSearch className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Coverage</h4>
            <p className="text-2xl font-bold text-purple-600">96%</p>
            <p className="text-sm text-gray-600">Incident Types</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Item2
